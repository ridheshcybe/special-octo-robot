import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { getStudentActivity } from "@/app/prepmeup/_lib/studentStore";

function formatAttemptDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Recently";
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    if (isToday) return `Today, ${timeStr}`;
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${timeStr}`;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + `, ${timeStr}`;
  } catch {
    return "Recently";
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const studentSession = cookieStore.get("pmu-session");
    const adminSession = cookieStore.get("pmu-admin-session");

    if (!studentSession?.value && !adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Please log in to view progress." }, { status: 401 });
    }

    let studentId = "mock-student-id";
    if (studentSession?.value) {
      try {
        const parsed = JSON.parse(studentSession.value);
        if (parsed.userId) studentId = parsed.userId;
      } catch {}
    }

    // 1. Gather Real Attempts from Student Activity Store & Database
    const activity = getStudentActivity(studentId);
    let attemptsList: Array<{
      id: string;
      quizTitle: string;
      score: number;
      totalMarks: number;
      percentage: number;
      date: string;
      breakdown?: any[];
      errorsDetected?: string[];
      explanationMarkdown?: string;
    }> = [];

    // Add in-memory submitted attempts
    for (const a of activity.quizAttempts) {
      const missedQuestions = (a.breakdown || []).filter((b) => !b.isCorrect);
      const errorsDetected = missedQuestions.map(
        (m) => `Missed: "${m.questionText.slice(0, 80)}…" — Your Answer: ${m.studentAnswer}`
      );
      const explanationMarkdown = missedQuestions.length > 0
        ? `### Detailed Solution & Corrections\n\n` +
          missedQuestions
            .map((m, idx) => `**Question ${idx + 1}:** ${m.questionText}\n\n${m.explanation ? `> **Explanation:** ${m.explanation}` : ""}`)
            .join("\n\n---\n\n")
        : `### Verified Accurate Solution\n\nAll questions in **${a.quizTitle}** were answered correctly! Mastery confirmed.`;

      attemptsList.push({
        id: a.id,
        quizTitle: a.quizTitle,
        score: a.score,
        totalMarks: a.totalMarks,
        percentage: a.percentage,
        date: formatAttemptDate(a.submittedAt),
        breakdown: a.breakdown,
        errorsDetected,
        explanationMarkdown,
      });
    }

    // Also check Supabase if serviceClient is available
    const serviceClient = createPmuServiceClient();
    if (serviceClient && studentId !== "mock-student-id") {
      try {
        const { data: dbAttempts } = await serviceClient
          .from("pmu_quiz_attempts")
          .select("*, quiz:pmu_quizzes(title)")
          .eq("student_id", studentId)
          .order("created_at", { ascending: false });

        if (dbAttempts && dbAttempts.length > 0) {
          for (const da of dbAttempts) {
            if (!attemptsList.some((existing) => existing.id === da.id)) {
              attemptsList.push({
                id: da.id,
                quizTitle: da.quiz?.title || "Quiz Assessment",
                score: da.score || 0,
                totalMarks: da.total_marks || 0,
                percentage: da.percentage || 0,
                date: formatAttemptDate(da.created_at),
              });
            }
          }
        }
      } catch {}
    }

    // 2. Compute Real Dynamic Statistics
    const totalQuizzesAttempted = attemptsList.length;
    let averageAccuracy = 0;
    let overallCompletion = 0;
    let studyHours = 0;
    const weakTopics: Array<{ topic: string; subject: string; accuracy: number; reviewUrl: string }> = [];
    const strongTopics: Array<{ topic: string; subject: string; accuracy: number }> = [];

    if (totalQuizzesAttempted > 0) {
      const sumPct = attemptsList.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
      averageAccuracy = parseFloat((sumPct / totalQuizzesAttempted).toFixed(1));
      overallCompletion = Math.min(100, Math.round((totalQuizzesAttempted / 6) * 100));
      studyHours = parseFloat((totalQuizzesAttempted * 0.45).toFixed(1));

      for (const a of attemptsList) {
        if (a.percentage < 70) {
          weakTopics.push({
            topic: a.quizTitle,
            subject: "Semester 1",
            accuracy: a.percentage,
            reviewUrl: "/prepmeup/quizzes",
          });
        } else {
          strongTopics.push({
            topic: a.quizTitle,
            subject: "Semester 1",
            accuracy: a.percentage,
          });
        }
      }
    }

    const defaultSubjectsProgress = [
      {
        code: "AM101",
        title: "Applied Computational Mathematics",
        completion: totalQuizzesAttempted > 0 ? 35 : 0,
        accuracy: averageAccuracy > 0 ? averageAccuracy : 0,
        status: totalQuizzesAttempted > 0 ? "In Progress" : "Not Started",
      },
      {
        code: "CS101",
        title: "Python Programming",
        completion: activity.codingSubmissions.length > 0 ? 50 : 0,
        accuracy: activity.codingSubmissions.length > 0 ? 100 : 0,
        status: activity.codingSubmissions.length > 0 ? "Practicing" : "Not Started",
      },
      {
        code: "EE101",
        title: "Basic Electrical & Electronics",
        completion: 0,
        accuracy: 0,
        status: "Not Started",
      },
      {
        code: "CS102",
        title: "Computer Organisation & Architecture",
        completion: 0,
        accuracy: 0,
        status: "Not Started",
      },
    ];

    const stats = {
      overallCompletion,
      averageAccuracy,
      totalQuizzesAttempted,
      studyHours,
      codingSubmissionsCount: activity.codingSubmissions.length,
      doubtsCount: activity.doubts.length,
      subjectsProgress: defaultSubjectsProgress,
      weakTopics: weakTopics.slice(0, 4),
      strongTopics: strongTopics.slice(0, 4),
      recentAttempts: attemptsList.slice(0, 10),
    };

    return NextResponse.json({ ok: true, stats });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to load progress stats." }, { status: 500 });
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import {
  getStudentActivity,
  recordUserPresence,
  resolveSessionIdentity,
  getSubjectCodeForQuizAttempt,
  StorageUnavailableError,
} from "@/app/prepmeup/_lib/studentStore";

export const dynamic = "force-dynamic";

function formatAttemptDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Recently";
    const now = new Date();
    // Compare in Asia/Kolkata date
    const dDateStr = d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    const nowDateStr = now.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    const timeStr =
      d.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }) + " IST";

    if (dDateStr === nowDateStr) return `Today, ${timeStr}`;
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayDateStr = yesterday.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    if (dDateStr === yesterdayDateStr) return `Yesterday, ${timeStr}`;
    return `${dDateStr}, ${timeStr}`;
  } catch {
    return "Recently";
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);

    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Please log in to view progress." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const studentId = identity.canonicalId;

    recordUserPresence({
      userId: studentId,
      name: identity.fullName,
      target: identity.email || identity.phone || studentId,
      type: identity.email ? "email" : "phone",
      college: identity.college,
      page: "/prepmeup/progress",
      activity: "Viewing Student Progress & Submission Audit Log",
    });

    // 1. Gather Real Attempts from Durable Student Activity Store & Database
    const activity = getStudentActivity(studentId, identity.aliases);
    let attemptsList: Array<{
      id: string;
      quizTitle: string;
      score: number;
      totalMarks: number;
      percentage: number;
      date: string;
      submittedAtIso: string;
      breakdown?: any[];
      errorsDetected?: string[];
      explanationMarkdown?: string;
    }> = [];

    // Add durable submitted quiz attempts
    for (const a of activity.quizAttempts) {
      const missedQuestions = (a.breakdown || []).filter((b) => !b.isCorrect);
      const errorsDetected = missedQuestions.map(
        (m) => `Missed: "${m.questionText.slice(0, 80)}…" — Your Answer: ${m.studentAnswer ?? "Unanswered (Skipped)"}`
      );
      const explanationMarkdown =
        missedQuestions.length > 0
          ? `### Detailed Solution & Corrections\n\n` +
            missedQuestions
              .map(
                (m, idx) =>
                  `**Question ${idx + 1}:** ${m.questionText}\n\n${
                    m.explanation ? `> **Explanation:** ${m.explanation}` : ""
                  }`
              )
              .join("\n\n---\n\n")
          : `### Verified Accurate Solution\n\nAll questions in **${a.quizTitle}** were answered correctly! Mastery confirmed.`;

      attemptsList.push({
        id: a.id,
        quizTitle: a.quizTitle,
        score: a.score,
        totalMarks: a.totalMarks,
        percentage: a.percentage,
        date: formatAttemptDate(a.submittedAt),
        submittedAtIso: a.submittedAt,
        breakdown: a.breakdown,
        errorsDetected,
        explanationMarkdown,
      });
    }

    // Add durable coding lab submissions
    for (const c of activity.codingSubmissions) {
      const isAccepted = c.status === "accepted";
      attemptsList.push({
        id: c.id,
        quizTitle: `💻 Coding Lab: ${c.problemTitle}`,
        score: isAccepted ? 100 : 0,
        totalMarks: 100,
        percentage: isAccepted ? 100 : 0,
        date: formatAttemptDate(c.submittedAt),
        submittedAtIso: c.submittedAt,
        errorsDetected: isAccepted ? [] : ["Unit test failure or logical assertion error detected."],
        explanationMarkdown: isAccepted
          ? `### Coding Lab: ${c.problemTitle} — Passed!\n\nAll unit test assertions verified successfully in Python 3.12 runner.\n\n\`\`\`python\n${c.code}\n\`\`\``
          : `### Coding Lab: ${c.problemTitle} — Needs Revision\n\nEnsure array bounds and algorithmic logic match expected problem outputs.\n\n\`\`\`python\n${c.code}\n\`\`\``,
      });
    }

    // Also check Supabase if serviceClient is available and studentId is a UUID
    const serviceClient = createPmuServiceClient();
    if (serviceClient && /^[0-9a-f-]{36}$/i.test(studentId)) {
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
                submittedAtIso: da.created_at,
              });
            }
          }
        }
      } catch {}
    }

    // Sort chronologically (most recent first)
    attemptsList.sort((a, b) => new Date(b.submittedAtIso).getTime() - new Date(a.submittedAtIso).getTime());

    // 2. Compute Real Dynamic Statistics (Distinguishing Quizzes from Coding Labs)
    const quizzesCount = activity.quizAttempts.length;
    const codingCount = activity.codingSubmissions.length;
    const totalActivitiesAttempted = attemptsList.length;
    let averageAccuracy = 0;
    let overallCompletion = 0;
    let studyHours = 0;
    let studyMinutesTotal = 0;
    const weakTopics: Array<{ topic: string; subject: string; accuracy: number; reviewUrl: string }> = [];
    const strongTopics: Array<{ topic: string; subject: string; accuracy: number }> = [];

    // Compute actual active study time from recorded quiz timeSpentSeconds + coding submissions (5m each) + doubts (3m each)
    const quizSecondsSum = activity.quizAttempts.reduce(
      (sum, q) => sum + (typeof q.timeSpentSeconds === "number" && q.timeSpentSeconds > 0 ? q.timeSpentSeconds : 300),
      0
    );
    const codingMinutesSum = activity.codingSubmissions.length * 5;
    const doubtMinutesSum = activity.doubts.length * 3;
    studyMinutesTotal = Math.round(quizSecondsSum / 60) + codingMinutesSum + doubtMinutesSum;
    studyHours = parseFloat((studyMinutesTotal / 60).toFixed(1));

    if (totalActivitiesAttempted > 0) {
      const sumPct = attemptsList.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
      averageAccuracy = parseFloat((sumPct / totalActivitiesAttempted).toFixed(1));
      overallCompletion = Math.min(100, Math.round((totalActivitiesAttempted / 6) * 100));

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

    const curriculumSubjects = [
      { code: "CSE1001", title: "Applied Computational Mathematics" },
      { code: "CSE1002", title: "Basic Electrical & Electronics" },
      { code: "CSE1003", title: "Computer Organization & Architecture" },
      { code: "CSE1004", title: "Fundamentals of Web Technologies" },
      { code: "CSE1005", title: "Python Programming" },
      { code: "CSE1006", title: "Indian Science, Engineering & Technology (IKS)" },
    ];

    const subjectsProgress = curriculumSubjects.map((sub) => {
      // Find all quiz attempts that strictly map to this subject
      const subQuizzes = activity.quizAttempts.filter(
        (q) => getSubjectCodeForQuizAttempt(q) === sub.code
      );
      // Coding submissions belong to Python (CSE1005)
      const subCoding = sub.code === "CSE1005" ? activity.codingSubmissions : [];

      let completion = 0;
      let accuracy = 0;

      if (sub.code === "CSE1005") {
        // Python: Driven by both quizzes and coding lab runs
        const quizPart = Math.min(50, subQuizzes.length * 25);
        const codePart = Math.min(50, subCoding.length * 25);
        completion = Math.min(100, quizPart + codePart);

        const quizScores = subQuizzes.map((q) => q.percentage);
        const codeScores = subCoding.map((c) => (c.status === "accepted" ? 100 : 0));
        const allScores = [...quizScores, ...codeScores];
        accuracy = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
      } else {
        // Other subjects: Driven strictly by quizzes belonging to that subject
        completion = Math.min(100, subQuizzes.length * 25);
        accuracy =
          subQuizzes.length > 0
            ? Math.round(subQuizzes.reduce((a, b) => a + b.percentage, 0) / subQuizzes.length)
            : 0;
      }

      let status = "Not Started";
      if (completion >= 100) {
        status = "Mastered";
      } else if (completion > 0) {
        status =
          sub.code === "CSE1005" && subCoding.length > 0 && subQuizzes.length === 0
            ? "Practicing"
            : "In Progress";
      }

      return {
        code: sub.code,
        title: sub.title,
        completion,
        accuracy,
        status,
        quizzesCompleted: subQuizzes.length,
        codingSubmissions: subCoding.length,
      };
    });

    const stats = {
      studentId,
      overallCompletion,
      averageAccuracy,
      totalQuizzesAttempted: totalActivitiesAttempted, // Backwards-compatible field
      quizzesCompleted: quizzesCount,
      codingSubmissionsCount: codingCount,
      totalActivitiesAttempted,
      studyHours,
      studyMinutes: studyMinutesTotal,
      doubtsCount: activity.doubts.length,
      subjectsProgress,
      weakTopics: weakTopics.slice(0, 4),
      strongTopics: strongTopics.slice(0, 4),
      recentAttempts: attemptsList.slice(0, 20),
    };

    return NextResponse.json(
      { ok: true, stats },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: any) {
    const status = err instanceof StorageUnavailableError ? 503 : 500;
    return NextResponse.json(
      {
        ok: false,
        code: err instanceof StorageUnavailableError ? err.code : "PROGRESS_READ_ERROR",
        error: err.message || "Failed to load progress stats from persistent storage.",
      },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}

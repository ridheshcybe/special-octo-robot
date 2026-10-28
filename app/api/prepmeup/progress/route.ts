import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

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
      } catch {
        // Fallback
      }
    }

    const serviceClient = createPmuServiceClient();

    // Default student aggregate statistics
    const defaultStats = {
      overallCompletion: 42,
      averageAccuracy: 84.5,
      totalQuizzesAttempted: 8,
      studyHours: 14.5,
      subjectsProgress: [
        { code: "AM101", title: "Applied Computational Mathematics", completion: 65, accuracy: 88, status: "On Track" },
        { code: "CS101", title: "Python Programming", completion: 50, accuracy: 92, status: "Mastered" },
        { code: "EE101", title: "Basic Electrical Engineering", completion: 30, accuracy: 76, status: "Needs Revision" },
        { code: "CS102", title: "Computer Organisation & Architecture", completion: 25, accuracy: 82, status: "On Track" },
      ],
      weakTopics: [
        { topic: "Thevenin & Norton Equivalent Circuits", subject: "BEE-101", accuracy: 52, reviewUrl: "/prepmeup/subjects/basic-electrical-engineering" },
        { topic: "Instruction Pipelining Hazards", subject: "COA-102", accuracy: 58, reviewUrl: "/prepmeup/subjects/computer-organisation-and-architecture" },
      ],
      strongTopics: [
        { topic: "Eigenvalues & Spectral Theorems", subject: "AM-101", accuracy: 96 },
        { topic: "Python Memory & List Comprehensions", subject: "CS-101", accuracy: 94 },
      ],
      recentAttempts: [
        { id: "att-1", quizTitle: "Linear Algebra & Eigenvalue Foundations", score: 5, totalMarks: 5, percentage: 100, date: "Today, 2:15 PM" },
        { id: "att-2", quizTitle: "Python Memory & Algorithmic Complexity", score: 4, totalMarks: 5, percentage: 80, date: "Yesterday, 6:40 PM" },
        { id: "att-3", quizTitle: "AC Circuits & Phasor Diagrams", score: 3, totalMarks: 5, percentage: 60, date: "21 Oct 2026" },
      ],
    };

    if (serviceClient && studentId !== "mock-student-id") {
      const { data: attempts } = await serviceClient
        .from("pmu_quiz_attempts")
        .select("*, quiz:pmu_quizzes(title)")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      if (attempts && attempts.length > 0) {
        const totalAttempts = attempts.length;
        const avgScore =
          attempts.reduce((acc: number, curr: any) => acc + (curr.percentage || 0), 0) / totalAttempts;

        defaultStats.totalQuizzesAttempted = totalAttempts;
        defaultStats.averageAccuracy = parseFloat(avgScore.toFixed(1));
        defaultStats.recentAttempts = attempts.slice(0, 5).map((a: any) => ({
          id: a.id,
          quizTitle: a.quiz?.title || "Quiz Attempt",
          score: a.score || 0,
          totalMarks: a.total_marks || 0,
          percentage: a.percentage || 0,
          date: new Date(a.created_at).toLocaleDateString(),
        }));
      }
    }

    return NextResponse.json({ ok: true, stats: defaultStats });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to load progress stats." }, { status: 500 });
  }
}

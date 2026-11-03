import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { MOCK_QUIZZES } from "@/app/prepmeup/_lib/quizData";
import { getQuantumQuizById, checkUserCourseAccess } from "@/app/prepmeup/_lib/trackStore";
import { canAccessQuantumQuiz } from "@/lib/prepmeup/access";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;
    const cookieStore = await cookies();
    const studentSession = cookieStore.get("pmu-session");
    const adminSession = cookieStore.get("pmu-admin-session");

    if (!studentSession?.value && !adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Please log in to start a quiz attempt." }, { status: 401 });
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

    // Check if this is a Quantum Quiz
    const quantumQuiz = getQuantumQuizById(quizId);
    if (quantumQuiz) {
      // Access check using central access service
      const isFreePreview = Boolean(quantumQuiz.isFreePreview);
      const hasAccess = Boolean(adminSession?.value) || canAccessQuantumQuiz(studentId, quantumQuiz);

      if (!hasAccess) {
        return NextResponse.json(
          {
            ok: false,
            error: "This assessment requires active Quantum Computing Foundations enrollment. Please unlock the course to take this quiz.",
          },
          { status: 403 }
        );
      }

      const questionsList = (quantumQuiz.questions || []).map((q) => ({
        id: q.id,
        question_type: "mcq_single",
        question_text: q.text,
        options: q.options || [],
        marks: 1,
        difficulty: "medium",
        // Scrub correct answers and explanations
      }));

      const attemptId = `q-attempt-${Date.now()}`;

      return NextResponse.json({
        ok: true,
        data: {
          attemptId,
          quiz: {
            id: quantumQuiz.id,
            title: quantumQuiz.title,
            description: quantumQuiz.description,
            duration_minutes: quantumQuiz.durationMinutes || 15,
            total_marks: quantumQuiz.totalMarks || 5,
            passing_marks: quantumQuiz.passingScore || 3,
            is_free_preview: isFreePreview,
          },
          questions: questionsList,
        },
      });
    }

    const serviceClient = createPmuServiceClient();

    // 1. Fetch Quiz & Questions (Ensure is_published = true)
    let quiz: any = null;
    let questionsList: any[] = [];

    if (serviceClient) {
      try {
        const { data: quizRow } = await serviceClient
          .from("pmu_quizzes")
          .select("*")
          .eq("id", quizId)
          .eq("is_published", true)
          .maybeSingle();

        if (quizRow) {
          quiz = quizRow;
          const { data: questions } = await serviceClient
            .from("pmu_quiz_questions")
            .select("marks, question_order, question:pmu_questions(*)")
            .eq("quiz_id", quizId)
            .order("question_order", { ascending: true });

          if (questions) {
            questionsList = questions.map((item: any) => ({
              id: item.question.id,
              question_type: item.question.question_type,
              question_text: item.question.question_text,
              options: item.question.options,
              marks: item.marks || item.question.marks,
              difficulty: item.question.difficulty,
              // Scrub out correct_answer and explanation for student runner
            }));
          }
        }
      } catch {}
    }

    // Fallback to verified mock if not found in db
    if (!quiz) {
      quiz = MOCK_QUIZZES.find((q) => q.id === quizId) || MOCK_QUIZZES[0];
      questionsList = quiz.questions.map((q: any) => ({
        id: q.id,
        question_type: q.question_type,
        question_text: q.question_text,
        options: q.options,
        marks: q.marks,
        difficulty: q.difficulty,
        initial_code: q.initial_code,
        // STRICT: Zero correct answers or explanations leaked
      }));
    }

    let attemptId = `attempt-${Date.now()}`;

    // 2. Insert Attempt row with status = 'in_progress'
    if (serviceClient && studentId !== "mock-student-id" && /^[0-9a-f-]{36}$/i.test(studentId)) {
      try {
        const { data: attemptRow } = await serviceClient
          .from("pmu_quiz_attempts")
          .insert({
            quiz_id: quiz.id,
            student_id: studentId,
            total_marks: quiz.total_marks,
            status: "in_progress",
          })
          .select("id")
          .single();

        if (attemptRow) attemptId = attemptRow.id;
      } catch {}
    }

    return NextResponse.json({
      ok: true,
      data: {
        attemptId,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          duration_minutes: quiz.duration_minutes,
          total_marks: quiz.total_marks,
          passing_marks: quiz.passing_marks || 3,
        },
        questions: questionsList,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to start quiz attempt." }, { status: 500 });
  }
}

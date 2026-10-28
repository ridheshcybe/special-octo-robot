import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { MOCK_QUIZZES } from "@/app/prepmeup/_lib/quizData";

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

    const serviceClient = createPmuServiceClient();

    // 1. Fetch Quiz & Questions (Ensure is_published = true)
    let quiz: any = null;
    let questionsList: any[] = [];

    if (serviceClient) {
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
    if (serviceClient && studentId !== "mock-student-id") {
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

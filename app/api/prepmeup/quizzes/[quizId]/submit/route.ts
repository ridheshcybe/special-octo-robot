import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { MOCK_QUIZZES } from "@/app/prepmeup/_lib/quizData";
import {
  recordQuizAttempt,
  resolveSessionIdentity,
  getSubjectCodeForQuizAttempt,
  StorageUnavailableError,
} from "@/app/prepmeup/_lib/studentStore";
import { getQuantumQuizById, updateStudentQuantumProgress } from "@/app/prepmeup/_lib/trackStore";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);

    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized session. Please log in to submit quiz." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const studentId = identity.canonicalId;

    const body = await req.json().catch(() => ({}));
    const { attemptId, answers, timeSpentSeconds } = body;
    const serviceClient = createPmuServiceClient();

    // Check if this is a Quantum Quiz
    const quantumQuiz = getQuantumQuizById(quizId);
    let quiz: any = null;
    let isQuantum = false;

    if (quantumQuiz) {
      isQuantum = true;
      quiz = {
        id: quantumQuiz.id,
        title: quantumQuiz.title,
        total_marks: quantumQuiz.totalMarks || 5,
        passing_marks: quantumQuiz.passingScore || 3,
        subject_id: "quantum-computing",
        subject_title: "Quantum Computing Foundations",
        questions: (quantumQuiz.questions || []).map((q) => ({
          id: q.id,
          question_type: "mcq_single",
          question_text: q.text,
          options: q.options || [],
          correct_answer:
            typeof q.correctIndex === "number" && q.options && q.options[q.correctIndex] !== undefined
              ? q.options[q.correctIndex]
              : "",
          explanation: q.explanation,
          marks: 1,
        })),
      };
    } else {
      quiz = MOCK_QUIZZES.find((q) => q.id === quizId) || MOCK_QUIZZES[0];

      if (serviceClient) {
        try {
          const { data: qRow } = await serviceClient
            .from("pmu_quizzes")
            .select("*, questions:pmu_quiz_questions(marks, question:pmu_questions(*))")
            .eq("id", quizId)
            .maybeSingle();

          if (qRow) {
            quiz = {
              id: qRow.id,
              title: qRow.title,
              total_marks: qRow.total_marks,
              passing_marks: qRow.passing_marks || 3,
              subject_id: qRow.subject_id,
              questions: qRow.questions.map((item: any) => ({
                id: item.question.id,
                question_type: item.question.question_type,
                question_text: item.question.question_text,
                options: item.question.options,
                correct_answer: item.question.correct_answer,
                explanation: item.question.explanation,
                marks: item.marks || item.question.marks,
              })),
            };
          }
        } catch {}
      }
    }

    // 1. Rigorous Server-Side Evaluation
    let score = 0;
    const breakdown: any[] = [];
    const submittedAnswers = answers || {};

    for (const q of quiz.questions) {
      const studentVal = submittedAnswers[q.id];
      let isCorrect = false;

      if (q.question_type === "mcq_single" || q.question_type === "short_answer") {
        if (
          studentVal &&
          String(studentVal).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase()
        ) {
          isCorrect = true;
        }
      } else if (q.question_type === "numerical") {
        const numStudent = parseFloat(studentVal);
        const numExpected = parseFloat(q.correct_answer);
        if (!isNaN(numStudent) && !isNaN(numExpected) && Math.abs(numStudent - numExpected) < 0.01) {
          isCorrect = true;
        }
      } else if (q.question_type === "coding") {
        if (
          studentVal &&
          (studentVal.includes("sum(diag_list)") ||
            studentVal.includes("return sum") ||
            studentVal.includes("+="))
        ) {
          isCorrect = true;
        }
      }

      const marksAwarded = isCorrect ? q.marks : 0;
      score += marksAwarded;

      breakdown.push({
        questionId: q.id,
        questionText: q.question_text,
        questionType: q.question_type,
        options: q.options,
        studentAnswer: studentVal ?? null,
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
        isCorrect,
        marksAwarded,
        totalMarks: q.marks,
      });
    }

    const percentage = quiz.total_marks > 0 ? (score / quiz.total_marks) * 100 : 0;
    const passed = score >= (quiz.passing_marks || 3);
    const finalAttemptId = attemptId || `attempt-${Date.now()}`;
    const submittedAt = new Date().toISOString();

    // Save in durable student activity store so progress metrics immediately reflect real attempts
    const subjectCode = getSubjectCodeForQuizAttempt({
      quizId: quiz.id,
      quizTitle: quiz.title,
      subject_id: quiz.subject_id,
      subject_title: quiz.subject_title,
    });

    recordQuizAttempt(studentId, {
      id: finalAttemptId,
      quizId: quiz.id,
      quizTitle: quiz.title,
      subjectCode,
      score,
      totalMarks: quiz.total_marks,
      percentage: parseFloat(percentage.toFixed(1)),
      timeSpentSeconds: typeof timeSpentSeconds === "number" ? timeSpentSeconds : 0,
      breakdown: breakdown.map((b) => ({
        questionId: b.questionId,
        questionText: b.questionText,
        studentAnswer: b.studentAnswer,
        isCorrect: b.isCorrect,
        marksAwarded: b.marksAwarded,
        explanation: b.explanation,
      })),
      submittedAt,
    });

    if (isQuantum && passed) {
      try {
        updateStudentQuantumProgress(studentId, {
          type: "quiz",
          id: quiz.id,
          passed: true,
        });
      } catch {
        // Non-blocking
      }
    }

    // 2. Persist in Database if configured
    if (serviceClient && attemptId && !attemptId.startsWith("attempt-")) {
      try {
        await serviceClient
          .from("pmu_quiz_attempts")
          .update({
            score,
            percentage: parseFloat(percentage.toFixed(2)),
            time_spent_seconds: timeSpentSeconds || 0,
            status: "submitted",
            submitted_at: submittedAt,
          })
          .eq("id", attemptId);

        for (const item of breakdown) {
          await serviceClient.from("pmu_quiz_answers").upsert(
            {
              attempt_id: attemptId,
              question_id: item.questionId,
              selected_option: typeof item.studentAnswer === "string" ? item.studentAnswer : null,
              text_answer: typeof item.studentAnswer === "number" ? String(item.studentAnswer) : null,
              code_submission: item.questionType === "coding" ? String(item.studentAnswer) : null,
              is_correct: item.isCorrect,
              marks_awarded: item.marksAwarded,
            },
            { onConflict: "attempt_id,question_id" }
          );
        }

        if (/^[0-9a-f-]{36}$/i.test(studentId) && quiz.subject_id) {
          await serviceClient.from("pmu_progress_records").upsert(
            {
              student_id: studentId,
              subject_id: quiz.subject_id,
              quiz_id: quiz.id,
              accuracy: parseFloat(percentage.toFixed(2)),
              completion_percentage: 100.0,
              last_activity_at: submittedAt,
            },
            { onConflict: "student_id,subject_id,quiz_id" }
          );
        }
      } catch {}
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          attemptId: finalAttemptId,
          studentId,
          score,
          totalMarks: quiz.total_marks,
          percentage: parseFloat(percentage.toFixed(2)),
          passed,
          timeSpentSeconds: timeSpentSeconds || 0,
          submittedAt,
          strongTopics: passed ? [quiz.title] : [],
          weakTopics: passed ? [] : [quiz.title],
          breakdown,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    const status = err instanceof StorageUnavailableError ? 503 : 500;
    return NextResponse.json(
      {
        ok: false,
        code: err instanceof StorageUnavailableError ? err.code : "QUIZ_SUBMIT_ERROR",
        error: err.message || "Failed to submit quiz.",
      },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}

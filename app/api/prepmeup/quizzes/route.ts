import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { MOCK_QUIZZES } from "@/app/prepmeup/_lib/quizData";
import { getAllQuantumQuizzes } from "@/app/prepmeup/_lib/trackStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const topicId = searchParams.get("topicId");
    const track = searchParams.get("track");

    if (track === "quantum-computing") {
      const quantumQuizzes = getAllQuantumQuizzes();
      return NextResponse.json({
        ok: true,
        quizzes: quantumQuizzes.map((q) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          quiz_type: q.isFreePreview ? "diagnostic" : "module_assessment",
          duration_minutes: q.durationMinutes,
          total_marks: q.totalMarks,
          passing_marks: q.passingScore,
          subject_title: `Quantum Computing • Module ${q.moduleNumber}`,
          module_number: q.moduleNumber,
          is_free_preview: Boolean(q.isFreePreview),
          status: q.status,
          track: "quantum-computing",
        })),
      });
    }

    const serviceClient = createPmuServiceClient();

    if (serviceClient) {
      let query = serviceClient
        .from("pmu_quizzes")
        .select("*, subject:pmu_subjects(title, code), topic:pmu_topics(title)")
        .eq("is_published", true);

      if (subjectId) query = query.eq("subject_id", subjectId);
      if (topicId) query = query.eq("topic_id", topicId);

      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return NextResponse.json({ ok: true, quizzes: data });
      }
    }

    // Fallback to high-yield verified seed quizzes
    let filtered = MOCK_QUIZZES;
    if (subjectId) {
      filtered = filtered.filter((q) => q.subject_id === subjectId);
    }

    return NextResponse.json({ ok: true, quizzes: filtered });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to load quizzes." }, { status: 500 });
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { retrieveSyllabusGrounding, solveAcademicDoubt } from "@/lib/prepmeup/ai-tutor";

// In-memory sliding window for AI doubt rate limiting (max 15 queries per hour per user)
const doubtRateLimitMap = new Map<string, number[]>();

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const studentSession = cookieStore.get("pmu-session");
    const adminSession = cookieStore.get("pmu-admin-session");

    if (!studentSession?.value && !adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Please log in." }, { status: 401 });
    }

    let studentId = "mock-student-id";
    if (studentSession?.value) {
      try {
        const parsed = JSON.parse(studentSession.value);
        if (parsed.userId) studentId = parsed.userId;
      } catch {}
    }

    const serviceClient = createPmuServiceClient();
    if (serviceClient && studentId !== "mock-student-id") {
      const { data: threads, error } = await serviceClient
        .from("pmu_doubts")
        .select("*, messages:pmu_doubt_messages(*)")
        .eq("student_id", studentId)
        .order("updated_at", { ascending: false });

      if (!error && threads) {
        return NextResponse.json({ ok: true, threads });
      }
    }

    // Default mock thread
    return NextResponse.json({
      ok: true,
      threads: [
        {
          id: "doubt-1",
          title: "Eigenvalues of Orthogonal Matrices",
          status: "answered",
          created_at: new Date().toISOString(),
          messages: [
            {
              id: "msg-1",
              sender_type: "student",
              message_text: "Why are the eigenvalues of an orthogonal matrix always of unit magnitude?",
              created_at: new Date().toISOString(),
            },
            {
              id: "msg-2",
              sender_type: "ai",
              message_text: "For an orthogonal matrix $Q$, we have $Q^T Q = I$. If $Q v = \\lambda v$, taking norms gives $\\|Q v\\| = \\|v\\| \\implies |\\lambda| \\|v\\| = \\|v\\| \\implies |\\lambda| = 1$.",
              is_grounded_in_syllabus: true,
              created_at: new Date().toISOString(),
            },
          ],
        },
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const studentSession = cookieStore.get("pmu-session");
    const adminSession = cookieStore.get("pmu-admin-session");

    if (!studentSession?.value && !adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Please log in to ask doubts." }, { status: 401 });
    }

    let studentId = "mock-student-id";
    if (studentSession?.value) {
      try {
        const parsed = JSON.parse(studentSession.value);
        if (parsed.userId) studentId = parsed.userId;
      } catch {}
    }

    // Rate Limiting (15 queries per hour)
    const now = Date.now();
    const windowMs = 60 * 60 * 1000;
    let timestamps = doubtRateLimitMap.get(studentId) || [];
    timestamps = timestamps.filter((t) => now - t < windowMs);

    if (timestamps.length >= 15) {
      return NextResponse.json(
        { ok: false, error: "Rate limit exceeded. Maximum 15 AI doubts per hour." },
        { status: 429 }
      );
    }
    timestamps.push(now);
    doubtRateLimitMap.set(studentId, timestamps);

    const body = await req.json().catch(() => ({}));
    const { queryText, subjectId, topicId, imageBase64, imageMimeType, subjectName } = body;

    if (!queryText?.trim()) {
      return NextResponse.json({ ok: false, error: "Query text cannot be empty." }, { status: 400 });
    }

    // 1. RAG Grounding Search
    const { contextText, isGrounded } = await retrieveSyllabusGrounding({
      query: queryText,
      subjectId,
      topicId,
    });

    // 2. Multimodal AI Tutor Resolution
    const solution = await solveAcademicDoubt({
      queryText,
      imageBase64,
      imageMimeType,
      subjectName,
      groundingContext: contextText,
      isGrounded,
    });

    let doubtId = "doubt-" + Date.now();
    const serviceClient = createPmuServiceClient();

    if (serviceClient && studentId !== "mock-student-id") {
      const { data: thread } = await serviceClient
        .from("pmu_doubts")
        .insert({
          student_id: studentId,
          subject_id: subjectId || null,
          topic_id: topicId || null,
          title: queryText.slice(0, 60),
          status: "answered",
        })
        .select("id")
        .single();

      if (thread) {
        doubtId = thread.id;
        // Insert student message
        await serviceClient.from("pmu_doubt_messages").insert({
          doubt_id: doubtId,
          sender_type: "student",
          message_text: queryText,
        });

        // Insert AI answer
        await serviceClient.from("pmu_doubt_messages").insert({
          doubt_id: doubtId,
          sender_type: "ai",
          message_text: solution.responseText,
          extracted_ocr_text: solution.extractedOcrText || null,
          is_grounded_in_syllabus: solution.isGrounded,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        doubtId,
        title: queryText.slice(0, 60),
        answer: solution.responseText,
        isGrounded: solution.isGrounded,
        extractedOcrText: solution.extractedOcrText,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to solve doubt." }, { status: 500 });
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { retrieveSyllabusGrounding, solveAcademicDoubt } from "@/lib/prepmeup/ai-tutor";
import {
  recordDoubt,
  getStudentActivity,
  resolveSessionIdentity,
  StorageUnavailableError,
} from "@/app/prepmeup/_lib/studentStore";

export const dynamic = "force-dynamic";

// In-memory sliding window for AI doubt rate limiting (max 15 queries per hour per user)
const doubtRateLimitMap = new Map<string, number[]>();

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);

    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Please log in to view your doubt history." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const studentId = identity.canonicalId;

    // 1. Check durable student activity store first (throws StorageUnavailableError on store corruption)
    const activity = getStudentActivity(studentId, identity.aliases);
    const activeThreads = activity.doubts.map((d) => ({
      id: d.id,
      title: d.title,
      status: "answered",
      created_at: d.createdAt,
      messages: [
        {
          id: `msg-q-${d.id}`,
          sender_type: "student" as const,
          message_text: d.queryText,
          created_at: d.createdAt,
        },
        {
          id: `msg-a-${d.id}`,
          sender_type: "ai" as const,
          message_text: d.answerText,
          is_grounded_in_syllabus: d.isGrounded,
          created_at: d.createdAt,
        },
      ],
    }));

    // 2. Also merge any Supabase threads if serviceClient is available and studentId is a UUID
    const serviceClient = createPmuServiceClient();
    if (serviceClient && /^[0-9a-f-]{36}$/i.test(studentId)) {
      try {
        const { data: supaThreads, error } = await serviceClient
          .from("pmu_doubts")
          .select("*, messages:pmu_doubt_messages(*)")
          .eq("student_id", studentId)
          .order("updated_at", { ascending: false });

        if (!error && supaThreads && supaThreads.length > 0) {
          for (const st of supaThreads) {
            if (!activeThreads.some((t) => t.id === st.id)) {
              activeThreads.push(st);
            }
          }
        }
      } catch {}
    }

    return NextResponse.json(
      { ok: true, studentId, threads: activeThreads },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: any) {
    const status = err instanceof StorageUnavailableError ? 503 : 500;
    return NextResponse.json(
      {
        ok: false,
        code: err instanceof StorageUnavailableError ? err.code : "DOUBTS_READ_ERROR",
        error: err.message || "Failed to load doubt history from persistent storage.",
      },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);

    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Please log in to ask doubts." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const studentId = identity.canonicalId;

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

    let doubtId = body.doubtId || `doubt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const serviceClient = createPmuServiceClient();

    if (serviceClient && /^[0-9a-f-]{36}$/i.test(studentId)) {
      try {
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
      } catch {}
    }

    const createdAt = new Date().toISOString();
    recordDoubt(studentId, {
      id: doubtId,
      title: queryText.slice(0, 60),
      queryText,
      answerText: solution.responseText,
      subjectName,
      isGrounded: solution.isGrounded,
      createdAt,
    });

    return NextResponse.json(
      {
        ok: true,
        data: {
          doubtId,
          studentId,
          title: queryText.slice(0, 60),
          answer: solution.responseText,
          isGrounded: solution.isGrounded,
          extractedOcrText: solution.extractedOcrText,
          createdAt,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    const status = err instanceof StorageUnavailableError ? 503 : 500;
    return NextResponse.json(
      {
        ok: false,
        code: err instanceof StorageUnavailableError ? err.code : "DOUBT_WRITE_ERROR",
        error: err.message || "Failed to solve or persist doubt.",
      },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import { askQuantumAITutor } from "@/lib/prepmeup/quantumTutor";
import { checkDurableRateLimit } from "@/app/prepmeup/_lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);
    const studentId = identity?.canonicalId || "student-guest-user";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // Rate Limit AI Tutor requests (e.g. 20 doubts per 10 minutes per student/IP)
    const rateCheck = await checkDurableRateLimit({
      bucketKey: "quantum_ai_tutor",
      identifier: `${studentId}_${ip}`,
      limit: 20,
      windowSeconds: 10 * 60,
    });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: `AI Tutor rate limit exceeded. Please wait ${rateCheck.retryAfterSec}s before asking again.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSec || 60) } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { question, moduleNumber, imageUrl, extractedText } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid quantum question or derivation." },
        { status: 400 }
      );
    }

    const doubtRecord = await askQuantumAITutor({
      studentId,
      question: question.trim(),
      moduleNumber: typeof moduleNumber === "number" ? moduleNumber : undefined,
      imageUrl,
      extractedText,
    });

    return NextResponse.json({
      ok: true,
      doubt: doubtRecord,
      data: {
        doubtId: doubtRecord.id,
        title: doubtRecord.questionText.slice(0, 60),
        answer: doubtRecord.aiResponse,
        isGrounded: doubtRecord.isGrounded,
        usesGeneralKnowledge: doubtRecord.usesGeneralKnowledge,
        disclosureNotice: doubtRecord.disclosureNotice,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to process quantum doubt." },
      { status: 500 }
    );
  }
}

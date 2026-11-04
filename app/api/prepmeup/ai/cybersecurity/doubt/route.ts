import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import { askCyberAITutor } from "@/lib/prepmeup/cyberTutor";
import { checkDurableRateLimit } from "@/app/prepmeup/_lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const studentId = identity?.canonicalId || `guest-${ip}`;

    // 1. Rate Limit Cyber AI Tutor (20 queries per 10 minutes)
    const rateCheck = await checkDurableRateLimit({
      bucketKey: "cyber_ai_doubt",
      identifier: `${studentId}:${ip}`,
      limit: 20,
      windowSeconds: 10 * 60,
    });

    if (!rateCheck.allowed) {
      const waitSec = rateCheck.retryAfterSec || 60;
      return NextResponse.json(
        {
          ok: false,
          error: `AI Tutor rate limit reached. Please wait ${waitSec}s before sending another query.`,
          retryAfter: waitSec,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(waitSec),
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { question, moduleNumber } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { ok: false, error: "Valid security question is required." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const doubtRecord = await askCyberAITutor({
      studentId,
      question: question.trim(),
      moduleNumber: typeof moduleNumber === "number" ? moduleNumber : undefined,
    });

    return NextResponse.json(
      {
        ok: true,
        doubt: doubtRecord,
        data: {
          doubtId: doubtRecord.id,
          title: doubtRecord.questionText.slice(0, 60),
          answer: doubtRecord.aiResponse,
          isDefensiveGrounded: doubtRecord.isDefensiveGrounded,
          isOffensiveRefused: doubtRecord.isOffensiveRefused,
          safetyNotice: doubtRecord.safetyNotice,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("[CyberAIDoubtRoute] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error processing security inquiry." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

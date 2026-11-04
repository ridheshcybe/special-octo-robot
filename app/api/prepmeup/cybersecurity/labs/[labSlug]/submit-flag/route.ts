import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import {
  getCyberLabBySlug,
  hasUserAcceptedLabPolicy,
  submitCyberLabFlag,
} from "@/app/prepmeup/_lib/trackStore";
import { canAccessCyberLab } from "@/lib/prepmeup/access";
import { checkDurableRateLimit } from "@/app/prepmeup/_lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ labSlug: string }> }
) {
  try {
    const { labSlug } = await params;
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const userId = identity?.canonicalId || `guest-${ip}`;

    // 1. Durable rate limit check (10 attempts per minute)
    const rateCheck = await checkDurableRateLimit({
      bucketKey: "cyber_flag_submit",
      identifier: `${userId}:${labSlug}`,
      limit: 10,
      windowSeconds: 60,
    });

    if (!rateCheck.allowed) {
      const waitSec = rateCheck.retryAfterSec || 60;
      return NextResponse.json(
        {
          ok: false,
          error: `Rate limit exceeded. Too many flag submissions. Please wait ${waitSec}s.`,
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

    // 2. Validate lab exists
    const lab = getCyberLabBySlug(labSlug);
    if (!lab) {
      return NextResponse.json(
        { ok: false, error: "CyberSecurity lab not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    // 3. Ethical Policy Check
    const hasAccepted = hasUserAcceptedLabPolicy(userId, lab.id);
    if (!hasAccepted) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Ethical Hacking & Authorized Sandbox Policy acceptance required before submitting flags.",
          requiresEthicalAcceptance: true,
        },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }

    // 4. Access Control Check (Free preview vs enrolled students)
    const userTarget = identity?.email || identity?.phone || identity?.canonicalId;
    const hasAccess = canAccessCyberLab(userTarget, lab);
    if (!hasAccess) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Course enrollment required. This advanced lab is reserved for enrolled students.",
          isLocked: true,
        },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    }

    // 5. Parse flag submission
    const body = await req.json().catch(() => ({}));
    const { flag, taskId } = body;

    if (!flag || typeof flag !== "string" || !flag.trim()) {
      return NextResponse.json(
        { ok: false, error: "Flag string is required." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    // 6. Verify and record flag
    const result = submitCyberLabFlag({
      userId,
      labSlug,
      taskId,
      submittedFlag: flag.trim(),
    });

    return NextResponse.json(
      {
        ok: true,
        isCorrect: result.isCorrect,
        pointsAwarded: result.pointsAwarded,
        message: result.message,
        attemptsCount: result.attemptsCount,
        remainingAttempts: rateCheck.remaining,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("[SubmitFlagRoute] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal error processing flag submission." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

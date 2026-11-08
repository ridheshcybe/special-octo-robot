import { NextResponse, type NextRequest } from "next/server";
import { authTargetSchema } from "@/app/prepmeup/_lib/validation";
import { checkPhoneOtpRateLimit, checkIpRateLimit } from "@/app/prepmeup/_lib/rateLimit";
import { sendEmailOtp } from "@/app/prepmeup/_lib/emailOtp";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // 1. IP Rate limit check (max 10 / 10 min)
    const ipCheck = await checkIpRateLimit(ip);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: `Too many requests from your network. Try again in ${ipCheck.retryAfterSec}s.` },
        { status: 429, headers: { "Retry-After": String(ipCheck.retryAfterSec || 60) } }
      );
    }

    const body = await req.json().catch(() => ({}));

    // Honeypot bot protection check
    if (body.website || body.company) {
      return NextResponse.json({ ok: true, message: "Verification code sent." });
    }

    // 2. Validate email or phone input
    const rawTarget = body.email || body.phone || body.identifier;
    const targetResult = authTargetSchema.safeParse(rawTarget);
    if (!targetResult.success) {
      return NextResponse.json(
        { ok: false, error: targetResult.error.issues[0]?.message ?? "Please enter a valid email or phone number" },
        { status: 400 }
      );
    }

    const target = targetResult.data;

    // Rate limit check per target
    const rateCheck = await checkPhoneOtpRateLimit(target.value);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: `Please wait ${rateCheck.retryAfterSec}s before requesting a new code.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSec || 60) } }
      );
    }

    // Dispatch verification code via Email (or simulated SMS/WhatsApp mock in dev mode)
    const emailToUse = target.type === "email" ? target.value : `${target.value.replace(/\D/g, "")}@student.prepmeup.internal`;
    const sendResult = await sendEmailOtp(emailToUse);
    if (!sendResult.success) {
      return NextResponse.json(
        { ok: false, error: sendResult.error || "Failed to deliver verification code. Please check your address." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Verification code sent to ${target.value}. Please check your inbox.`,
      channel: target.type === "email" ? "email" : "sms",
      type: target.type,
      target: target.value,
      ...(sendResult.mockCode ? { devMockCode: sendResult.mockCode } : {}),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "An unexpected error occurred while sending code." },
      { status: 500 }
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { authTargetSchema } from "@/app/prepmeup/_lib/validation";
import { checkPhoneOtpRateLimit, checkIpRateLimit } from "@/app/prepmeup/_lib/rateLimit";
import { sendTwilioOtp } from "@/app/prepmeup/_lib/twilioVerify";
import { sendEmailOtp } from "@/app/prepmeup/_lib/emailOtp";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // 1. IP Rate limit check (max 20 / hr)
    const ipCheck = await checkIpRateLimit(ip);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: `Too many requests from your network. Try again in ${ipCheck.retryAfterSec}s.` },
        { status: 429 }
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

    // A. Free Email OTP Flow (Resend API or Hostinger SMTP)
    if (target.type === "email") {
      const sendResult = await sendEmailOtp(target.value);
      if (!sendResult.success) {
        return NextResponse.json(
          { ok: false, error: sendResult.error || "Failed to deliver verification code to your email." },
          { status: 502 }
        );
      }

      return NextResponse.json({
        ok: true,
        message: `Verification code sent to ${target.value}. Please check your inbox.`,
        channel: "email",
        type: "email",
        target: target.value,
        ...(sendResult.mockCode ? { devMockCode: sendResult.mockCode } : {}),
      });
    }

    // B. Phone OTP Flow (Twilio Verify)
    const phone = target.value;
    const phoneCheck = await checkPhoneOtpRateLimit(phone);
    if (!phoneCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: `Please wait ${phoneCheck.retryAfterSec}s before requesting a new code.` },
        { status: 429 }
      );
    }

    const sendResult = await sendTwilioOtp(phone);
    if (!sendResult.success) {
      return NextResponse.json(
        { ok: false, error: sendResult.error || "Failed to deliver verification code. You can also sign in with email." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Verification code sent successfully.",
      channel: sendResult.channel || "whatsapp",
      type: "phone",
      target: phone,
      ...(sendResult.mockCode ? { devMockCode: sendResult.mockCode } : {}),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "An unexpected error occurred while sending code." },
      { status: 500 }
    );
  }
}

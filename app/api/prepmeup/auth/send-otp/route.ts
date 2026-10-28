import { NextResponse, type NextRequest } from "next/server";
import { phoneSchema } from "@/app/prepmeup/_lib/validation";
import { checkPhoneOtpRateLimit, checkIpRateLimit } from "@/app/prepmeup/_lib/rateLimit";
import { sendTwilioOtp } from "@/app/prepmeup/_lib/twilioVerify";

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

    // 2. Validate phone number
    const parseResult = phoneSchema.safeParse(body.phone);
    if (!parseResult.success) {
      return NextResponse.json(
        { ok: false, error: parseResult.error.issues[0]?.message ?? "Invalid phone number" },
        { status: 400 }
      );
    }

    const phone = parseResult.data;

    // 3. Phone Rate limit check (60s cooldown & max 5 / 15 mins)
    const phoneCheck = await checkPhoneOtpRateLimit(phone);
    if (!phoneCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: `Please wait ${phoneCheck.retryAfterSec}s before requesting a new code.` },
        { status: 429 }
      );
    }

    // 4. Send OTP via Twilio Verify (WhatsApp preferred with SMS fallback)
    const sendResult = await sendTwilioOtp(phone);
    if (!sendResult.success) {
      return NextResponse.json(
        { ok: false, error: sendResult.error || "Failed to deliver verification code." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Verification code sent successfully to WhatsApp.",
      channel: sendResult.channel || "whatsapp",
      // Include mock code in dev mode for convenient local testing
      ...(sendResult.mockCode ? { devMockCode: sendResult.mockCode } : {}),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "An unexpected error occurred while sending code." },
      { status: 500 }
    );
  }
}

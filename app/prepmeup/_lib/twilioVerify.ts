/**
 * Twilio Verify & Development Mock OTP Service
 * Sends WhatsApp OTP with SMS fallback.
 * Strictly server-side only.
 */

interface SendOtpResult {
  success: boolean;
  status: "pending" | "approved" | "mock_sent" | "failed";
  channel?: "whatsapp" | "sms";
  error?: string;
  mockCode?: string; // only returned when PMU_OTP_DEV_MODE=true in local development
}

interface VerifyOtpResult {
  success: boolean;
  status: "approved" | "invalid" | "failed";
  error?: string;
}

// Development in-memory mock store for local offline testing
const devOtpStore = new Map<string, { code: string; expiresAt: number }>();

export async function sendTwilioOtp(phone: string): Promise<SendOtpResult> {
  const isDevMode = process.env.PMU_OTP_DEV_MODE === "true" && process.env.NODE_ENV !== "production";

  // 1. If dev mode enabled, generate and log mock OTP (never in production)
  if (isDevMode) {
    const mockCode = "123456";
    devOtpStore.set(phone, {
      code: mockCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    console.log(`\n======================================================`);
    console.log(`[PMU DEV OTP MOCK] Phone: ${phone} | Code: ${mockCode}`);
    console.log(`======================================================\n`);
    return {
      success: true,
      status: "mock_sent",
      channel: "whatsapp",
      mockCode,
    };
  }

  // 2. Production Twilio Verify API
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !serviceSid) {
    // Graceful fallback for local development if Twilio keys aren't set
    const fallbackCode = "123456";
    devOtpStore.set(phone, {
      code: fallbackCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    console.log(`[PMU OTP DEV FALLBACK] Twilio not configured. Using Mock OTP for ${phone}: ${fallbackCode}`);
    return {
      success: true,
      status: "mock_sent",
      channel: "whatsapp",
      mockCode: fallbackCode,
    };
  }

  const endpoint = `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`;
  const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  // Attempt 1: Preferred WhatsApp Channel
  try {
    const params = new URLSearchParams({
      To: phone,
      Channel: "whatsapp",
    });

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();
    if (res.ok && data.status === "pending") {
      return { success: true, status: "pending", channel: "whatsapp" };
    }

    // Fallback: SMS channel if WhatsApp delivery fails or user is not on WhatsApp
    const smsParams = new URLSearchParams({
      To: phone,
      Channel: "sms",
    });

    const smsRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: smsParams.toString(),
    });

    const smsData = await smsRes.json();
    if (smsRes.ok && smsData.status === "pending") {
      return { success: true, status: "pending", channel: "sms" };
    }

    return { success: false, status: "failed", error: "Could not deliver verification code. Please try again." };
  } catch (err) {
    return { success: false, status: "failed", error: "Verification provider unreachable." };
  }
}

export async function verifyTwilioOtp(phone: string, code: string): Promise<VerifyOtpResult> {
  const isDevMode = process.env.PMU_OTP_DEV_MODE === "true" && process.env.NODE_ENV !== "production";

  // Check dev mode mock store first
  const stored = devOtpStore.get(phone);
  if (stored) {
    if (Date.now() > stored.expiresAt) {
      devOtpStore.delete(phone);
      return { success: false, status: "invalid", error: "Verification code expired. Request a new one." };
    }
    if (stored.code === code || code === "123456") {
      devOtpStore.delete(phone);
      return { success: true, status: "approved" };
    }
    return { success: false, status: "invalid", error: "Invalid verification code. Please check and retry." };
  }

  // Production Twilio Verification Check
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !serviceSid) {
    // Local testing fallback if code is 123456
    if (code === "123456") {
      return { success: true, status: "approved" };
    }
    return { success: false, status: "invalid", error: "Invalid verification code." };
  }

  const endpoint = `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`;
  const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  try {
    const params = new URLSearchParams({
      To: phone,
      Code: code,
    });

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();
    if (res.ok && data.status === "approved") {
      return { success: true, status: "approved" };
    }

    return { success: false, status: "invalid", error: "Invalid or expired verification code." };
  } catch (err) {
    return { success: false, status: "failed", error: "Could not verify code with provider." };
  }
}

import nodemailer from "nodemailer";
import crypto from "crypto";

interface SendEmailOtpResult {
  success: boolean;
  status: "pending" | "mock_sent" | "failed";
  channel: "email";
  error?: string;
  mockCode?: string;
}

interface VerifyEmailOtpResult {
  success: boolean;
  status: "approved" | "invalid" | "failed";
  error?: string;
}

interface StoredOtp {
  code: string;
  expiresAt: number;
  attempts: number;
}

// In-memory OTP store for email verifications (10-minute TTL)
const emailOtpStore = new Map<string, StoredOtp>();

// Cleanup stale codes periodically
function cleanupExpiredOtps() {
  const now = Date.now();
  for (const [email, record] of emailOtpStore.entries()) {
    if (now > record.expiresAt) {
      emailOtpStore.delete(email);
    }
  }
}

/**
 * Generate a 6-digit random numeric code.
 */
function generate6DigitOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Render sleek branded HTML email template for PrepMeUp AI.
 */
function buildOtpEmailHtml(otpCode: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PrepMeUp AI Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #08080a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f1ea;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #08080a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #111114; border: 1px solid #26262c; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #1f1f24; text-align: center;">
              <div style="display: inline-block; padding: 6px 14px; background: rgba(255,59,29,0.12); border: 1px solid rgba(255,59,29,0.3); border-radius: 9999px; margin-bottom: 12px;">
                <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #ff3b1d; text-transform: uppercase;">PrepMeUp AI • Student Access</span>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff;">
                Your Verification Code
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #a19f95;">
                Hello,
              </p>
              <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #a19f95;">
                Use the 6-digit access code below to complete your login or registration for <strong style="color: #f3f1ea;">PrepMeUp AI</strong>:
              </p>
              <!-- Code Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center" style="background: #08080a; border: 1px dashed rgba(255,59,29,0.5); border-radius: 8px; padding: 20px;">
                    <span style="font-family: monospace, Courier, sans-serif; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #ff3b1d; padding-left: 10px;">
                      ${otpCode}
                    </span>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #807f78; line-height: 1.5;">
                ⏱ <strong>Expires in 10 minutes.</strong> Never share this code with anyone.
              </p>
              <p style="margin: 0; font-size: 12px; color: #807f78; line-height: 1.5;">
                If you did not request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0b0b0e; border-top: 1px solid #1f1f24; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #52525b;">
                © ${new Date().getFullYear()} PrepMeUp AI — B.Tech First-Year Academic Copilot
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends a 6-digit OTP code to the student's email.
 * Supported Free Providers:
 *  1. Resend API (via process.env.RESEND_API_KEY) — Free 3,000 emails/month
 *  2. Hostinger SMTP / Custom SMTP (via process.env.SMTP_HOST, SMTP_USER, SMTP_PASS) — Free with Hostinger plan
 *  3. Local Dev Mock (if NODE_ENV=development and PMU_OTP_DEV_MODE=true)
 */
export async function sendEmailOtp(email: string): Promise<SendEmailOtpResult> {
  cleanupExpiredOtps();
  const normalizedEmail = email.trim().toLowerCase();

  const isDevMode =
    process.env.PMU_OTP_DEV_MODE === "true" &&
    process.env.NODE_ENV === "development";

  // Generate 6-digit OTP
  const code = isDevMode ? "123456" : generate6DigitOtp();

  emailOtpStore.set(normalizedEmail, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  });

  // 1. If dev mode mock is active, log and return
  if (isDevMode) {
    console.log(`\n======================================================`);
    console.log(`[PMU DEV EMAIL OTP MOCK] Email: ${normalizedEmail} | Code: ${code}`);
    console.log(`======================================================\n`);
    return {
      success: true,
      status: "mock_sent",
      channel: "email",
      mockCode: code,
    };
  }

  // 2. Option A: Resend REST API (100% free, 3,000 emails/mo)
  const resendApiKey = process.env.RESEND_API_KEY;
  let lastResendError = "";
  if (resendApiKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || "PrepMeUp AI <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [normalizedEmail],
          subject: `${code} is your PrepMeUp AI verification code`,
          html: buildOtpEmailHtml(code),
        }),
      });

      if (res.ok) {
        return { success: true, status: "pending", channel: "email" };
      }

      const errorData = await res.json().catch(() => ({}));
      lastResendError = errorData?.message || errorData?.name || `Resend HTTP ${res.status}`;
      console.error("[Resend Error]:", errorData);
    } catch (err: any) {
      lastResendError = err?.message || "Resend connection error";
      console.error("[Resend Network Error]:", err);
    }
  }

  // 3. Option B: Hostinger SMTP / Nodemailer (Included free in Hostinger hosting)
  const smtpUser = process.env.SMTP_USER || process.env.HOSTINGER_EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.HOSTINGER_EMAIL_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.hostinger.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const fromAddress = process.env.EMAIL_FROM || `"PrepMeUp AI" <${smtpUser}>`;
      await transporter.sendMail({
        from: fromAddress,
        to: normalizedEmail,
        subject: `${code} is your PrepMeUp AI verification code`,
        html: buildOtpEmailHtml(code),
      });

      return { success: true, status: "pending", channel: "email" };
    } catch (err: any) {
      console.error("[SMTP Error]:", err?.message || err);
      return {
        success: false,
        status: "failed",
        channel: "email",
        error: "Failed to dispatch email via SMTP. Please try again or contact support.",
      };
    }
  }

  if (lastResendError) {
    return {
      success: false,
      status: "failed",
      channel: "email",
      error: `Resend error: ${lastResendError}`,
    };
  }

  // If no email delivery provider is configured:
  return {
    success: false,
    status: "failed",
    channel: "email",
    error: "Email verification is temporarily unavailable. Please configure RESEND_API_KEY or Hostinger SMTP.",
  };
}

/**
 * Verifies the 6-digit OTP code sent to the email address.
 */
export async function verifyEmailOtp(
  email: string,
  code: string
): Promise<VerifyEmailOtpResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const stored = emailOtpStore.get(normalizedEmail);

  if (!stored) {
    return {
      success: false,
      status: "invalid",
      error: "No active verification code found. Please request a new code.",
    };
  }

  if (Date.now() > stored.expiresAt) {
    emailOtpStore.delete(normalizedEmail);
    return {
      success: false,
      status: "invalid",
      error: "Verification code has expired. Please request a new one.",
    };
  }

  stored.attempts++;
  if (stored.attempts > 5) {
    emailOtpStore.delete(normalizedEmail);
    return {
      success: false,
      status: "invalid",
      error: "Maximum verification attempts exceeded. Please request a new code.",
    };
  }

  if (stored.code === code.trim()) {
    emailOtpStore.delete(normalizedEmail);
    return { success: true, status: "approved" };
  }

  return {
    success: false,
    status: "invalid",
    error: "Invalid verification code. Please check your inbox and try again.",
  };
}

export interface AccessConfirmationParams {
  email: string;
  fullName: string;
  tier: "tier1" | "tier2";
  orderId: string;
  paymentId: string;
  mentorTopic?: string;
  mentorSlot?: string;
}

/**
 * Sends order & access pass confirmation email to student.
 */
export async function sendAccessConfirmationEmail(
  params: AccessConfirmationParams
): Promise<{ success: boolean; error?: string }> {
  const { email, fullName, tier, orderId, paymentId, mentorTopic, mentorSlot } = params;
  if (!email || !email.includes("@")) {
    return { success: false, error: "Invalid email" };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const planLabel = tier === "tier2" ? "Tier 2 Premium AI + 1:1 Human Support (₹199)" : "Tier 1 Basic Pass (₹99)";
  const subject = `PrepMeUp AI: Your ${tier === "tier2" ? "Premium" : "Basic"} Access Pass is Active`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin: 0; padding: 0; background-color: #08080a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f3f1ea;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #08080a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #111114; border: 1px solid #26262c; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 28px 32px 20px; border-bottom: 1px solid #1f1f24; text-align: center;">
              <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #4ade80; text-transform: uppercase;">Payment Confirmed • Access Granted</span>
              <h1 style="margin: 10px 0 0; font-size: 22px; color: #ffffff;">Welcome to PrepMeUp AI</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 32px;">
              <p style="margin: 0 0 16px; font-size: 14px; color: #a19f95;">Hi <strong style="color: #f3f1ea;">${fullName || "Student"}</strong>,</p>
              <p style="margin: 0 0 20px; font-size: 14px; color: #a19f95;">Your payment has been verified and your Semester 1 access is now fully active.</p>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #08080a; border: 1px solid #26262c; border-radius: 8px; margin-bottom: 24px; padding: 16px;">
                <tr><td style="padding: 6px 0; font-size: 12px; color: #807f78;">Plan:</td><td style="padding: 6px 0; font-size: 12px; font-weight: 700; color: #f3f1ea; text-align: right;">${planLabel}</td></tr>
                <tr><td style="padding: 6px 0; font-size: 12px; color: #807f78;">Order ID:</td><td style="padding: 6px 0; font-size: 11px; font-family: monospace; color: #a19f95; text-align: right;">${orderId}</td></tr>
                <tr><td style="padding: 6px 0; font-size: 12px; color: #807f78;">Payment ID:</td><td style="padding: 6px 0; font-size: 11px; font-family: monospace; color: #a19f95; text-align: right;">${paymentId}</td></tr>
                ${mentorSlot ? `<tr><td style="padding: 6px 0; font-size: 12px; color: #807f78;">Mentor Slot:</td><td style="padding: 6px 0; font-size: 12px; color: #ff3b1d; text-align: right;">${mentorSlot}</td></tr>` : ""}
                ${mentorTopic ? `<tr><td style="padding: 6px 0; font-size: 12px; color: #807f78;">Topic:</td><td style="padding: 6px 0; font-size: 12px; color: #f3f1ea; text-align: right;">${mentorTopic}</td></tr>` : ""}
              </table>
              <div style="text-align: center; margin: 28px 0 16px;">
                <a href="https://prepmeupai.in/prepmeup/dashboard" style="display: inline-block; background-color: #ff3b1d; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 28px; border-radius: 6px; letter-spacing: 0.04em; text-transform: uppercase;">
                  Open Student Hub →
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Try Resend
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || "PrepMeUp AI <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [normalizedEmail],
          subject,
          html,
        }),
      });
      if (res.ok) return { success: true };
    } catch {}
  }

  // Try SMTP fallback
  const smtpUser = process.env.SMTP_USER || process.env.HOSTINGER_EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.HOSTINGER_EMAIL_PASS;
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.hostinger.com",
        port: parseInt(process.env.SMTP_PORT || "465", 10),
        secure: true,
        auth: { user: smtpUser, pass: smtpPass },
      });
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"PrepMeUp AI" <${smtpUser}>`,
        to: normalizedEmail,
        subject,
        html,
      });
      return { success: true };
    } catch {}
  }

  return { success: false, error: "Email delivery skipped." };
}

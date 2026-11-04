import crypto from "crypto";
import Razorpay from "razorpay";

/**
 * Dedicated CyberSecurity Razorpay credentials.
 * Deliberately separate from the existing portfolio `/courses` and Quantum
 * Razorpay configuration so those flows remain untouched.
 */
export function getCyberRazorpayCredentials() {
  return {
    keyId:
      process.env.CYBER_RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_CYBER_RAZORPAY_KEY_ID ||
      "",
    keySecret: process.env.CYBER_RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.CYBER_RAZORPAY_WEBHOOK_SECRET || "",
  };
}

export function isCyberRazorpayConfigured(): boolean {
  const { keyId, keySecret } = getCyberRazorpayCredentials();
  return Boolean(keyId && keySecret);
}

export function createCyberRazorpayClient(): Razorpay | null {
  const { keyId, keySecret } = getCyberRazorpayCredentials();
  if (!keyId || !keySecret) return null;

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * HMAC-SHA256(order_id + "|" + payment_id, CYBER key secret) with timing-safe compare.
 */
export function verifyCyberRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = getCyberRazorpayCredentials();
  if (!keySecret || !params.orderId || !params.paymentId || !params.signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf-8");
  const providedBuf = Buffer.from(params.signature, "utf-8");

  if (expectedBuf.length !== providedBuf.length) return false;
  try {
    return crypto.timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}

/**
 * Verifies `X-Razorpay-Signature` against the raw webhook body.
 * Only the dedicated CyberSecurity webhook secret is accepted.
 */
export function verifyCyberRazorpayWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const { webhookSecret } = getCyberRazorpayCredentials();
  if (!webhookSecret || !signature) return false;

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf-8");
  const providedBuf = Buffer.from(signature, "utf-8");

  if (expectedBuf.length !== providedBuf.length) return false;
  try {
    return crypto.timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}

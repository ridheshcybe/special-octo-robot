import crypto from "crypto";
import Razorpay from "razorpay";

/**
 * Dedicated credentials for the Phase C3 unified PrepMeUp checkout.
 *
 * Deliberately separate from:
 *  - the portfolio `/courses` Razorpay configuration,
 *  - the Phase Q3 Quantum configuration,
 *  - the Phase C2 CyberSecurity configuration.
 *
 * That keeps every existing webhook and order flow untouched while unified
 * revenue can be rotated independently.
 */
export function getUnifiedRazorpayCredentials() {
  return {
    keyId:
      process.env.UNIFIED_RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_UNIFIED_RAZORPAY_KEY_ID ||
      "",
    keySecret: process.env.UNIFIED_RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.UNIFIED_RAZORPAY_WEBHOOK_SECRET || "",
  };
}

export function isUnifiedRazorpayConfigured(): boolean {
  const { keyId, keySecret } = getUnifiedRazorpayCredentials();
  return Boolean(keyId && keySecret);
}

export function createUnifiedRazorpayClient(): Razorpay | null {
  const { keyId, keySecret } = getUnifiedRazorpayCredentials();
  if (!keyId || !keySecret) return null;

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * HMAC-SHA256(order_id + "|" + payment_id, key secret) with timing-safe compare.
 */
export function verifyUnifiedRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = getUnifiedRazorpayCredentials();
  if (!keySecret || !params.orderId || !params.paymentId || !params.signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");

  return timingSafeHexEqual(expected, params.signature);
}

/**
 * Verifies `X-Razorpay-Signature` against the raw request body.
 * Only the unified webhook secret is accepted.
 */
export function verifyUnifiedRazorpayWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const { webhookSecret } = getUnifiedRazorpayCredentials();
  if (!webhookSecret || !signature) return false;

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  return timingSafeHexEqual(expected, signature);
}

function timingSafeHexEqual(expected: string, provided: string): boolean {
  const expectedBuf = Buffer.from(expected, "utf-8");
  const providedBuf = Buffer.from(provided, "utf-8");
  if (expectedBuf.length !== providedBuf.length) return false;
  try {
    return crypto.timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}

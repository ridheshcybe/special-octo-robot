import crypto from "crypto";
import Razorpay from "razorpay";

export function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET || "";
  return { keyId, keySecret };
}

export function createRazorpayClient(): Razorpay | null {
  const { keyId, keySecret } = getRazorpayCredentials();
  if (!keyId || !keySecret) {
    return null;
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Validates Razorpay Payment Signature using HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = getRazorpayCredentials();
  if (!keySecret || !params.orderId || !params.paymentId || !params.signature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");

  try {
    const a = Buffer.from(generatedSignature, "utf8");
    const b = Buffer.from(params.signature, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return generatedSignature === params.signature;
  }
}

/**
 * Validates Razorpay Webhook Signature using HMAC-SHA256 over raw body
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const { keySecret } = getRazorpayCredentials();
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || keySecret;

  if (!webhookSecret || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  return expectedSignature === signature;
}

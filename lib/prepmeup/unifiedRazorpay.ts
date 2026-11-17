import crypto from "crypto";
import Razorpay from "razorpay";

export function getUnifiedRazorpayCredentials() {
  const keyId =
    process.env.UNIFIED_RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_UNIFIED_RAZORPAY_KEY_ID ||
    process.env.CYBER_RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_CYBER_RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    "";
  const keySecret =
    process.env.UNIFIED_RAZORPAY_KEY_SECRET ||
    process.env.CYBER_RAZORPAY_KEY_SECRET ||
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.RAZORPAY_SECRET ||
    "";
  return { keyId, keySecret };
}

export function createUnifiedRazorpayClient(): Razorpay | null {
  const { keyId, keySecret } = getUnifiedRazorpayCredentials();
  if (!keyId || !keySecret) {
    return null;
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Validates Unified Razorpay Payment Signature using HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 */
export function verifyUnifiedRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret?: string;
}): boolean {
  const { keySecret: credSecret } = getUnifiedRazorpayCredentials();
  const keySecret = params.secret || credSecret;
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
 * Validates Unified Razorpay Webhook Signature using HMAC-SHA256 over raw body
 */
export function verifyUnifiedRazorpayWebhookSignature(
  paramsOrRawBody:
    | {
        rawBody: string;
        signature: string;
        secret?: string;
      }
    | string,
  maybeSignature?: string,
  maybeSecret?: string
): boolean {
  let rawBody: string;
  let signature: string;
  let secretOverride: string | undefined;

  if (typeof paramsOrRawBody === "object") {
    rawBody = paramsOrRawBody.rawBody;
    signature = paramsOrRawBody.signature;
    secretOverride = paramsOrRawBody.secret;
  } else {
    rawBody = paramsOrRawBody;
    signature = maybeSignature || "";
    secretOverride = maybeSecret;
  }

  const { keySecret } = getUnifiedRazorpayCredentials();
  const webhookSecret =
    secretOverride ||
    process.env.UNIFIED_RAZORPAY_WEBHOOK_SECRET ||
    process.env.CYBER_RAZORPAY_WEBHOOK_SECRET ||
    process.env.RAZORPAY_WEBHOOK_SECRET ||
    keySecret;

  if (!webhookSecret || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  try {
    const expectedBuf = Buffer.from(expectedSignature, "utf-8");
    const sigBuf = Buffer.from(signature, "utf-8");
    return expectedBuf.length === sigBuf.length && crypto.timingSafeEqual(expectedBuf, sigBuf);
  } catch {
    return false;
  }
}

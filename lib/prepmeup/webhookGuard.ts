import crypto from "crypto";

/**
 * PrepMeUp AI — Phase S1-A fail-closed webhook authorization.
 *
 * Razorpay signs webhooks with HMAC-SHA256 over the *raw* request body using the
 * webhook secret. A missing secret is a configuration failure: the request must
 * be rejected with 503 and nothing may be processed.
 *
 * Kept free of Next.js imports so it is directly unit-testable.
 */

export type WebhookAuthorization =
  | { ok: true }
  | { ok: false; status: 400; error: "INVALID_SIGNATURE" }
  | { ok: false; status: 503; error: "WEBHOOK_SECRET_MISSING" };

export function computeWebhookSignature(rawBody: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}

/**
 * Returns 503 when no secret is configured, 400 for a missing/mismatched
 * signature, and ok only when the signature matches in constant time.
 */
export function authorizeWebhookRequest(params: {
  secret: string | undefined | null;
  rawBody: string;
  signature: string | undefined | null;
}): WebhookAuthorization {
  const secret = params.secret?.trim();
  if (!secret) {
    return { ok: false, status: 503, error: "WEBHOOK_SECRET_MISSING" };
  }

  const provided = (params.signature || "").trim();
  if (!provided) {
    return { ok: false, status: 400, error: "INVALID_SIGNATURE" };
  }

  const expected = computeWebhookSignature(params.rawBody, secret);
  const expectedBuffer = Buffer.from(expected, "utf-8");
  const providedBuffer = Buffer.from(provided, "utf-8");

  if (expectedBuffer.length !== providedBuffer.length) {
    return { ok: false, status: 400, error: "INVALID_SIGNATURE" };
  }

  try {
    if (!crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
      return { ok: false, status: 400, error: "INVALID_SIGNATURE" };
    }
  } catch {
    return { ok: false, status: 400, error: "INVALID_SIGNATURE" };
  }

  return { ok: true };
}

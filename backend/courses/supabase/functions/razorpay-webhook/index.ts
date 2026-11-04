// ============================================================================
// razorpay-webhook — edge function (Deno). The source of truth for payments.
//   1. Reads the RAW body and verifies X-Razorpay-Signature
//      (HMAC-SHA256 of the raw bytes with RAZORPAY_WEBHOOK_SECRET).
//   2. On payment.captured, calls public.grant_access() which is IDEMPOTENT:
//      the same event delivered twice can never extend access twice.
//   3. On payment.failed, marks the row failed (never overwrites 'paid').
// Secrets: RAZORPAY_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY.
// ============================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
  if (!secret) return json({ error: "Webhook not configured." }, 503);

  // 1. Raw body exactly as Razorpay signed it.
  const raw = await req.text();

  // 2. Timing-safe signature verification BEFORE parsing/trusting anything.
  const expected = await hmacSha256Hex(secret, raw);
  const received = req.headers.get("x-razorpay-signature") ?? "";
  if (!received || !safeEqualHex(expected, received)) {
    return json({ error: "Invalid signature." }, 400);
  }

  // 3. Parse only after verification.
  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id) return json({ received: true }); // not our concern

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (event.event === "payment.captured") {
    // grant_access() is a single SQL transaction: row-locks the payment,
    // returns early if already 'paid', extends expiry, marks paid.
    const { error } = await admin.rpc("grant_access", {
      p_razorpay_order_id: payment.order_id,
      p_razorpay_payment_id: payment.id ?? null,
    });
    if (error) {
      console.error("grant_access failed:", error.message);
      return json({ error: "Could not grant access." }, 500); // Razorpay retries
    }
    return json({ received: true });
  }

  if (event.event === "payment.failed") {
    await admin
      .from("payments")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("razorpay_order_id", payment.order_id)
      .eq("status", "created"); // never overwrite a 'paid' row
    return json({ received: true });
  }

  return json({ received: true });
});

// ============================================================================
// create-order — edge function (Deno)
// Validates the plan server-side, creates a Razorpay order, stores it as
// 'created'. The client may call this but never decides amounts or status.
// Secrets: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (supabase secrets set).
// ============================================================================
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function fail(message: string, status: number): Response {
  return json({ error: message }, status);
}

/** Authenticated Supabase client bound to the caller (RLS applies). */
async function userClient(req: Request): Promise<{ client: SupabaseClient; userId: string } | null> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return null;

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;

  // Client below runs with the user's JWT so RLS applies to table reads.
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  return { client, userId: data.user.id };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  // 1. Must be signed in.
  const ctx = await userClient(req);
  if (!ctx) return fail("Sign in to buy a pass.", 401);

  // 2. Validate input: only plan_id is accepted from the client.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body.", 400);
  }
  const planId = Number((body as { plan_id?: unknown })?.plan_id);
  if (!Number.isInteger(planId) || planId <= 0) return fail("Invalid plan.", 400);

  // 3. Razorpay configured?
  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret) return fail("Payments are not configured.", 503);

  // 4. Read the plan under RLS: only ACTIVE plans are readable, so a
  //    deactivated plan cannot be bought even with a crafted request.
  const { data: plan } = await ctx.client
    .from("plans")
    .select("id, name, price_inr")
    .eq("id", planId)
    .eq("active", true)
    .maybeSingle();
  if (!plan) return fail("That plan is not available.", 404);

  // 5. Create the order with the server-side amount (paise).
  const auth = btoa(`${keyId}:${keySecret}`);
  let order: { id: string; amount: number; currency: string };
  try {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: plan.price_inr * 100,
        currency: "INR",
        receipt: `plan_${plan.id}`,
        notes: { plan_id: String(plan.id), user_id: ctx.userId },
      }),
    });
    if (!res.ok) {
      console.error("razorpay order failed:", await res.text());
      return fail("Could not create the order. Try again.", 502);
    }
    order = await res.json();
  } catch (err) {
    console.error("razorpay fetch error:", err);
    return fail("Could not reach the payment gateway.", 502);
  }

  // 6. Record it with the service role (users cannot write payments via RLS).
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { error: insertError } = await admin.from("payments").insert({
    user_id: ctx.userId,
    plan_id: plan.id,
    razorpay_order_id: order.id,
    amount: plan.price_inr * 100,
    status: "created",
  });
  if (insertError) {
    console.error("payment insert failed:", insertError.message);
    return fail("Could not record the order. Try again.", 500);
  }

  return json({ order_id: order.id, amount: order.amount, currency: order.currency });
});

// ============================================================================
// admin-grant-days — edge function (Deno)
// Manually extends a user's access by N days. Extends from the CURRENT expiry
// when still active — the same rule as a paid purchase. Admin-only: verifies
// the caller's role server-side; input validated before touching the DB.
// ============================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return null;

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data, error } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
  if (error || !data.user) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  return profile?.role === "admin" ? admin : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const admin = await requireAdmin(req);
  if (!admin) return json({ error: "Admin access required." }, 403);

  // 1. Validate input.
  let body: { user_id?: unknown; days?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }
  const userId = typeof body.user_id === "string" ? body.user_id : "";
  const days = Number(body.days);
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(userId)) return json({ error: "Invalid user." }, 400);
  if (!Number.isInteger(days) || days < 1 || days > 3650) {
    return json({ error: "Days must be between 1 and 3650." }, 400);
  }

  // 2. Load the target profile (service role — any user).
  const { data: profile } = await admin
    .from("profiles")
    .select("id, access_expires_at")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) return json({ error: "User not found." }, 404);

  // 3. Extend from the current expiry when still active (same rule as buying).
  const base = Math.max(
    profile.access_expires_at ? new Date(profile.access_expires_at).getTime() : 0,
    Date.now(),
  );
  const newExpiry = new Date(base + days * 86_400_000).toISOString();

  const { error: updErr } = await admin
    .from("profiles")
    .update({ access_expires_at: newExpiry, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (updErr) return json({ error: updErr.message }, 500);

  return json({ ok: `Granted ${days} day(s).` });
});

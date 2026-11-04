// ============================================================================
// admin-list-users — edge function (Deno)
// Returns profiles + emails for the admin panel. Verifies the caller's JWT
// AND their profiles.role = 'admin' before reading with the service role.
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

  const admin = await requireAdmin(req);
  if (!admin) return json({ error: "Admin access required." }, 403);

  const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
  return json({
    users: (users?.users ?? []).map((u) => ({ id: u.id, email: u.email ?? "" })),
  });
});

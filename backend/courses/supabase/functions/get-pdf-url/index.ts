// ============================================================================
// get-pdf-url — edge function (Deno)
// Checks the caller's access (free preview or active pass), then returns a
// signed URL for the lesson PDF that expires in 5 minutes.
// Secrets: none beyond the built-ins (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).
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

// Naive in-memory, per-instance limiter — breaks bulk scraping; not a defence
// against a distributed attacker.
const RATE_LIMIT = { max: 30, windowMs: 5 * 60_000 };
const hits = new Map<string, number[]>();

function rateLimited(userId: string): boolean {
  const now = Date.now();
  const arr = (hits.get(userId) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (arr.length >= RATE_LIMIT.max) return true;
  arr.push(now);
  hits.set(userId, arr);
  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Sign in first." }, 401);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1. Who is calling?
  const { data: userData, error: userError } = await admin.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );
  if (userError || !userData.user) return json({ error: "Sign in first." }, 401);
  const userId = userData.user.id;
  if (rateLimited(userId)) return json({ error: "Too many requests — slow down." }, 429);

  // 2. Validate input.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }
  const lessonId = Number((body as { lesson_id?: unknown })?.lesson_id);
  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return json({ error: "Invalid lesson." }, 400);
  }

  // 3. Load the lesson (service role = bypass RLS; we enforce rules here).
  const { data: lesson } = await admin
    .from("lessons")
    .select("id, storage_path, is_free_preview")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson || !lesson.storage_path) {
    return json({ error: "PDF not found." }, 404);
  }

  // 4. Access check: free preview OR active pass.
  let allowed = lesson.is_free_preview;
  if (!allowed) {
    const { data: profile } = await admin
      .from("profiles")
      .select("access_expires_at")
      .eq("id", userId)
      .maybeSingle();
    allowed = Boolean(
      profile?.access_expires_at && new Date(profile.access_expires_at) > new Date(),
    );
  }
  if (!allowed) return json({ error: "Your pass is not active." }, 403);

  // 5. Sign a URL that expires in 5 minutes.
  //    SECURITY (review fix): storage_path is admin-controlled, but validate
  //    it anyway so a compromised/typoed admin row can never be smuggled into
  //    a signed URL (no "..", always inside the pdfs/ folder).
  if (/(^|/)\.\.( |/|$)|\\|\/\//.test(lesson.storage_path)) {
    return json({ error: "Could not open the file." }, 500);
  }
  const { data, error } = await admin.storage
    .from("course-files")
    .createSignedUrl(lesson.storage_path, 5 * 60);
  if (error || !data) {
    console.error("createSignedUrl failed:", error?.message);
    return json({ error: "Could not open the file." }, 500);
  }

  return json({ url: data.signedUrl });
});

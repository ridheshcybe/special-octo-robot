// ============================================================================
// get-video — edge function (Deno). Phase 2 (updated by security review).
// Returns the unlisted YouTube id for a lesson ONLY after verifying the
// caller's access (free preview or active pass) and that the lesson belongs
// to a published course.
//
// SECURITY (review fix): a live lesson whose Meet window has passed must NOT
// be servable here even if its recording_youtube_id was copied into
// youtube_id — recordings belong to get-live-link. This function only ever
// serves lessons of type "video".
// Also adds a naive per-user rate limit (30 req / 5 min) to make bulk
// scraping of video ids pointless.
// ============================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

// Naive in-memory, per-instance limiter — enough to break scraping scripts;
// not a defence against a distributed attacker.
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

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
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

  // 3. Lesson must exist, be type "video", and sit in a PUBLISHED course.
  //    (Unpublished courses were servable before — fixed.)
  const { data: lesson } = await admin
    .from("lessons")
    .select("id, type, is_free_preview, courses!inner(published)")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson) return json({ error: "Lesson not found." }, 404);
  if (!lesson.courses?.published) return json({ error: "Lesson not found." }, 404);
  if (lesson.type !== "video") {
    return json({ error: "This lesson has no video." }, 400);
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

  // 5. Return the gated id.
  const { data: secret } = await admin
    .from("lesson_secrets")
    .select("youtube_id")
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (!secret?.youtube_id) {
    return json({ error: "Video not available yet." }, 404);
  }

  return json({ youtube_id: secret.youtube_id });
});

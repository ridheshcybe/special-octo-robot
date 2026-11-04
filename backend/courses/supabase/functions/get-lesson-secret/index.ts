// ============================================================================
// get-lesson-secret — edge function (Deno)
// Returns the gated part of a lesson (youtube_id for video, meeting_url +
// starts_at for live) ONLY after verifying access. The normal API can serve
// lesson metadata to anyone on a published course, but these values are kept
// in lesson_secrets and are served exclusively through this function.
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

// Naive in-memory, per-instance limiter — same as the other gated functions.
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

  const { data: userData, error: userError } = await admin.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );
  if (userError || !userData.user) return json({ error: "Sign in first." }, 401);
  const userId = userData.user.id;
  if (rateLimited(userId)) return json({ error: "Too many requests — slow down." }, 429);

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

  // Lesson metadata + course publication check.
  const { data: lesson } = await admin
    .from("lessons")
    .select("id, type, is_free_preview, courses!inner(published)")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson) return json({ error: "Lesson not found." }, 404);
  if (!lesson.courses?.published) return json({ error: "Lesson not found." }, 404);

  // SECURITY: live-session links must ONLY come from get-live-link, which
  // enforces the server-clock join window. Serving meeting_url here would let
  // any subscriber read it days early.
  if (lesson.type === "live") {
    return json(
      { error: "Use the live-session page — the link opens near the start time." },
      423,
    );
  }

  const { data: secret } = await admin
    .from("lesson_secrets")
    .select("youtube_id, meeting_url, starts_at")
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (!secret) return json({ error: "Nothing to unlock for this lesson yet." }, 404);

  // Access check: free preview OR active pass.
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

  // Return only the fields relevant to this lesson type.
  if (lesson.type === "video") {
    return json({ type: "video", youtube_id: secret.youtube_id });
  }
  return json({ error: "This lesson has no gated link." }, 400);
});

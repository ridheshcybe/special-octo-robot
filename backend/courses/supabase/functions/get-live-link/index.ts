// ============================================================================
// get-live-link — edge function (Deno). Phase 3.
// Gated Google Meet links for live sessions:
//   • Returns meeting_url ONLY when the caller has active access AND "now"
//     is within [start − 10 min, start + duration]. Outside the window the
//     link is never sent — the server clock is the source of truth.
//   • After the session ends, if the admin attached a recording, returns the
//     gated recording_youtube_id instead (behind the same access check).
// Access rule identical to every other gated function: free preview OR
// profiles.access_expires_at > now().
// ============================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

/** How early before start the Meet link unlocks. */
const JOIN_WINDOW_MINUTES = 10;

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

  // 3. Load the lesson; must be a live session.
  const { data: lesson } = await admin
    .from("lessons")
    .select("id, type, is_free_preview, live_starts_at, live_duration_minutes")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson || lesson.type !== "live") {
    return json({ error: "This is not a live session." }, 404);
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

  // 5. Session must be scheduled.
  if (!lesson.live_starts_at) {
    return json({ error: "The session time has not been announced yet." }, 409);
  }

  const startsAt = new Date(lesson.live_starts_at).getTime();
  const endsAt = startsAt + (lesson.live_duration_minutes ?? 90) * 60_000;
  const joinOpensAt = startsAt - JOIN_WINDOW_MINUTES * 60_000;
  const now = Date.now(); // server clock — the client cannot change this

  // 6. After the end: serve the recording instead of the Meet link.
  if (now > endsAt) {
    const { data: secret } = await admin
      .from("lesson_secrets")
      .select("recording_youtube_id")
      .eq("lesson_id", lessonId)
      .maybeSingle();
    if (secret?.recording_youtube_id) {
      return json({
        state: "recording",
        recording_youtube_id: secret.recording_youtube_id,
      });
    }
    return json({ state: "ended", error: "This session has ended. Recording coming soon." }, 410);
  }

  // 7. Before the join window: no link, ever.
  if (now < joinOpensAt) {
    return json(
      { state: "upcoming", starts_at: lesson.live_starts_at, error: "The room opens 10 minutes before the session." },
      423,
    );
  }

  // 8. Inside the window: hand over the Meet URL.
  const { data: secret } = await admin
    .from("lesson_secrets")
    .select("meeting_url")
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (!secret?.meeting_url) {
    return json({ error: "The meeting link has not been added yet." }, 404);
  }

  return json({
    state: "live",
    meeting_url: secret.meeting_url,
    starts_at: lesson.live_starts_at,
    ends_at: new Date(endsAt).toISOString(),
  });
});

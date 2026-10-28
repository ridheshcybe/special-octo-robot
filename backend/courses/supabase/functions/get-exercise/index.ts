// ============================================================================
// get-exercise — edge function (Deno). Phase 5.
// Serves exercise content (instructions, starter code, tests, hints, sample
// DB) for a lesson of type "exercise" — ONLY after the same access check as
// every gated function (free preview OR access_expires_at > now()), and only
// for PUBLISHED courses.
//
// Why an edge function at all: the exercises table is admin-only via RLS (the
// Phase-1 review's lesson: no subscriber-readable secret table). The function
// reads it with the service role after ITS OWN checks — same pattern as
// get-video / get-live-link.
// Returns: exercise fields + any existing progress (so the UI can restore
// the student's latest code and best score).
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

  // 3. Lesson must exist, be an exercise, in a PUBLISHED course.
  const { data: lesson } = await admin
    .from("lessons")
    .select("id, type, is_free_preview, courses!inner(published)")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson) return json({ error: "Lesson not found." }, 404);
  if (!lesson.courses?.published) return json({ error: "Lesson not found." }, 404);
  if (lesson.type !== "exercise") {
    return json({ error: "This lesson is not an exercise." }, 400);
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

  // 5. Load the exercise content (service role reads the admin-only table).
  const { data: ex } = await admin
    .from("exercises")
    .select("language, instructions_md, starter_code, tests, hints, sample_db_sql")
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (!ex) return json({ error: "Exercise content missing." }, 404);

  // 6. Existing progress (best score, latest code) so the UI can restore it.
  const { data: progress } = await admin
    .from("exercise_progress")
    .select("latest_code, best_score, passed, attempts")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  return json({
    lesson_id: lessonId,
    language: ex.language,
    instructions_md: ex.instructions_md,
    starter_code: ex.starter_code,
    tests: ex.tests ?? [],
    hints: ex.hints ?? [],
    sample_db_sql: ex.sample_db_sql ?? "",
    progress: progress ?? null,
  });
});

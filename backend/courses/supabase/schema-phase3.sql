-- ============================================================================
-- Phase 3 — live sessions (gated Google Meet links, zero cost)
-- Run AFTER schema.sql and schema-phase2.sql in: Supabase SQL Editor.
--
-- Design:
--   • Schedule metadata (start time, duration) lives on `lessons` — it is NOT
--     secret (students see "Live on Sat 6 PM" and a countdown; only the Meet
--     link is gated).
--   • The Meet URL stays in lesson_secrets (gated, Phase 1).
--   • recording_youtube_id also lives in lesson_secrets: it is paid content,
--     served only by get-live-link after the session ends.
--   • The 10-minutes-before join window is enforced SERVER-SIDE in the
--     get-live-link edge function — the client countdown is just UX.
-- ============================================================================

-- Public schedule columns (readable via the normal lessons policy).
alter table public.lessons
  add column if not exists live_starts_at timestamptz;
alter table public.lessons
  add column if not exists live_duration_minutes int not null default 90
    check (live_duration_minutes between 5 and 600);

-- Gated recording (added by the admin after the session).
alter table public.lesson_secrets
  add column if not exists recording_youtube_id text;

-- Handy index for the dashboard "upcoming sessions" strip.
create index if not exists lessons_live_upcoming_idx
  on public.lessons (live_starts_at)
  where type = 'live' and live_starts_at is not null;

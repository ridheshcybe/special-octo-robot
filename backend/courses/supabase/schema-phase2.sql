-- ============================================================================
-- Phase 2 — video lessons (unlisted YouTube embeds)
-- Run AFTER schema.sql in: Supabase Dashboard → SQL Editor → New query.
--
-- Adds per-user playback progress so students resume where they stopped.
-- Rows are tiny (one per user per lesson) — free-tier friendly.
-- The youtube_id itself stays in lesson_secrets (Phase 1), which non-
-- subscribers can never read; get-video is the only path to it.
-- ============================================================================

-- ----------------------------------------------------------- lesson_progress
create table if not exists public.lesson_progress (
  user_id       uuid not null references public.profiles (id) on delete cascade,
  lesson_id     bigint not null references public.lessons (id) on delete cascade,
  position_sec  real not null default 0,
  updated_at    timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

drop policy if exists "progress own all" on public.lesson_progress;
create policy "progress own all" on public.lesson_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

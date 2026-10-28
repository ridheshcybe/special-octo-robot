-- ============================================================================
-- Phase 4 — self-hosted video (Cloudflare R2 + HLS, hls.js)
-- Run AFTER schema.sql, schema-phase2.sql and schema-phase3.sql in:
-- Supabase SQL Editor.
--
-- Design:
--   • videos live in a PRIVATE R2 bucket as HLS (360p/480p/720p segments).
--     Nothing video-ish goes into Supabase Storage (1 GB cap stays for PDFs).
--   • `lessons.video_source` is PUBLIC on purpose: the lesson page needs to
--     know which player to mount before it asks any edge function. It leaks
--     no content — just "youtube" vs "hls".
--   • `lesson_secrets.hls_path` is GATED: the object key of the master
--     playlist inside the R2 bucket (e.g. `hls/lesson-7/master.m3u8`). Only
--     get-hls-url reads it, after the usual access check, and turns it into
--     short-lived presigned URLs. The bucket itself has no public access.
-- ============================================================================

-- Which player/renderer this video lesson uses.
alter table public.lessons
  add column if not exists video_source text not null default 'youtube'
    check (video_source in ('youtube', 'hls'));

-- Gated R2 key of the HLS master playlist (lesson_secrets is already
-- admin-write / no-anon-read from Phase 1, so no new policy is needed).
alter table public.lesson_secrets
  add column if not exists hls_path text;

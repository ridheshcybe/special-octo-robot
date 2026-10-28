-- ============================================================================
-- PrepMeUp AI — Phase 3 Database & Storage Migration
-- Safe, additive migration:
--  1. Private Supabase Storage bucket `pmu-content` and storage RLS policies.
--  2. Schema alignment for syllabus files, notes markdown, drafts, PYQ.
--  3. Strict Row-Level Security ensuring non-admin students NEVER see drafts.
-- ============================================================================

-- Enable UUID extension if not already present
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. Create Private Storage Bucket for PrepMeUp Content
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pmu-content',
  'pmu-content',
  false, -- STRICTLY PRIVATE: Access mediated only via short-lived signed URLs
  52428800, -- 50 MB limit
  array['application/pdf', 'text/markdown', 'text/plain', 'application/json']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 52428800;

-- Storage RLS: Admin Full Access
drop policy if exists "pmu_storage_admin_all" on storage.objects;
create policy "pmu_storage_admin_all" on storage.objects
  for all using (
    bucket_id = 'pmu-content'
    and (public.pmu_is_admin() or auth.uid() in (select id from public.pmu_admins))
  )
  with check (
    bucket_id = 'pmu-content'
    and (public.pmu_is_admin() or auth.uid() in (select id from public.pmu_admins))
  );

-- Storage RLS: Deny public/student direct select (enforced by private bucket + no student select policy).

-- ----------------------------------------------------------------------------
-- 2. New Table: `pmu_syllabus_files`
-- Tracks uploaded syllabus documents, extracted text, and AI-structured JSON.
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_syllabus_files (
  id                  uuid primary key default gen_random_uuid(),
  subject_id          uuid not null references public.pmu_subjects (id) on delete cascade,
  file_path           text not null,
  original_filename   text not null,
  extracted_text      text not null default '',
  structured_json     jsonb not null default '{}'::jsonb,
  status              text not null default 'pending_extraction'
                      check (status in ('pending_extraction', 'extracted', 'applied_to_curriculum', 'failed')),
  uploaded_by         uuid references auth.users (id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.pmu_syllabus_files enable row level security;

create policy "pmu_syllabus_files_admin_all" on public.pmu_syllabus_files
  for all using (public.pmu_is_admin())
  with check (public.pmu_is_admin());

-- ----------------------------------------------------------------------------
-- 3. Schema Alignment for `pmu_notes`
-- Adds content_markdown, storage_path, is_published, and status hardening.
-- ----------------------------------------------------------------------------
alter table public.pmu_notes
  add column if not exists content_markdown text not null default '',
  add column if not exists storage_path text,
  add column if not exists is_published boolean not null default false;

-- Sync content column if content_markdown is populated
update public.pmu_notes
set content_markdown = content
where content_markdown = '' and content is not null and content != '';

-- Re-harden `pmu_notes` RLS:
-- Non-admin students can SELECT ONLY when is_published = true AND status in ('approved', 'published')
drop policy if exists "pmu_notes_select" on public.pmu_notes;
create policy "pmu_notes_select" on public.pmu_notes
  for select using (
    (is_published = true and status in ('approved', 'published') and (is_sample = true or auth.uid() is not null))
    or public.pmu_is_admin()
  );

-- ----------------------------------------------------------------------------
-- 4. Schema Alignment for `pmu_past_papers`
-- ----------------------------------------------------------------------------
alter table public.pmu_past_papers
  add column if not exists file_path text,
  add column if not exists solution_path text;

-- Sync url columns if file_path is empty
update public.pmu_past_papers
set file_path = question_paper_url
where file_path is null and question_paper_url is not null;

-- Re-harden `pmu_past_papers` RLS:
drop policy if exists "pmu_past_papers_select" on public.pmu_past_papers;
create policy "pmu_past_papers_select" on public.pmu_past_papers
  for select using (
    (is_published = true) or public.pmu_is_admin()
  );

-- ----------------------------------------------------------------------------
-- 5. Schema Alignment for `pmu_ai_content_drafts`
-- ----------------------------------------------------------------------------
alter table public.pmu_ai_content_drafts
  add column if not exists prompt_summary text not null default '',
  add column if not exists model_used text not null default 'gemini-2.5-flash';

-- Ensure status supports required states
alter table public.pmu_ai_content_drafts drop constraint if exists pmu_ai_content_drafts_status_check;
alter table public.pmu_ai_content_drafts add constraint pmu_ai_content_drafts_status_check
  check (status in ('pending_review', 'approved', 'rejected', 'regenerated', 'draft'));

-- ----------------------------------------------------------------------------
-- 6. Indexes for Phase 3 queries
-- ----------------------------------------------------------------------------
create index if not exists pmu_idx_syllabus_subject on public.pmu_syllabus_files (subject_id, status);
create index if not exists pmu_idx_notes_published on public.pmu_notes (topic_id, is_published, status);
create index if not exists pmu_idx_drafts_status on public.pmu_ai_content_drafts (status, draft_type);
create index if not exists pmu_idx_past_papers_subj_year on public.pmu_past_papers (subject_id, exam_year, is_published);

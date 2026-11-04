-- ============================================================================
-- PrepMeUp AI — Phase 5 Database Migration: AI Doubt Assistant & Coding Helper
-- Safe, additive migration:
--  1. Align `pmu_doubts`, `pmu_doubt_messages`, `pmu_coding_sessions`
--  2. Strict Row-Level Security ensuring student isolation
-- ============================================================================

-- 1. Align `pmu_doubts`
alter table public.pmu_doubts
  add column if not exists student_id uuid references public.pmu_profiles (id) on delete cascade;

update public.pmu_doubts
set student_id = user_id
where student_id is null and user_id is not null;

-- 2. Align `pmu_doubt_messages`
alter table public.pmu_doubt_messages
  add column if not exists extracted_ocr_text text,
  add column if not exists is_grounded_in_syllabus boolean not null default false,
  add column if not exists feedback_helpful boolean;

-- 3. Create `pmu_coding_sessions`
create table if not exists public.pmu_coding_sessions (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid references public.pmu_profiles (id) on delete cascade,
  problem_title   text not null default 'Scratchpad',
  user_code       text not null default '',
  language        text not null default 'python',
  ai_feedback     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================================
-- RLS POLICIES FOR PHASE 5
-- ============================================================================

alter table public.pmu_doubts enable row level security;
alter table public.pmu_doubt_messages enable row level security;
alter table public.pmu_coding_sessions enable row level security;

-- ----------------- pmu_doubts
drop policy if exists "pmu_doubts_select" on public.pmu_doubts;
create policy "pmu_doubts_select" on public.pmu_doubts
  for select using (
    auth.uid() = student_id or auth.uid() = user_id or public.pmu_is_admin()
  );

drop policy if exists "pmu_doubts_insert" on public.pmu_doubts;
create policy "pmu_doubts_insert" on public.pmu_doubts
  for insert with check (
    auth.uid() = student_id or auth.uid() = user_id or public.pmu_is_admin()
  );

drop policy if exists "pmu_doubts_update" on public.pmu_doubts;
create policy "pmu_doubts_update" on public.pmu_doubts
  for update using (
    auth.uid() = student_id or auth.uid() = user_id or public.pmu_is_admin()
  ) with check (
    auth.uid() = student_id or auth.uid() = user_id or public.pmu_is_admin()
  );

-- ----------------- pmu_doubt_messages
drop policy if exists "pmu_doubt_messages_select" on public.pmu_doubt_messages;
create policy "pmu_doubt_messages_select" on public.pmu_doubt_messages
  for select using (
    exists (
      select 1 from public.pmu_doubts d
      where d.id = doubt_id and (d.student_id = auth.uid() or d.user_id = auth.uid() or public.pmu_is_admin())
    )
  );

drop policy if exists "pmu_doubt_messages_insert" on public.pmu_doubt_messages;
create policy "pmu_doubt_messages_insert" on public.pmu_doubt_messages
  for insert with check (
    exists (
      select 1 from public.pmu_doubts d
      where d.id = doubt_id and (d.student_id = auth.uid() or d.user_id = auth.uid() or public.pmu_is_admin())
    )
  );

drop policy if exists "pmu_doubt_messages_update" on public.pmu_doubt_messages;
create policy "pmu_doubt_messages_update" on public.pmu_doubt_messages
  for update using (
    exists (
      select 1 from public.pmu_doubts d
      where d.id = doubt_id and (d.student_id = auth.uid() or d.user_id = auth.uid() or public.pmu_is_admin())
    )
  ) with check (
    exists (
      select 1 from public.pmu_doubts d
      where d.id = doubt_id and (d.student_id = auth.uid() or d.user_id = auth.uid() or public.pmu_is_admin())
    )
  );

-- ----------------- pmu_coding_sessions
create policy "pmu_coding_sessions_all" on public.pmu_coding_sessions
  for all using (
    auth.uid() = student_id or public.pmu_is_admin()
  ) with check (
    auth.uid() = student_id or public.pmu_is_admin()
  );

-- Indexes for Phase 5 queries
create index if not exists pmu_idx_doubts_student on public.pmu_doubts (student_id, status);
create index if not exists pmu_idx_doubt_msgs_doubt on public.pmu_doubt_messages (doubt_id, created_at asc);
create index if not exists pmu_idx_coding_sessions_student on public.pmu_coding_sessions (student_id, created_at desc);

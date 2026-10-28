-- ============================================================================
-- PrepMeUp AI — Phase 4 Database Migration: Quiz Engine & Analytics
-- Safe, additive migration:
--  1. Align `pmu_quizzes`, `pmu_quiz_questions`, `pmu_quiz_attempts`, `pmu_quiz_answers`
--  2. Schema alignment for student progress records & analytics
--  3. Strict Row-Level Security ensuring student score protection and draft isolation
-- ============================================================================

-- 1. Ensure `pmu_quizzes` columns
alter table public.pmu_quizzes
  add column if not exists passing_marks numeric(5,2) not null default 4.0;

-- 2. Align `pmu_quiz_attempts`
alter table public.pmu_quiz_attempts
  add column if not exists student_id uuid references public.pmu_profiles (id) on delete cascade,
  add column if not exists time_spent_seconds int not null default 0,
  add column if not exists percentage numeric(5,2) default 0.0;

-- Sync student_id from user_id if needed
update public.pmu_quiz_attempts
set student_id = user_id
where student_id is null and user_id is not null;

-- 3. Align `pmu_quiz_answers`
alter table public.pmu_quiz_answers
  add column if not exists selected_option text,
  add column if not exists text_answer text,
  add column if not exists code_submission text,
  add column if not exists time_spent_seconds int not null default 0;

-- 4. Align `pmu_progress_records`
alter table public.pmu_progress_records
  add column if not exists student_id uuid references public.pmu_profiles (id) on delete cascade;

update public.pmu_progress_records
set student_id = user_id
where student_id is null and user_id is not null;

-- ============================================================================
-- RLS POLICIES FOR PHASE 4
-- ============================================================================

-- ----------------- pmu_quizzes
drop policy if exists "pmu_quizzes_select" on public.pmu_quizzes;
create policy "pmu_quizzes_select" on public.pmu_quizzes
  for select using (is_published = true or public.pmu_is_admin());

-- ----------------- pmu_quiz_questions
drop policy if exists "pmu_quiz_questions_select" on public.pmu_quiz_questions;
create policy "pmu_quiz_questions_select" on public.pmu_quiz_questions
  for select using (
    exists (
      select 1 from public.pmu_quizzes q
      where q.id = quiz_id and (q.is_published = true or public.pmu_is_admin())
    )
  );

-- ----------------- pmu_quiz_attempts
drop policy if exists "pmu_quiz_attempts_select" on public.pmu_quiz_attempts;
create policy "pmu_quiz_attempts_select" on public.pmu_quiz_attempts
  for select using (
    auth.uid() = student_id or auth.uid() = user_id or public.pmu_is_admin()
  );

drop policy if exists "pmu_quiz_attempts_insert" on public.pmu_quiz_attempts;
create policy "pmu_quiz_attempts_insert" on public.pmu_quiz_attempts
  for insert with check (
    auth.uid() = student_id or auth.uid() = user_id or public.pmu_is_admin()
  );

drop policy if exists "pmu_quiz_attempts_update" on public.pmu_quiz_attempts;
create policy "pmu_quiz_attempts_update" on public.pmu_quiz_attempts
  for update using (
    auth.uid() = student_id or auth.uid() = user_id or public.pmu_is_admin()
  ) with check (
    auth.uid() = student_id or auth.uid() = user_id or public.pmu_is_admin()
  );

-- ----------------- pmu_quiz_answers
drop policy if exists "pmu_quiz_answers_select" on public.pmu_quiz_answers;
create policy "pmu_quiz_answers_select" on public.pmu_quiz_answers
  for select using (
    exists (
      select 1 from public.pmu_quiz_attempts a
      where a.id = attempt_id and (a.student_id = auth.uid() or a.user_id = auth.uid() or public.pmu_is_admin())
    )
  );

drop policy if exists "pmu_quiz_answers_insert" on public.pmu_quiz_answers;
create policy "pmu_quiz_answers_insert" on public.pmu_quiz_answers
  for insert with check (
    exists (
      select 1 from public.pmu_quiz_attempts a
      where a.id = attempt_id and (a.student_id = auth.uid() or a.user_id = auth.uid() or public.pmu_is_admin())
    )
  );

drop policy if exists "pmu_quiz_answers_update" on public.pmu_quiz_answers;
create policy "pmu_quiz_answers_update" on public.pmu_quiz_answers
  for update using (
    exists (
      select 1 from public.pmu_quiz_attempts a
      where a.id = attempt_id and (a.student_id = auth.uid() or a.user_id = auth.uid() or public.pmu_is_admin())
    )
  ) with check (
    exists (
      select 1 from public.pmu_quiz_attempts a
      where a.id = attempt_id and (a.student_id = auth.uid() or a.user_id = auth.uid() or public.pmu_is_admin())
    )
  );

-- ----------------- pmu_progress_records
drop policy if exists "pmu_progress_records_select" on public.pmu_progress_records;
create policy "pmu_progress_records_select" on public.pmu_progress_records
  for select using (
    auth.uid() = student_id or auth.uid() = user_id or public.pmu_is_admin()
  );

-- High-performance indexes for Phase 4
create index if not exists pmu_idx_quiz_attempts_student on public.pmu_quiz_attempts (student_id, quiz_id, status);
create index if not exists pmu_idx_quiz_answers_attempt on public.pmu_quiz_answers (attempt_id, question_id);
create index if not exists pmu_idx_progress_student on public.pmu_progress_records (student_id, subject_id);

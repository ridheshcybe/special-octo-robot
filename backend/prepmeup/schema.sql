-- ============================================================================
-- PrepMeUp AI — Database Schema
-- Multi-tenant B.Tech CSE AI/ML learning platform schema with strict RLS.
-- Prefixed with `pmu_` to guarantee zero collisions with portfolio or courses.
-- ============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. Profiles & Access Control
-- ============================================================================

-- ----------------------------------------------------------- pmu_profiles
create table if not exists public.pmu_profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  phone             text unique,
  full_name         text not null default '',
  college           text not null default '',
  branch            text not null default 'B.Tech CSE AI/ML',
  current_semester  int not null default 1,
  role              text not null default 'student' check (role in ('student', 'admin')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ------------------------------------------------------------- pmu_admins
create table if not exists public.pmu_admins (
  id                uuid primary key references auth.users (id) on delete cascade,
  email             text unique not null,
  full_name         text not null default '',
  created_at        timestamptz not null default now()
);

-- Helper function: check if calling user is an authorized PrepMeUp admin
create or replace function public.pmu_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.pmu_admins where id = auth.uid()
  );
$$;

-- ---------------------------------------------------------- pmu_semesters
create table if not exists public.pmu_semesters (
  id                uuid primary key default gen_random_uuid(),
  number            int unique not null,
  title             text not null,
  branch            text not null default 'B.Tech CSE AI/ML',
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

-- ------------------------------------------------------ pmu_subscriptions
create table if not exists public.pmu_subscriptions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.pmu_profiles (id) on delete cascade,
  semester_id       uuid not null references public.pmu_semesters (id) on delete cascade,
  status            text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  access_type       text not null default 'paid' check (access_type in ('paid', 'free_early_adopter', 'admin_granted')),
  starts_at         timestamptz not null default now(),
  expires_at        timestamptz not null default (now() + interval '180 days'),
  created_at        timestamptz not null default now()
);

-- Helper function: check if user has active subscription for a semester
create or replace function public.pmu_has_semester_access(p_semester_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.pmu_subscriptions
    where user_id = auth.uid()
      and semester_id = p_semester_id
      and status = 'active'
      and expires_at > now()
  ) or public.pmu_is_admin();
$$;

-- ----------------------------------------------------------- pmu_payments
create table if not exists public.pmu_payments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  semester_id         uuid not null references public.pmu_semesters (id) on delete cascade,
  razorpay_order_id   text unique not null,
  razorpay_payment_id text,
  amount_in_paise     int not null,
  currency            text not null default 'INR',
  status              text not null default 'created' check (status in ('created', 'pending', 'paid', 'failed', 'refunded')),
  platform            text not null default 'prepmeup',
  metadata            jsonb default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ------------------------------------------- pmu_free_access_redemptions
create table if not exists public.pmu_free_access_redemptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  semester_id         uuid not null references public.pmu_semesters (id) on delete cascade,
  redemption_number   int not null,
  status              text not null default 'claimed' check (status in ('claimed', 'revoked')),
  created_at          timestamptz not null default now(),
  constraint pmu_one_free_redemption_per_user_sem unique (user_id, semester_id)
);

-- ============================================================================
-- 2. Academic Curriculum Content
-- ============================================================================

-- ----------------------------------------------------------- pmu_subjects
create table if not exists public.pmu_subjects (
  id                uuid primary key default gen_random_uuid(),
  semester_id       uuid not null references public.pmu_semesters (id) on delete cascade,
  code              text unique not null,
  title             text not null,
  slug              text unique not null,
  description       text not null default '',
  credit_units      int not null default 4,
  icon              text not null default '📚',
  is_published      boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ------------------------------------------------------------ pmu_modules
create table if not exists public.pmu_modules (
  id                uuid primary key default gen_random_uuid(),
  subject_id        uuid not null references public.pmu_subjects (id) on delete cascade,
  module_number     int not null,
  title             text not null,
  description       text not null default '',
  is_published      boolean not null default false,
  created_at        timestamptz not null default now(),
  constraint pmu_module_subject_num_unique unique (subject_id, module_number)
);

-- ------------------------------------------------------------- pmu_topics
create table if not exists public.pmu_topics (
  id                        uuid primary key default gen_random_uuid(),
  module_id                 uuid not null references public.pmu_modules (id) on delete cascade,
  topic_number              int not null,
  title                     text not null,
  slug                      text not null,
  description               text not null default '',
  estimated_reading_minutes int not null default 15,
  is_sample                 boolean not null default false,
  is_published              boolean not null default false,
  created_at                timestamptz not null default now(),
  constraint pmu_topic_module_slug_unique unique (module_id, slug)
);

-- -------------------------------------------------------------- pmu_notes
create table if not exists public.pmu_notes (
  id                uuid primary key default gen_random_uuid(),
  topic_id          uuid not null references public.pmu_topics (id) on delete cascade,
  title             text not null,
  content           text not null default '',
  pdf_url           text,
  reading_time_min  int not null default 15,
  status            text not null default 'draft'
                    check (status in ('draft', 'under_review', 'approved', 'published', 'rejected', 'archived')),
  is_sample         boolean not null default false,
  created_by        uuid references auth.users (id),
  reviewed_by       uuid references auth.users (id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- -------------------------------------------------------- pmu_past_papers
create table if not exists public.pmu_past_papers (
  id                  uuid primary key default gen_random_uuid(),
  subject_id          uuid not null references public.pmu_subjects (id) on delete cascade,
  exam_year           int not null,
  exam_type           text not null, -- 'End-Semester', 'Mid-Semester Test 1', 'Mid-Semester Test 2'
  title               text not null,
  question_paper_url  text not null,
  solution_url        text,
  is_published        boolean not null default false,
  created_at          timestamptz not null default now()
);

-- ---------------------------------------------------------- pmu_questions
create table if not exists public.pmu_questions (
  id                uuid primary key default gen_random_uuid(),
  subject_id        uuid not null references public.pmu_subjects (id) on delete cascade,
  module_id         uuid references public.pmu_modules (id) on delete set null,
  topic_id          uuid references public.pmu_topics (id) on delete set null,
  past_paper_id     uuid references public.pmu_past_papers (id) on delete set null,
  question_type     text not null
                    check (question_type in ('yes_no', 'mcq_single', 'mcq_multiple', 'numerical', 'short_answer', 'long_answer', 'coding')),
  difficulty        text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  question_text     text not null,
  options           jsonb,
  correct_answer    jsonb,
  explanation       text not null default '',
  marks             numeric(5,2) not null default 1.0,
  source            text not null default 'syllabus'
                    check (source in ('past_paper', 'syllabus', 'ai_generated', 'admin_created')),
  status            text not null default 'draft'
                    check (status in ('draft', 'under_review', 'approved', 'published', 'rejected', 'archived')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ------------------------------------------------------------ pmu_quizzes
create table if not exists public.pmu_quizzes (
  id                uuid primary key default gen_random_uuid(),
  subject_id        uuid not null references public.pmu_subjects (id) on delete cascade,
  module_id         uuid references public.pmu_modules (id) on delete set null,
  topic_id          uuid references public.pmu_topics (id) on delete set null,
  title             text not null,
  description       text not null default '',
  quiz_type         text not null default 'topic'
                    check (quiz_type in ('topic', 'module', 'subject', 'mock_test', 'past_paper')),
  duration_minutes  int,
  total_marks       numeric(5,2) not null default 10.0,
  is_published      boolean not null default false,
  created_at        timestamptz not null default now()
);

-- ----------------------------------------------------- pmu_quiz_questions
create table if not exists public.pmu_quiz_questions (
  id                uuid primary key default gen_random_uuid(),
  quiz_id           uuid not null references public.pmu_quizzes (id) on delete cascade,
  question_id       uuid not null references public.pmu_questions (id) on delete cascade,
  question_order    int not null default 1,
  marks             numeric(5,2) not null default 1.0,
  constraint pmu_quiz_question_unique unique (quiz_id, question_id)
);

-- ------------------------------------------------------ pmu_quiz_attempts
create table if not exists public.pmu_quiz_attempts (
  id                uuid primary key default gen_random_uuid(),
  quiz_id           uuid not null references public.pmu_quizzes (id) on delete cascade,
  user_id           uuid not null references public.pmu_profiles (id) on delete cascade,
  started_at        timestamptz not null default now(),
  submitted_at      timestamptz,
  score             numeric(5,2),
  total_marks       numeric(5,2) not null default 0.0,
  status            text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'expired')),
  created_at        timestamptz not null default now()
);

-- ------------------------------------------------------- pmu_quiz_answers
create table if not exists public.pmu_quiz_answers (
  id                uuid primary key default gen_random_uuid(),
  attempt_id        uuid not null references public.pmu_quiz_attempts (id) on delete cascade,
  question_id       uuid not null references public.pmu_questions (id) on delete cascade,
  answer            jsonb not null default '{}'::jsonb,
  is_correct        boolean,
  marks_awarded     numeric(5,2) default 0.0,
  created_at        timestamptz not null default now()
);

-- ------------------------------------------------------------- pmu_doubts
create table if not exists public.pmu_doubts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.pmu_profiles (id) on delete cascade,
  subject_id        uuid references public.pmu_subjects (id) on delete set null,
  topic_id          uuid references public.pmu_topics (id) on delete set null,
  title             text not null,
  status            text not null default 'open' check (status in ('open', 'answered', 'escalated', 'closed')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ------------------------------------------------------ pmu_doubt_messages
create table if not exists public.pmu_doubt_messages (
  id                uuid primary key default gen_random_uuid(),
  doubt_id          uuid not null references public.pmu_doubts (id) on delete cascade,
  sender_type       text not null check (sender_type in ('student', 'ai', 'admin')),
  message_text      text not null,
  image_url         text,
  extracted_text    text,
  created_at        timestamptz not null default now()
);

-- --------------------------------------------------- pmu_ai_content_drafts
create table if not exists public.pmu_ai_content_drafts (
  id                uuid primary key default gen_random_uuid(),
  subject_id        uuid not null references public.pmu_subjects (id) on delete cascade,
  topic_id          uuid references public.pmu_topics (id) on delete set null,
  draft_type        text not null check (draft_type in ('notes', 'questions', 'quiz', 'explanation')),
  generated_content jsonb not null default '{}'::jsonb,
  status            text not null default 'pending_review'
                    check (status in ('pending_review', 'approved', 'rejected', 'regenerated')),
  created_at        timestamptz not null default now(),
  reviewed_by       uuid references public.pmu_admins (id),
  reviewed_at       timestamptz
);

-- ---------------------------------------------------- pmu_content_reviews
create table if not exists public.pmu_content_reviews (
  id                uuid primary key default gen_random_uuid(),
  draft_id          uuid not null references public.pmu_ai_content_drafts (id) on delete cascade,
  reviewer_id       uuid not null references public.pmu_admins (id),
  action            text not null check (action in ('approved', 'rejected', 'edited', 'regeneration_requested')),
  comments          text not null default '',
  created_at        timestamptz not null default now()
);

-- --------------------------------------------------- pmu_progress_records
create table if not exists public.pmu_progress_records (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.pmu_profiles (id) on delete cascade,
  subject_id           uuid not null references public.pmu_subjects (id) on delete cascade,
  topic_id              uuid references public.pmu_topics (id) on delete set null,
  quiz_id               uuid references public.pmu_quizzes (id) on delete set null,
  completion_percentage numeric(5,2) not null default 0.0 check (completion_percentage between 0 and 100),
  accuracy              numeric(5,2) check (accuracy between 0 and 100),
  last_activity_at      timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint pmu_progress_user_subject_topic unique (user_id, subject_id, topic_id)
);

-- ============================================================================
-- 3. High-Performance Indexes
-- ============================================================================

create index if not exists pmu_idx_subjects_sem on public.pmu_subjects (semester_id, is_published);
create index if not exists pmu_idx_modules_subj on public.pmu_modules (subject_id, module_number);
create index if not exists pmu_idx_topics_mod on public.pmu_topics (module_id, topic_number);
create index if not exists pmu_idx_notes_topic_status on public.pmu_notes (topic_id, status);
create index if not exists pmu_idx_questions_lookup on public.pmu_questions (subject_id, topic_id, status);
create index if not exists pmu_idx_quizzes_subj on public.pmu_quizzes (subject_id, is_published);
create index if not exists pmu_idx_attempts_user on public.pmu_quiz_attempts (user_id, quiz_id, created_at desc);
create index if not exists pmu_idx_doubts_user on public.pmu_doubts (user_id, status);
create index if not exists pmu_idx_payments_user_order on public.pmu_payments (user_id, razorpay_order_id);
create index if not exists pmu_idx_free_redemptions_user_sem on public.pmu_free_access_redemptions (user_id, semester_id);
create index if not exists pmu_idx_progress_user on public.pmu_progress_records (user_id, subject_id);

-- ============================================================================
-- 4. Row Level Security (RLS) Policies
-- Separate SELECT, INSERT, UPDATE, DELETE policies on EVERY pmu_ table.
-- ============================================================================

alter table public.pmu_profiles enable row level security;
alter table public.pmu_admins enable row level security;
alter table public.pmu_semesters enable row level security;
alter table public.pmu_subscriptions enable row level security;
alter table public.pmu_payments enable row level security;
alter table public.pmu_free_access_redemptions enable row level security;
alter table public.pmu_subjects enable row level security;
alter table public.pmu_modules enable row level security;
alter table public.pmu_topics enable row level security;
alter table public.pmu_notes enable row level security;
alter table public.pmu_past_papers enable row level security;
alter table public.pmu_questions enable row level security;
alter table public.pmu_quizzes enable row level security;
alter table public.pmu_quiz_questions enable row level security;
alter table public.pmu_quiz_attempts enable row level security;
alter table public.pmu_quiz_answers enable row level security;
alter table public.pmu_doubts enable row level security;
alter table public.pmu_doubt_messages enable row level security;
alter table public.pmu_ai_content_drafts enable row level security;
alter table public.pmu_content_reviews enable row level security;
alter table public.pmu_progress_records enable row level security;

-- ----------------- pmu_profiles
create policy "pmu_profiles_select" on public.pmu_profiles
  for select using (id = auth.uid() or public.pmu_is_admin());
create policy "pmu_profiles_insert" on public.pmu_profiles
  for insert with check (id = auth.uid() or public.pmu_is_admin());
create policy "pmu_profiles_update" on public.pmu_profiles
  for update using (id = auth.uid() or public.pmu_is_admin())
  with check (id = auth.uid() or public.pmu_is_admin());
create policy "pmu_profiles_delete" on public.pmu_profiles
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_admins
create policy "pmu_admins_select" on public.pmu_admins
  for select using (public.pmu_is_admin());
create policy "pmu_admins_insert" on public.pmu_admins
  for insert with check (public.pmu_is_admin());
create policy "pmu_admins_update" on public.pmu_admins
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_admins_delete" on public.pmu_admins
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_semesters
create policy "pmu_semesters_select" on public.pmu_semesters
  for select using (is_active = true or public.pmu_is_admin());
create policy "pmu_semesters_insert" on public.pmu_semesters
  for insert with check (public.pmu_is_admin());
create policy "pmu_semesters_update" on public.pmu_semesters
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_semesters_delete" on public.pmu_semesters
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_subscriptions
create policy "pmu_subscriptions_select" on public.pmu_subscriptions
  for select using (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_subscriptions_insert" on public.pmu_subscriptions
  for insert with check (public.pmu_is_admin());
create policy "pmu_subscriptions_update" on public.pmu_subscriptions
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_subscriptions_delete" on public.pmu_subscriptions
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_payments
create policy "pmu_payments_select" on public.pmu_payments
  for select using (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_payments_insert" on public.pmu_payments
  for insert with check (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_payments_update" on public.pmu_payments
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_payments_delete" on public.pmu_payments
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_free_access_redemptions
create policy "pmu_free_redemptions_select" on public.pmu_free_access_redemptions
  for select using (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_free_redemptions_insert" on public.pmu_free_access_redemptions
  for insert with check (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_free_redemptions_update" on public.pmu_free_access_redemptions
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_free_redemptions_delete" on public.pmu_free_access_redemptions
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_subjects
create policy "pmu_subjects_select" on public.pmu_subjects
  for select using (is_published = true or public.pmu_is_admin());
create policy "pmu_subjects_insert" on public.pmu_subjects
  for insert with check (public.pmu_is_admin());
create policy "pmu_subjects_update" on public.pmu_subjects
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_subjects_delete" on public.pmu_subjects
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_modules
create policy "pmu_modules_select" on public.pmu_modules
  for select using (is_published = true or public.pmu_is_admin());
create policy "pmu_modules_insert" on public.pmu_modules
  for insert with check (public.pmu_is_admin());
create policy "pmu_modules_update" on public.pmu_modules
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_modules_delete" on public.pmu_modules
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_topics
create policy "pmu_topics_select" on public.pmu_topics
  for select using (is_published = true or public.pmu_is_admin());
create policy "pmu_topics_insert" on public.pmu_topics
  for insert with check (public.pmu_is_admin());
create policy "pmu_topics_update" on public.pmu_topics
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_topics_delete" on public.pmu_topics
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_notes
-- Non-admin students can select ONLY published notes (or sample notes, or if they have active semester access)
create policy "pmu_notes_select" on public.pmu_notes
  for select using (
    (status = 'published' and (is_sample = true or auth.uid() is not null))
    or public.pmu_is_admin()
  );
create policy "pmu_notes_insert" on public.pmu_notes
  for insert with check (public.pmu_is_admin());
create policy "pmu_notes_update" on public.pmu_notes
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_notes_delete" on public.pmu_notes
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_past_papers
create policy "pmu_past_papers_select" on public.pmu_past_papers
  for select using (is_published = true or public.pmu_is_admin());
create policy "pmu_past_papers_insert" on public.pmu_past_papers
  for insert with check (public.pmu_is_admin());
create policy "pmu_past_papers_update" on public.pmu_past_papers
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_past_papers_delete" on public.pmu_past_papers
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_questions
create policy "pmu_questions_select" on public.pmu_questions
  for select using (status = 'published' or public.pmu_is_admin());
create policy "pmu_questions_insert" on public.pmu_questions
  for insert with check (public.pmu_is_admin());
create policy "pmu_questions_update" on public.pmu_questions
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_questions_delete" on public.pmu_questions
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_quizzes
create policy "pmu_quizzes_select" on public.pmu_quizzes
  for select using (is_published = true or public.pmu_is_admin());
create policy "pmu_quizzes_insert" on public.pmu_quizzes
  for insert with check (public.pmu_is_admin());
create policy "pmu_quizzes_update" on public.pmu_quizzes
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_quizzes_delete" on public.pmu_quizzes
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_quiz_questions
create policy "pmu_quiz_questions_select" on public.pmu_quiz_questions
  for select using (
    exists (select 1 from public.pmu_quizzes q where q.id = quiz_id and (q.is_published = true or public.pmu_is_admin()))
  );
create policy "pmu_quiz_questions_insert" on public.pmu_quiz_questions
  for insert with check (public.pmu_is_admin());
create policy "pmu_quiz_questions_update" on public.pmu_quiz_questions
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_quiz_questions_delete" on public.pmu_quiz_questions
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_quiz_attempts
create policy "pmu_quiz_attempts_select" on public.pmu_quiz_attempts
  for select using (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_quiz_attempts_insert" on public.pmu_quiz_attempts
  for insert with check (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_quiz_attempts_update" on public.pmu_quiz_attempts
  for update using (user_id = auth.uid() or public.pmu_is_admin())
  with check (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_quiz_attempts_delete" on public.pmu_quiz_attempts
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_quiz_answers
create policy "pmu_quiz_answers_select" on public.pmu_quiz_answers
  for select using (
    exists (select 1 from public.pmu_quiz_attempts a where a.id = attempt_id and (a.user_id = auth.uid() or public.pmu_is_admin()))
  );
create policy "pmu_quiz_answers_insert" on public.pmu_quiz_answers
  for insert with check (
    exists (select 1 from public.pmu_quiz_attempts a where a.id = attempt_id and (a.user_id = auth.uid() or public.pmu_is_admin()))
  );
create policy "pmu_quiz_answers_update" on public.pmu_quiz_answers
  for update using (
    exists (select 1 from public.pmu_quiz_attempts a where a.id = attempt_id and (a.user_id = auth.uid() or public.pmu_is_admin()))
  ) with check (
    exists (select 1 from public.pmu_quiz_attempts a where a.id = attempt_id and (a.user_id = auth.uid() or public.pmu_is_admin()))
  );
create policy "pmu_quiz_answers_delete" on public.pmu_quiz_answers
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_doubts
create policy "pmu_doubts_select" on public.pmu_doubts
  for select using (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_doubts_insert" on public.pmu_doubts
  for insert with check (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_doubts_update" on public.pmu_doubts
  for update using (user_id = auth.uid() or public.pmu_is_admin())
  with check (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_doubts_delete" on public.pmu_doubts
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_doubt_messages
create policy "pmu_doubt_messages_select" on public.pmu_doubt_messages
  for select using (
    exists (select 1 from public.pmu_doubts d where d.id = doubt_id and (d.user_id = auth.uid() or public.pmu_is_admin()))
  );
create policy "pmu_doubt_messages_insert" on public.pmu_doubt_messages
  for insert with check (
    exists (select 1 from public.pmu_doubts d where d.id = doubt_id and (d.user_id = auth.uid() or public.pmu_is_admin()))
  );
create policy "pmu_doubt_messages_update" on public.pmu_doubt_messages
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_doubt_messages_delete" on public.pmu_doubt_messages
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_ai_content_drafts
create policy "pmu_ai_drafts_select" on public.pmu_ai_content_drafts
  for select using (public.pmu_is_admin());
create policy "pmu_ai_drafts_insert" on public.pmu_ai_content_drafts
  for insert with check (public.pmu_is_admin());
create policy "pmu_ai_drafts_update" on public.pmu_ai_content_drafts
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_ai_drafts_delete" on public.pmu_ai_content_drafts
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_content_reviews
create policy "pmu_content_reviews_select" on public.pmu_content_reviews
  for select using (public.pmu_is_admin());
create policy "pmu_content_reviews_insert" on public.pmu_content_reviews
  for insert with check (public.pmu_is_admin());
create policy "pmu_content_reviews_update" on public.pmu_content_reviews
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_content_reviews_delete" on public.pmu_content_reviews
  for delete using (public.pmu_is_admin());

-- ----------------- pmu_progress_records
create policy "pmu_progress_records_select" on public.pmu_progress_records
  for select using (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_progress_records_insert" on public.pmu_progress_records
  for insert with check (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_progress_records_update" on public.pmu_progress_records
  for update using (user_id = auth.uid() or public.pmu_is_admin())
  with check (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_progress_records_delete" on public.pmu_progress_records
  for delete using (public.pmu_is_admin());

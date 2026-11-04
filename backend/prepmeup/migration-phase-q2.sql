-- ============================================================================
-- PrepMeUp AI — Phase Q2: Mentorship, Quantum Doubt Copilot, Progress & Verification
-- Tables, constraints, unique indexes, and separate RLS policies.
-- Prefixed with `pmu_`.
-- ============================================================================

-- Ensure uuid-ossp extension
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. Instructor Availability Table
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_instructor_availability (
  id            uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.pmu_instructors (id) on delete cascade,
  course_id     uuid references public.pmu_courses (id) on delete set null,
  day_of_week   int not null check (day_of_week between 0 and 6),
  start_time    time not null,
  end_time      time not null,
  timezone      text not null default 'Asia/Kolkata',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. Mentorship Slots Table (With Strict Double-Booking Guard)
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_mentorship_slots (
  id               uuid primary key default gen_random_uuid(),
  instructor_id    uuid not null references public.pmu_instructors (id) on delete cascade,
  course_id        uuid references public.pmu_courses (id) on delete cascade,
  start_at         timestamptz not null,
  end_at           timestamptz not null,
  duration_minutes int not null default 45,
  status           text not null default 'available'
                   check (status in ('available', 'requested', 'booked', 'blocked', 'completed', 'cancelled')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Unique constraint ensuring an instructor cannot be double-booked for active slots
create unique index if not exists idx_pmu_no_double_booking
  on public.pmu_mentorship_slots (instructor_id, start_at)
  where status in ('available', 'requested', 'booked');

-- ----------------------------------------------------------------------------
-- 3. Quantum Doubts & Thread Messages Table
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_quantum_doubts (
  id                     uuid primary key default gen_random_uuid(),
  student_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  course_slug            text not null default 'quantum-computing-foundations',
  module_number          int,
  question_text          text not null,
  image_url              text,
  extracted_text         text,
  ai_response            text not null,
  is_grounded            boolean not null default true,
  uses_general_knowledge boolean not null default false,
  status                 text not null default 'answered' check (status in ('open', 'answered', 'closed')),
  helpful_count          int not null default 0,
  unhelpful_count        int not null default 0,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table if not exists public.pmu_quantum_doubt_messages (
  id          uuid primary key default gen_random_uuid(),
  doubt_id    uuid not null references public.pmu_quantum_doubts (id) on delete cascade,
  sender_type text not null check (sender_type in ('student', 'ai')),
  message_text text not null,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. Quantum Course Progress & Completion Tracking Table
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_quantum_progress (
  id                    uuid primary key default gen_random_uuid(),
  student_id            uuid not null references public.pmu_profiles (id) on delete cascade,
  course_slug           text not null default 'quantum-computing-foundations',
  completed_lessons     text[] not null default '{}',
  completed_simulations text[] not null default '{}',
  passed_quizzes        text[] not null default '{}',
  completion_percentage numeric(5,2) not null default 0.0 check (completion_percentage between 0 and 100),
  certificate_status    text not null default 'not_eligible'
                        check (certificate_status in ('not_eligible', 'eligible', 'issued', 'revoked')),
  certificate_code      text unique,
  last_activity_at      timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  unique (student_id, course_slug)
);

-- ----------------------------------------------------------------------------
-- 5. Performance Indexes
-- ----------------------------------------------------------------------------
create index if not exists idx_pmu_inst_avail_inst on public.pmu_instructor_availability (instructor_id);
create index if not exists idx_pmu_mentor_slots_start on public.pmu_mentorship_slots (start_at);
create index if not exists idx_pmu_quantum_doubts_student on public.pmu_quantum_doubts (student_id);
create index if not exists idx_pmu_quantum_doubts_course on public.pmu_quantum_doubts (course_slug);
create index if not exists idx_pmu_quantum_prog_student on public.pmu_quantum_progress (student_id, course_slug);

-- ----------------------------------------------------------------------------
-- 6. Row Level Security Activation
-- ----------------------------------------------------------------------------
alter table public.pmu_instructor_availability enable row level security;
alter table public.pmu_mentorship_slots enable row level security;
alter table public.pmu_quantum_doubts enable row level security;
alter table public.pmu_quantum_doubt_messages enable row level security;
alter table public.pmu_quantum_progress enable row level security;

-- ----------------------------------------------------------------------------
-- 7. Separate RLS Policies: SELECT, INSERT, UPDATE, DELETE
-- ----------------------------------------------------------------------------

-- A. pmu_instructor_availability
create policy "pmu_inst_avail_select" on public.pmu_instructor_availability
  for select using (is_active = true or instructor_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_inst_avail_insert" on public.pmu_instructor_availability
  for insert with check (instructor_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_inst_avail_update" on public.pmu_instructor_availability
  for update using (instructor_id = auth.uid() or public.pmu_is_admin())
  with check (instructor_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_inst_avail_delete" on public.pmu_instructor_availability
  for delete using (instructor_id = auth.uid() or public.pmu_is_admin());

-- B. pmu_mentorship_slots
create policy "pmu_mentor_slots_select" on public.pmu_mentorship_slots
  for select using (true); -- Publicly viewable for available bookings
create policy "pmu_mentor_slots_insert" on public.pmu_mentorship_slots
  for insert with check (instructor_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_mentor_slots_update" on public.pmu_mentorship_slots
  for update using (instructor_id = auth.uid() or public.pmu_is_admin() or auth.uid() is not null)
  with check (instructor_id = auth.uid() or public.pmu_is_admin() or auth.uid() is not null);
create policy "pmu_mentor_slots_delete" on public.pmu_mentorship_slots
  for delete using (instructor_id = auth.uid() or public.pmu_is_admin());

-- C. pmu_quantum_doubts
create policy "pmu_quantum_doubts_select" on public.pmu_quantum_doubts
  for select using (student_id = auth.uid() or public.pmu_is_admin() or public.pmu_is_instructor());
create policy "pmu_quantum_doubts_insert" on public.pmu_quantum_doubts
  for insert with check (student_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_quantum_doubts_update" on public.pmu_quantum_doubts
  for update using (student_id = auth.uid() or public.pmu_is_admin())
  with check (student_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_quantum_doubts_delete" on public.pmu_quantum_doubts
  for delete using (public.pmu_is_admin());

-- D. pmu_quantum_doubt_messages
create policy "pmu_quantum_doubt_msgs_select" on public.pmu_quantum_doubt_messages
  for select using (
    exists (
      select 1 from public.pmu_quantum_doubts d
      where d.id = doubt_id and (d.student_id = auth.uid() or public.pmu_is_admin() or public.pmu_is_instructor())
    )
  );
create policy "pmu_quantum_doubt_msgs_insert" on public.pmu_quantum_doubt_messages
  for insert with check (
    exists (
      select 1 from public.pmu_quantum_doubts d
      where d.id = doubt_id and (d.student_id = auth.uid() or public.pmu_is_admin())
    )
  );
create policy "pmu_quantum_doubt_msgs_update" on public.pmu_quantum_doubt_messages
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_quantum_doubt_msgs_delete" on public.pmu_quantum_doubt_messages
  for delete using (public.pmu_is_admin());

-- E. pmu_quantum_progress
create policy "pmu_quantum_progress_select" on public.pmu_quantum_progress
  for select using (student_id = auth.uid() or public.pmu_is_admin() or public.pmu_is_instructor());
create policy "pmu_quantum_progress_insert" on public.pmu_quantum_progress
  for insert with check (student_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_quantum_progress_update" on public.pmu_quantum_progress
  for update using (student_id = auth.uid() or public.pmu_is_admin())
  with check (student_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_quantum_progress_delete" on public.pmu_quantum_progress
  for delete using (public.pmu_is_admin());

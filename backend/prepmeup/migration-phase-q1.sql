-- ============================================================================
-- PrepMeUp AI — Phase Q1: Multi-Track Architecture and Quantum Track Foundation
-- Tables, constraints, indexes, and separate RLS policies for multi-track scaling.
-- All tables prefixed with `pmu_`.
-- ============================================================================

-- Ensure uuid-ossp extension
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. Extend Role Check on pmu_profiles to support 'instructor'
-- ----------------------------------------------------------------------------
do $$
begin
  alter table public.pmu_profiles drop constraint if exists pmu_profiles_role_check;
  alter table public.pmu_profiles add constraint pmu_profiles_role_check
    check (role in ('student', 'instructor', 'admin'));
exception
  when others then null;
end $$;

-- ----------------------------------------------------------------------------
-- 2. Tracks Table
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_tracks (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text not null default '',
  icon          text not null default 'layers',
  status        text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  display_order int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. Instructors Table
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_instructors (
  id             uuid primary key references auth.users (id) on delete cascade,
  full_name      text not null,
  title          text not null default '',
  bio            text not null default '',
  qualifications text not null default '',
  expertise      text[] not null default '{}',
  avatar_url     text,
  linkedin_url   text,
  github_url     text,
  website_url    text,
  status         text not null default 'active' check (status in ('active', 'inactive')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. Courses Table
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_courses (
  id                     uuid primary key default gen_random_uuid(),
  track_id               uuid not null references public.pmu_tracks (id) on delete cascade,
  instructor_id          uuid references public.pmu_instructors (id) on delete set null,
  slug                   text unique not null,
  title                  text not null,
  subtitle               text not null default '',
  description            text not null default '',
  level                  text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  language               text not null default 'English',
  format                 text not null default 'hybrid' check (format in ('recorded', 'live', 'hybrid')),
  prerequisite           text not null default '',
  thumbnail_url          text,
  status                 text not null default 'draft' check (status in ('draft', 'under_review', 'published', 'archived')),
  is_free_preview_enabled boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. Course Modules Table
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_course_modules (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.pmu_courses (id) on delete cascade,
  module_number int not null,
  title         text not null,
  description   text not null default '',
  status        text not null default 'draft' check (status in ('draft', 'under_review', 'published', 'archived')),
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6. Course Lessons Table
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_course_lessons (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid not null references public.pmu_courses (id) on delete cascade,
  module_id       uuid not null references public.pmu_course_modules (id) on delete cascade,
  lesson_number   int not null,
  title           text not null,
  description     text not null default '',
  lesson_type     text not null default 'video' check (lesson_type in ('video', 'pdf', 'quiz', 'simulation', 'assignment', 'live_session', 'coding_lab')),
  video_url       text,
  pdf_path        text,
  simulation_id   uuid,
  quiz_id         uuid,
  is_free_preview boolean not null default false,
  status          text not null default 'draft' check (status in ('draft', 'under_review', 'approved', 'published', 'archived')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 7. Live Mentorship Sessions Table
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_mentorship_sessions (
  id               uuid primary key default gen_random_uuid(),
  course_id        uuid not null references public.pmu_courses (id) on delete cascade,
  instructor_id    uuid not null references public.pmu_instructors (id) on delete cascade,
  student_id       uuid not null references public.pmu_profiles (id) on delete cascade,
  session_type     text not null default 'mentorship' check (session_type in ('mentorship', 'interview_prep', 'doubt_clearing')),
  scheduled_at     timestamptz not null,
  duration_minutes int not null default 45,
  meeting_url      text,
  status           text not null default 'requested' check (status in ('requested', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
  student_notes    text not null default '',
  instructor_notes text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 8. Course Certificates Table
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_certificates (
  id               uuid primary key default gen_random_uuid(),
  course_id        uuid not null references public.pmu_courses (id) on delete cascade,
  student_id       uuid not null references public.pmu_profiles (id) on delete cascade,
  certificate_code text unique not null,
  issued_at        timestamptz,
  status           text not null default 'not_eligible' check (status in ('not_eligible', 'eligible', 'issued', 'revoked')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 9. Instructor Course Access Permissions Table
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_instructor_course_access (
  id               uuid primary key default gen_random_uuid(),
  instructor_id    uuid not null references public.pmu_instructors (id) on delete cascade,
  course_id        uuid not null references public.pmu_courses (id) on delete cascade,
  permission_level text not null default 'owner' check (permission_level in ('owner', 'editor', 'viewer')),
  created_at       timestamptz not null default now(),
  unique (instructor_id, course_id)
);

-- ----------------------------------------------------------------------------
-- 10. Performance Indexes
-- ----------------------------------------------------------------------------
create index if not exists idx_pmu_courses_track on public.pmu_courses (track_id);
create index if not exists idx_pmu_courses_instructor on public.pmu_courses (instructor_id);
create index if not exists idx_pmu_course_modules_course on public.pmu_course_modules (course_id, module_number);
create index if not exists idx_pmu_course_lessons_course_mod on public.pmu_course_lessons (course_id, module_id, lesson_number);
create index if not exists idx_pmu_mentorship_student on public.pmu_mentorship_sessions (student_id);
create index if not exists idx_pmu_mentorship_instructor on public.pmu_mentorship_sessions (instructor_id);
create index if not exists idx_pmu_mentorship_course on public.pmu_mentorship_sessions (course_id);
create index if not exists idx_pmu_certificates_student_course on public.pmu_certificates (student_id, course_id);
create index if not exists idx_pmu_instructor_course_access on public.pmu_instructor_course_access (instructor_id, course_id);

-- ----------------------------------------------------------------------------
-- 11. Security Helper Functions
-- ----------------------------------------------------------------------------
create or replace function public.pmu_is_instructor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.pmu_instructors where id = auth.uid() and status = 'active'
  );
$$;

create or replace function public.pmu_has_instructor_course_access(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.pmu_courses c
    where c.id = p_course_id and c.instructor_id = auth.uid()
  )
  or exists (
    select 1 from public.pmu_instructor_course_access ica
    where ica.course_id = p_course_id and ica.instructor_id = auth.uid()
      and ica.permission_level in ('owner', 'editor')
  );
$$;

create or replace function public.pmu_student_has_course_access(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.pmu_subscriptions s
    where s.user_id = auth.uid() and s.status = 'active'
  )
  or exists (
    select 1 from public.pmu_courses c
    where c.id = p_course_id and c.is_free_preview_enabled = true
  );
$$;

-- ----------------------------------------------------------------------------
-- 12. Row Level Security Activation
-- ----------------------------------------------------------------------------
alter table public.pmu_tracks enable row level security;
alter table public.pmu_instructors enable row level security;
alter table public.pmu_courses enable row level security;
alter table public.pmu_course_modules enable row level security;
alter table public.pmu_course_lessons enable row level security;
alter table public.pmu_mentorship_sessions enable row level security;
alter table public.pmu_certificates enable row level security;
alter table public.pmu_instructor_course_access enable row level security;

-- ----------------------------------------------------------------------------
-- 13. Separate RLS Policies: SELECT, INSERT, UPDATE, DELETE
-- ----------------------------------------------------------------------------

-- A. pmu_tracks
create policy "pmu_tracks_select" on public.pmu_tracks
  for select using (status = 'published' or public.pmu_is_admin());
create policy "pmu_tracks_insert" on public.pmu_tracks
  for insert with check (public.pmu_is_admin());
create policy "pmu_tracks_update" on public.pmu_tracks
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_tracks_delete" on public.pmu_tracks
  for delete using (public.pmu_is_admin());

-- B. pmu_instructors
create policy "pmu_instructors_select" on public.pmu_instructors
  for select using (status = 'active' or id = auth.uid() or public.pmu_is_admin());
create policy "pmu_instructors_insert" on public.pmu_instructors
  for insert with check (public.pmu_is_admin());
create policy "pmu_instructors_update" on public.pmu_instructors
  for update using (id = auth.uid() or public.pmu_is_admin())
  with check (id = auth.uid() or public.pmu_is_admin());
create policy "pmu_instructors_delete" on public.pmu_instructors
  for delete using (public.pmu_is_admin());

-- C. pmu_courses
create policy "pmu_courses_select" on public.pmu_courses
  for select using (
    status = 'published'
    or instructor_id = auth.uid()
    or public.pmu_has_instructor_course_access(id)
    or public.pmu_is_admin()
  );
create policy "pmu_courses_insert" on public.pmu_courses
  for insert with check (
    public.pmu_is_admin()
    or (public.pmu_is_instructor() and instructor_id = auth.uid())
  );
create policy "pmu_courses_update" on public.pmu_courses
  for update using (
    public.pmu_is_admin()
    or (public.pmu_is_instructor() and public.pmu_has_instructor_course_access(id))
  )
  with check (
    public.pmu_is_admin()
    or (public.pmu_is_instructor() and public.pmu_has_instructor_course_access(id))
  );
create policy "pmu_courses_delete" on public.pmu_courses
  for delete using (public.pmu_is_admin());

-- D. pmu_course_modules
create policy "pmu_course_modules_select" on public.pmu_course_modules
  for select using (
    status = 'published'
    or public.pmu_has_instructor_course_access(course_id)
    or public.pmu_is_admin()
  );
create policy "pmu_course_modules_insert" on public.pmu_course_modules
  for insert with check (
    public.pmu_is_admin()
    or (public.pmu_is_instructor() and public.pmu_has_instructor_course_access(course_id))
  );
create policy "pmu_course_modules_update" on public.pmu_course_modules
  for update using (
    public.pmu_is_admin()
    or (public.pmu_is_instructor() and public.pmu_has_instructor_course_access(course_id))
  )
  with check (
    public.pmu_is_admin()
    or (public.pmu_is_instructor() and public.pmu_has_instructor_course_access(course_id))
  );
create policy "pmu_course_modules_delete" on public.pmu_course_modules
  for delete using (
    public.pmu_is_admin()
    or (public.pmu_is_instructor() and public.pmu_has_instructor_course_access(course_id))
  );

-- E. pmu_course_lessons
create policy "pmu_course_lessons_select" on public.pmu_course_lessons
  for select using (
    public.pmu_is_admin()
    or public.pmu_has_instructor_course_access(course_id)
    or (
      status = 'published'
      and (is_free_preview = true or public.pmu_student_has_course_access(course_id))
    )
  );
create policy "pmu_course_lessons_insert" on public.pmu_course_lessons
  for insert with check (
    public.pmu_is_admin()
    or (public.pmu_is_instructor() and public.pmu_has_instructor_course_access(course_id))
  );
create policy "pmu_course_lessons_update" on public.pmu_course_lessons
  for update using (
    public.pmu_is_admin()
    or (public.pmu_is_instructor() and public.pmu_has_instructor_course_access(course_id))
  )
  with check (
    public.pmu_is_admin()
    or (public.pmu_is_instructor() and public.pmu_has_instructor_course_access(course_id))
  );
create policy "pmu_course_lessons_delete" on public.pmu_course_lessons
  for delete using (
    public.pmu_is_admin()
    or (public.pmu_is_instructor() and public.pmu_has_instructor_course_access(course_id))
  );

-- F. pmu_mentorship_sessions
create policy "pmu_mentorship_sessions_select" on public.pmu_mentorship_sessions
  for select using (
    student_id = auth.uid()
    or instructor_id = auth.uid()
    or public.pmu_is_admin()
  );
create policy "pmu_mentorship_sessions_insert" on public.pmu_mentorship_sessions
  for insert with check (
    student_id = auth.uid()
    or instructor_id = auth.uid()
    or public.pmu_is_admin()
  );
create policy "pmu_mentorship_sessions_update" on public.pmu_mentorship_sessions
  for update using (
    student_id = auth.uid()
    or instructor_id = auth.uid()
    or public.pmu_is_admin()
  )
  with check (
    student_id = auth.uid()
    or instructor_id = auth.uid()
    or public.pmu_is_admin()
  );
create policy "pmu_mentorship_sessions_delete" on public.pmu_mentorship_sessions
  for delete using (
    instructor_id = auth.uid()
    or public.pmu_is_admin()
  );

-- G. pmu_certificates
create policy "pmu_certificates_select" on public.pmu_certificates
  for select using (
    student_id = auth.uid()
    or public.pmu_has_instructor_course_access(course_id)
    or public.pmu_is_admin()
  );
create policy "pmu_certificates_insert" on public.pmu_certificates
  for insert with check (public.pmu_is_admin());
create policy "pmu_certificates_update" on public.pmu_certificates
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_certificates_delete" on public.pmu_certificates
  for delete using (public.pmu_is_admin());

-- H. pmu_instructor_course_access
create policy "pmu_instructor_access_select" on public.pmu_instructor_course_access
  for select using (
    instructor_id = auth.uid()
    or public.pmu_is_admin()
  );
create policy "pmu_instructor_access_insert" on public.pmu_instructor_course_access
  for insert with check (public.pmu_is_admin());
create policy "pmu_instructor_access_update" on public.pmu_instructor_course_access
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_instructor_access_delete" on public.pmu_instructor_course_access
  for delete using (public.pmu_is_admin());

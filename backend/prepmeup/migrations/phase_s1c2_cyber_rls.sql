-- ============================================================================
-- Phase S1-C2: CyberSecurity Database-Level Instructor RLS Isolation
-- Enables RLS on all specified tables with separate SELECT/INSERT/UPDATE/DELETE policies
-- Students can read only published content and their own attempts/progress
-- Instructors can manage only their own courses/labs
-- Admins can manage all CyberSecurity content
-- ============================================================================

-- ============================================================================
-- Enable RLS on all specified tables
-- ============================================================================

-- pmu_courses
alter table public.pmu_courses enable row level security;

-- pmu_course_modules
alter table public.pmu_course_modules enable row level security;

-- pmu_course_lessons
alter table public.pmu_course_lessons enable row level security;

-- pmu_cyber_labs
alter table public.pmu_cyber_labs enable row level security;

-- pmu_cyber_lab_tasks
alter table public.pmu_cyber_lab_tasks enable row level security;

-- pmu_cyber_lab_attempts
alter table public.pmu_cyber_lab_attempts enable row level security;

-- pmu_cyber_lab_progress
alter table public.pmu_cyber_lab_progress enable row level security;

-- pmu_cyber_incident_cases
alter table public.pmu_cyber_incident_cases enable row level security;

-- pmu_lab_acceptances
alter table public.pmu_lab_acceptances enable row level security;

-- pmu_content_reviews
alter table public.pmu_content_reviews enable row level security;

-- ============================================================================
-- Students can read only published content
-- Students can read only their own attempts, progress, and acceptances
-- Students cannot modify labs, tasks, flags, or other students' attempts
-- Students cannot read expected flag hashes
-- ============================================================================

-- pmu_courses: Students can read published courses only
create policy "pmu_courses_select_published" on public.pmu_courses for select using (status = 'published');

-- pmu_course_modules: Instructors can select modules for their courses
create policy "pmu_course_modules_select_instructor" on public.pmu_course_modules for select using (
  instructor_id = auth.uid() or exists (
    select 1 from public.pmu_courses c where c.id = course_id and c.instructor_id = auth.uid()
  )
);

-- pmu_course_lessons: Students can read lessons in published courses
create policy "pmu_course_lessons_select_published" on public.pmu_course_lessons for select using (
  exists (
    select 1 from public.pmu_courses c where c.id = course_id and c.status = 'published'
  )
);

-- pmu_cyber_labs: Students can read published labs only
create policy "pmu_cyber_labs_select_published" on public.pmu_cyber_labs for select using (status = 'published');

-- pmu_cyber_lab_tasks: Instructors can manage tasks for their labs
create policy "pmu_cyber_lab_tasks_instructor" on public.pmu_cyber_lab_tasks all using (
  instructor_id = auth.uid() or exists (
    select 1 from public.pmu_cyber_labs l where l.id = lab_id and l.instructor_id = auth.uid()
  )
);

-- pmu_cyber_lab_attempts: Students can read only their own attempts
create policy "pmu_cyber_lab_attempts_select_own" on public.pmu_cyber_lab_attempts for select using (user_id = auth.uid());

-- pmu_cyber_lab_progress: Students can read only their own progress
create policy "pmu_cyber_lab_progress_select_own" on public.pmu_cyber_lab_progress for select using (user_id = auth.uid());

-- pmu_cyber_incident_cases: Students can read published incident cases only
create policy "pmu_cyber_incident_cases_select_published" on public.pmu_cyber_incident_cases for select using (status = 'published');

-- pmu_lab_acceptances: Students can read their own acceptances
create policy "pmu_lab_acceptances_select_own" on public.pmu_lab_acceptances for select using (user_id = auth.uid());

-- ============================================================================
-- Instructors can select/update only courses, modules, lessons, labs, tasks, and incident cases
-- where they have owner/editor access
-- Instructors cannot access other instructors' courses
-- Instructors cannot access student payment data
-- ============================================================================

-- pmu_courses: Instructors can manage their own courses
create policy "pmu_courses_instructor_manage" on public.pmu_courses all using (instructor_id = auth.uid());

-- pmu_course_modules: Instructors can manage modules for their courses
create policy "pmu_course_modules_instructor_manage" on public.pmu_course_modules all using (
  instructor_id = auth.uid() or exists (
    select 1 from public.pmu_courses c where c.id = course_id and c.instructor_id = auth.uid()
  )
);

-- pmu_course_lessons: Instructors can manage lessons for their courses
create policy "pmu_course_lessons_instructor_manage" on public.pmu_course_lessons all using (
  instructor_id = auth.uid() or exists (
    select 1 from public.pmu_courses c where c.id = course_id and c.instructor_id = auth.uid()
  )
);

-- pmu_cyber_labs: Instructors can manage their own labs
create policy "pmu_cyber_labs_instructor_manage" on public.pmu_cyber_labs all using (instructor_id = auth.uid());

-- pmu_cyber_lab_tasks: Instructors can manage tasks for their labs
create policy "pmu_cyber_lab_tasks_instructor_manage" on public.pmu_cyber_lab_tasks all using (
  instructor_id = auth.uid() or exists (
    select 1 from public.pmu_cyber_labs l where l.id = lab_id and l.instructor_id = auth.uid()
  )
);

-- pmu_lab_acceptances: Admins can manage all acceptances, instructors their own
create policy "pmu_lab_acceptances_admin_or_own" on public.pmu_lab_acceptances all using (
  auth.role() = 'admin' or user_id = auth.uid()
);

-- ============================================================================
-- Admins can manage all CyberSecurity content
-- ============================================================================

-- pmu_courses: Admins can manage all courses
create policy "pmu_courses_admin_manage" on public.pmu_courses all using (public.pmu_is_admin());

-- pmu_course_modules: Admins can manage all modules
create policy "pmu_course_modules_admin_manage" on public.pmu_course_modules all using (public.pmu_is_admin());

-- pmu_course_lessons: Admins can manage all lessons
create policy "pmu_course_lessons_admin_manage" on public.pmu_course_lessons all using (public.pmu_is_admin());

-- pmu_cyber_labs: Admins can manage all labs
create policy "pmu_cyber_labs_admin_manage" on public.pmu_cyber_labs all using (public.pmu_is_admin());

-- pmu_cyber_lab_tasks: Admins can manage all tasks
create policy "pmu_cyber_lab_tasks_admin_manage" on public.pmu_cyber_lab_tasks all using (public.pmu_is_admin());

-- pmu_cyber_lab_attempts: Admins can view all attempts
create policy "pmu_cyber_lab_attempts_admin_view" on public.pmu_cyber_lab_attempts for select using (public.pmu_is_admin());

-- pmu_cyber_lab_progress: Admins can view all progress
create policy "pmu_cyber_lab_progress_admin_view" on public.pmu_cyber_lab_progress for select using (public.pmu_is_admin());

-- pmu_cyber_incident_cases: Admins can manage all incident cases
create policy "pmu_cyber_incident_cases_admin_manage" on public.pmu_cyber_incident_cases all using (public.pmu_is_admin());

-- pmu_lab_acceptances: Admins can manage all acceptances
create policy "pmu_lab_acceptances_admin_manage" on public.pmu_lab_acceptances all using (public.pmu_is_admin());

-- ============================================================================
-- Helper function: pmu_has_instructor_course_access(course_id)
-- ============================================================================

create or replace function public.pmu_has_instructor_course_access(course_id uuid)
returns boolean
language sql stable
as $$
  select exists (
    select 1 from public.pmu_courses
    where id = course_id and instructor_id = auth.uid()
  );
$$;

-- Grant execute permission on the function
grant execute on public.pmu_has_instructor_course_access to public;

-- ============================================================================
-- Indexes for common queries
-- ============================================================================

-- Indexes for pmu_courses
create index if not exists idx_pmu_courses_status on public.pmu_courses(status);
create index if not exists idx_pmu_courses_instructor_id on public.pmu_courses(instructor_id);

-- Indexes for pmu_course_modules
create index if not exists idx_pmu_course_modules_course_id on public.pmu_course_modules(course_id);
create index if not exists idx_pmu_course_modules_instructor_id on public.pmu_course_modules(instructor_id);

-- Indexes for pmu_course_lessons
create index if not exists idx_pmu_course_lessons_course_id on public.pmu_course_lessons(course_id);
create index if not exists idx_pmu_course_lessons_module_id on public.pmu_course_lessons(module_id);

-- Indexes for pmu_cyber_labs
create index if not exists idx_pmu_cyber_labs_status on public.pmu_cyber_labs(status);
create index if not exists idx_pmu_cyber_labs_instructor_id on public.pmu_cyber_labs(instructor_id);

-- Indexes for pmu_cyber_lab_tasks
create index if not exists idx_pmu_cyber_lab_tasks_lab_id on public.pmu_cyber_lab_tasks(lab_id);
create index if not exists idx_pmu_cyber_lab_tasks_instructor_id on public.pmu_cyber_lab_tasks(instructor_id);

-- Indexes for pmu_cyber_lab_attempts
create index if not exists idx_pmu_cyber_lab_attempts_user_id on public.pmu_cyber_lab_attempts(user_id);
create index if not exists idx_pmu_cyber_lab_attempts_lab_id on public.pmu_cyber_lab_attempts(lab_id);

-- Indexes for pmu_cyber_lab_progress
create index if not exists idx_pmu_cyber_lab_progress_user_id on public.pmu_cyber_lab_progress(user_id);
create index if not exists idx_pmu_cyber_lab_progress_lab_id on public.pmu_cyber_lab_progress(lab_id);

-- Indexes for pmu_cyber_incident_cases
create index if not exists idx_pmu_cyber_incident_cases_status on public.pmu_cyber_incident_cases(status);

-- Indexes for pmu_lab_acceptances
create index if not exists idx_pmu_lab_acceptances_user_id on public.pmu_lab_acceptances(user_id);
create index if not exists idx_pmu_lab_acceptances_lab_id on public.pmu_lab_acceptances(lab_id);

-- Indexes for pmu_content_reviews
create index if not exists idx_pmu_content_reviews_content_id on public.pmu_content_reviews(content_id);
create index if not exists idx_pmu_content_reviews_course_id on public.pmu_content_reviews(course_id);
create index if not exists idx_pmu_content_reviews_status on public.pmu_content_reviews(status);

-- ============================================================================
-- End of Phase S1-C2 RLS Migration
-- ============================================================================
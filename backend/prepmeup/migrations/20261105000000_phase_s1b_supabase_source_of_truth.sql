-- ============================================================================
-- Phase S1-B: Supabase Source of Truth — Migration C0
-- Makes Supabase PostgreSQL the single source of truth for all mutable
-- PrepMeUp AI business state. Idempotent: safe to re-run.
-- ============================================================================

-- Ensure uuid extension
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. COMMERCIAL STATE tables (payments, enrollments, orders, packs, redemptions)
-- ============================================================================

-- pmu_course_enrollments: students enrolled in courses
create table if not exists public.pmu_course_enrollments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  course_id           uuid not null references public.pmu_courses (id) on delete cascade,
  access_type         text not null default 'paid'
    check (access_type in ('paid', 'free_early_adopter', 'admin_granted')),
  status              text not null default 'active'
    check (status in ('active', 'expired', 'revoked')),
  started_at          timestamptz not null default now(),
  expires_at          timestamptz not null default (now() + interval '180 days'),
  purchased_at        timestamptz not null default now(),
  constraint uq_course_enrollment unique (user_id, course_id)
);

-- pmu_quantum_orders: Razorpay quantum orders
create table if not exists public.pmu_quantum_orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  razorpay_order_id   text unique not null,
  razorpay_payment_id text,
  amount_in_paise     int not null,
  currency            text not null default 'INR',
  status              text not null default 'created'
    check (status in ('created', 'pending', 'paid', 'failed', 'refunded')),
  quantum_course_id   uuid not null references public.pmu_quantum_courses (id) on delete cascade,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- pmu_quantum_payments: quantum payment records
create table if not exists public.pmu_quantum_payments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  quantum_order_id    uuid not null references public.pmu_quantum_orders (id) on delete cascade,
  razorpay_payment_id text unique,
  amount_in_paise     int not null,
  currency            text not null default 'INR',
  status              text not null default 'created'
    check (status in ('created', 'pending', 'paid', 'failed', 'refunded')),
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'failed')),
  captured_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- pmu_mentorship_packs: mentorship session packs
create table if not exists public.pmu_mentorship_packs (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  course_id           uuid references public.pmu_courses (id) on delete set null,
  months              int not null default 6 check (months >= 1 and months <= 36),
  access_type         text not null default 'admin_granted'
    check (access_type in ('admin_granted', 'paid', 'free_early_adopter')),
  status              text not null default 'active'
    check (status in ('active', 'consumed', 'cancelled', 'expired')),
  total_sessions      int not null default 6 check (total_sessions >= 1),
  consumed_sessions   int not null default 0 check (consumed_sessions >= 0 and consumed_sessions <= total_sessions),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- pmu_quantum_early_adopter_redemptions: early adopter claims
create table if not exists public.pmu_quantum_early_adopter_redemptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  quantum_course_id   uuid not null references public.pmu_quantum_courses (id) on delete cascade,
  redemption_code     text not null unique,
  status              text not null default 'claimed'
    check (status in ('claimed', 'used', 'revoked')),
  redeemed_at         timestamptz,
  created_at          timestamptz not null default now(),
  constraint uq_quantum_ea_redemption unique (user_id, quantum_course_id)
);

-- pmu_cyber_orders: CyberSecurity orders
create table if not exists public.pmu_cyber_orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  razorpay_order_id   text unique not null,
  razorpay_payment_id text,
  amount_in_paise     int not null,
  currency            text not null default 'INR',
  status              text not null default 'created'
    check (status in ('created', 'pending', 'paid', 'failed', 'refunded')),
  cyber_course_id     uuid not null references public.pmu_cyber_courses (id) on delete cascade,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- pmu_cyber_payments: CyberSecurity payment records
create table if not exists public.pmu_cyber_payments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  cyber_order_id      uuid not null references public.pmu_cyber_orders (id) on delete cascade,
  razorpay_payment_id text unique,
  amount_in_paise     int not null,
  currency            text not null default 'INR',
  status              text not null default 'created'
    check (status in ('created', 'pending', 'paid', 'failed', 'refunded')),
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'failed')),
  captured_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- pmu_cyber_mentorship_packs: CyberSecurity mentorship packs
create table if not exists public.pmu_cyber_mentorship_packs (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  months              int not null default 3 check (months >= 1 and months <= 24),
  status              text not null default 'active'
    check (status in ('active', 'consumed', 'cancelled', 'expired')),
  total_sessions      int not null default 3 check (total_sessions >= 1),
  consumed_sessions   int not null default 0 check (consumed_sessions >= 0 and consumed_sessions <= total_sessions),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- pmu_cyber_early_adopter_redemptions: Cyber early adopter claims
create table if not exists public.pmu_cyber_early_adopter_redemptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  redemption_code     text not null unique,
  status              text not null default 'claimed'
    check (status in ('claimed', 'used', 'revoked')),
  redeemed_at         timestamptz,
  created_at          timestamptz not null default now()
);

-- pmu_unified_orders: Unified pricing orders
create table if not exists public.pmu_unified_orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  product_id          text not null,
  razorpay_order_id   text unique,
  amount_in_paise     int not null,
  currency            text not null default 'INR',
  status              text not null default 'created'
    check (status in ('created', 'pending', 'paid', 'failed', 'refunded')),
  metadata            jsonb default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- pmu_unified_payments: Unified payment records
create table if not exists public.pmu_unified_payments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  unified_order_id    uuid not null references public.pmu_unified_orders (id) on delete cascade,
  razorpay_payment_id text unique,
  amount_in_paise     int not null,
  currency            text not null default 'INR',
  status              text not null default 'created'
    check (status in ('created', 'pending', 'paid', 'failed', 'refunded')),
  captured_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- pmu_all_access_entitlements: All-Access pass entitlements
create table if not exists public.pmu_all_access_entitlements (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  entitlement_type    text not null default 'all_access'
    check (entitlement_type in ('all_access', 'early_adopter')),
  status              text not null default 'active'
    check (status in ('active', 'expired', 'revoked')),
  starts_at           timestamptz not null default now(),
  expires_at          timestamptz not null default (now() + interval '365 days'),
  granted_at          timestamptz not null default now(),
  constraint uq_all_access_user unique (user_id)
);

-- pmu_all_access_early_adopter_redemptions: All-Access early adopter redemptions
create table if not exists public.pmu_all_access_early_adopter_redemptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  redemption_code     text not null unique,
  status              text not null default 'claimed'
    check (status in ('claimed', 'used', 'revoked')),
  redeemed_at         timestamptz,
  created_at          timestamptz not null default now()
);

-- ============================================================================
-- 2. MENTORSHIP tables
-- ============================================================================

-- pmu_instructor_availability: instructor availability slots
create table if not exists public.pmu_instructor_availability (
  id                  uuid primary key default gen_random_uuid(),
  instructor_id       uuid not null references public.pmu_admins (id) on delete cascade,
  day_of_week         int not null check (day_of_week >= 0 and day_of_week <= 6),
  start_time          text not null,
  end_time            text not null,
  timezone            text not null default 'Asia/Kolkata',
  is_active           boolean not null default true,
  constraint uq_instructor_day unique (instructor_id, day_of_week)
);

-- pmu_mentorship_slots: individual mentorship session slots
create table if not exists public.pmu_mentorship_slots (
  id                  uuid primary key default gen_random_uuid(),
  pack_id             uuid references public.pmu_mentorship_packs (id) on delete cascade,
  instructor_id       uuid not null references public.pmu_admins (id) on delete cascade,
  start_at            timestamptz not null,
  end_at              timestamptz not null,
  timezone            text not null default 'Asia/Kolkata',
  status              text not null default 'available'
    check (status in ('available', 'booked', 'cancelled')),
  booked_by           uuid references public.pmu_profiles (id) on delete set null,
  booking_id          uuid references public.pmu_mentorship_sessions (id) on delete set null,
  constraint uq_slot_times unique (instructor_id, start_at)
);

-- pmu_mentorship_sessions: booked mentorship sessions
create table if not exists public.pmu_mentorship_sessions (
  id                  uuid primary key default gen_random_uuid(),
  slot_id             uuid not null references public.pmu_mentorship_slots (id) on delete cascade,
  student_id          uuid not null references public.pmu_profiles (id) on delete cascade,
  instructor_id       uuid not null references public.pmu_admins (id) on delete cascade,
  course_id           uuid references public.pmu_courses (id) on delete set null,
  status              text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  started_at          timestamptz,
  completed_at        timestamptz,
  feedback_rating     numeric(2,1) check (feedback_rating between 1 and 5),
  feedback_text       text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- pmu_mentorship_session_audit: audit trail for mentorship sessions
create table if not exists public.pmu_mentorship_session_audit (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid not null references public.pmu_mentorship_sessions (id) on delete cascade,
  changed_by          uuid references public.pmu_admins (id),
  changed_at          timestamptz not null default now(),
  change_type         text not null check (change_type in ('status', 'rating', 'feedback', 'cancelled')),
  old_value           text,
  new_value           text,
  constraint uq_session_audit unique (session_id, change_type, old_value)
);

-- ============================================================================
-- 3. CERTIFICATES table
-- ============================================================================

create table if not exists public.pmu_certificates (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  course_id           uuid not null references public.pmu_courses (id) on delete cascade,
  certificate_code    text not null unique,
  issue_date          timestamptz not null default now(),
  expiry_date         timestamptz,
  status              text not null default 'active'
    check (status in ('active', 'revoked', 'expired')),
  verification_count  int not null default 0 check (verification_count >= 0),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ============================================================================
-- 4. CYBERSECURITY tables
-- ============================================================================

-- pmu_cyber_labs: CyberSecurity labs
create table if not exists public.pmu_cyber_labs (
  id                uuid primary key default gen_random_uuid(),
  title               text not null,
  description         text not null default '',
  slug                text not null unique,
  status              text not null default 'draft'
    check (status in ('draft', 'pending_review', 'approved', 'published', 'archived')),
  is_sample           boolean not null default false,
  created_by          uuid references public.pmu_admins (id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- pmu_cyber_lab_tasks: individual lab tasks
create table if not exists public.pmu_cyber_lab_tasks (
  id                uuid primary key default gen_random_uuid(),
  lab_id              uuid not null references public.pmu_cyber_labs (id) on delete cascade,
  task_number         int not null,
  title               text not null,
  description         text not null default '',
  difficulty          text not null default 'medium'
    check (difficulty in ('easy', 'medium', 'hard')),
  is_sample           boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint uq_lab_task unique (lab_id, task_number)
);

-- pmu_cyber_lab_attempts: student lab attempt records
create table if not exists public.pmu_cyber_lab_attempts (
  id                uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  task_id             uuid not null references public.pmu_cyber_lab_tasks (id) on delete cascade,
  started_at          timestamptz not null default now(),
  completed_at        timestamptz,
  score               numeric(5,2) check (score between 0 and 100),
  status              text not null default 'in_progress'
    check (status in ('in_progress', 'submitted', 'expired')),
  max_attempts        int not null default 3 check (max_attempts >= 1),
  constraint uq_user_task_attempt unique (user_id, task_id)
);

-- pmu_cyber_lab_progress: lab progress tracking
create table if not exists public.pmu_cyber_lab_progress (
  id                uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  lab_id              uuid not null references public.pmu_cyber_labs (id) on delete cascade,
  progress_percentage numeric(5,2) not null check (progress_percentage between 0 and 100),
  last_activity_at    timestamptz not null default now(),
  completed_at        timestamptz,
  constraint uq_user_lab_progress unique (user_id, lab_id)
);

-- pmu_cyber_incident_cases: security incident case management
create table if not exists public.pmu_cyber_incident_cases (
  id                uuid primary key default gen_random_uuid(),
  title               text not null,
  description         text not null default '',
  severity            text not null default 'medium'
    check (severity in ('low', 'medium', 'high', 'critical')),
  status              text not null default 'open'
    check (status in ('open', 'investigating', 'resolved', 'closed')),
  reported_by         uuid references public.pmu_admins (id),
  resolved_by         uuid references public.pmu_admins (id),
  resolved_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- pmu_lab_acceptances: lab acceptances/acknowledgments
create table if not exists public.pmu_lab_acceptances (
  id                uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  lab_task_id         uuid not null references public.pmu_cyber_lab_tasks (id) on delete cascade,
  accepted_at         timestamptz not null default now(),
  constraint uq_user_lab_acceptance unique (user_id, lab_task_id)
);

-- ============================================================================
-- 5. ACADEMIC CONTENT tables (ensure full coverage)
-- ============================================================================

-- pmu_courses: courses (standalone)
create table if not exists public.pmu_courses (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  description       text not null default '',
  level             text not null default 'beginner'
    check (level in ('beginner', 'intermediate', 'advanced')),
  language          text not null default 'English',
  format            text not null default 'hybrid'
    check (format in ('hybrid', 'video', 'text', 'interactive')),
  thumbnail_url     text,
  status            text not null default 'draft'
    check (status in ('draft', 'pending_review', 'approved', 'published')),
  is_free_preview   boolean not null default false,
  instructor_id     uuid references public.pmu_admins (id),
  track_slug        text references public.pmu_tracks (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- pmu_course_modules: modules within a course
create table if not exists public.pmu_course_modules (
  id                uuid primary key default gen_random_uuid(),
  course_id           uuid not null references public.pmu_courses (id) on delete cascade,
  module_number     int not null,
  title             text not null,
  description       text not null default '',
  is_published      boolean not null default false,
  constraint uq_course_module unique (course_id, module_number)
);

-- pmu_course_lessons: lessons within a course module
create table if not exists public.pmu_course_lessons (
  id                uuid primary key default gen_random_uuid(),
  course_id           uuid not null references public.pmu_courses (id) on delete cascade,
  module_id           uuid references public.pmu_course_modules (id) on delete set null,
  lesson_number     int not null,
  title             text not null,
  description       text not null default '',
  lesson_type       text not null default 'video'
    check (lesson_type in ('video', 'pdf', 'simulation', 'coding_lab')),
  is_free_preview   boolean not null default false,
  status            text not null default 'draft'
    check (status in ('draft', 'pending_review', 'approved', 'published')),
  video_url         text,
  simulation_id     text,
  content_markdown  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- pmu_tracks: learning tracks
create table if not exists public.pmu_tracks (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  description       text not null default '',
  icon              text not null default '🛤️',
  status            text not null default 'draft'
    check (status in ('draft', 'pending_review', 'approved', 'published')),
  display_order     int not null default 1,
  badge             text not null default 'Active',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ============================================================================
-- 6. RATE LIMIT and ANALYTICS tables
-- ============================================================================

-- pmu_rate_limit_events: rate limit tracking (idempotent insert with ON CONFLICT)
create table if not exists public.pmu_rate_limit_events (
  id                  uuid primary key default gen_random_uuid(),
  identifier         text not null,
  type                text not null
    check (type in ('admin_login', 'api_rate_limit', 'webhook_delivery', 'otp_submit')),
  count               int not null default 1 check (count >= 1),
  first_attempt_at    timestamptz not null default now(),
  last_attempt_at     timestamptz not null default now(),
  window_start        timestamptz not null default now(),
  constraint uq_rate_limit unique (identifier, type, window_start)
);

-- pmu_analytics_events: analytics event tracking
create table if not exists public.pmu_analytics_events (
  id                uuid primary key default gen_random_uuid(),
  user_id             uuid references public.pmu_profiles (id) on delete set null,
  event_type         text not null
    check (event_type in ('page_view', 'lesson_start', 'quiz_attempt', 'certificate_issued', 'mentorship_booking', 'payment_success', 'payment_failed')),
  session_id         text,
  properties         jsonb default '{}'::jsonb,
  created_at         timestamptz not null default now()
);

-- pmu_tool_history: tool usage history for audit
create table if not exists public.pmu_tool_history (
  id                uuid primary key default gen_random_uuid(),
  user_id             uuid references public.pmu_profiles (id) on delete set null,
  tool_name          text not null,
  action             text not null,
  status             text not null default 'success'
    check (status in ('success', 'error', 'timeout')),
  details             jsonb default '{}'::jsonb,
  created_at         timestamptz not null default now()
);

-- ============================================================================
-- 7. pmu_content_reviews: Admin approvals workflow table
create table if not exists public.pmu_content_reviews (
  id                  uuid primary key default gen_random_uuid(),
  content_type        text not null check (content_type in ('lesson', 'lab', 'quiz', 'question', 'note', 'incident_case')),
  content_id          uuid not null,
  course_id           uuid not null,
  instructor_id       uuid references public.pmu_instructors (id) on delete set null,
  status              text not null default 'pending_review' check (status in ('pending_review', 'approved', 'rejected', 'changes_requested', 'published', 'archived')),
  reviewer_id         uuid references public.pmu_profiles (id),
  comments          text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Enable RLS on pmu_content_reviews
alter table public.pmu_content_reviews enable row level security;

-- Only admins can select all reviews
create policy "pmu_content_reviews_select_admin" on public.pmu_content_reviews for select using (public.pmu_is_admin());
-- Instructors can view reviews only for their own content
create policy "pmu_content_reviews_select_instructor" on public.pmu_content_reviews for select using (
  instructor_id = auth.uid() or exists (
    select 1 from public.pmu_courses c where c.id = course_id and c.instructor_id = auth.uid()
  )
);

-- Admins can insert reviews
create policy "pmu_content_reviews_insert_admin" on public.pmu_content_reviews for insert with check (public.pmu_is_admin());
-- Instructors can insert reviews for their own content
create policy "pmu_content_reviews_insert_instructor" on public.pmu_content_reviews for insert with check (
  instructor_id = auth.uid() or exists (
    select 1 from public.pmu_courses c where c.id = course_id and c.instructor_id = auth.uid()
  )
);

-- Admins can update reviews
create policy "pmu_content_reviews_update_admin" on public.pmu_content_reviews for update using (public.pmu_is_admin());
-- Instructors can update their own reviews
create policy "pmu_content_reviews_update_instructor" on public.pmu_content_reviews for update using (
  instructor_id = auth.uid() or exists (
    select 1 from public.pmu_courses c where c.id = course_id and c.instructor_id = auth.uid()
  )
);

-- Admins can delete reviews
create policy "pmu_content_reviews_delete_admin" on public.pmu_content_reviews for delete using (public.pmu_is_admin());

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) — Separate policies for SELECT, INSERT, UPDATE, DELETE
-- ============================================================================

-- COMMERCIAL STATE RLS
alter table public.pmu_course_enrollments enable row level security;
create policy "pmu_course_enrollments_select_own" on public.pmu_course_enrollments for select using (user_id = auth.uid());
create policy "pmu_course_enrollments_select_admin" on public.pmu_course_enrollments for select using (public.pmu_is_admin());
create policy "pmu_course_enrollments_insert" on public.pmu_course_enrollments for insert with check (user_id = auth.uid());
create policy "pmu_course_enrollments_update_own" on public.pmu_course_enrollments for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "pmu_course_enrollments_delete_admin" on public.pmu_course_enrollments for delete using (public.pmu_is_admin());

alter table public.pmu_quantum_orders enable row level security;
create policy "pmu_quantum_orders_select_own" on public.pmu_quantum_orders for select using (user_id = auth.uid());
create policy "pmu_quantum_orders_select_admin" on public.pmu_quantum_orders for select using (public.pmu_is_admin());
create policy "pmu_quantum_orders_insert" on public.pmu_quantum_orders for insert with check (user_id = auth.uid() and public.pmu_is_admin());
create policy "pmu_quantum_orders_update_admin" on public.pmu_quantum_orders for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_quantum_orders_delete_admin" on public.pmu_quantum_orders for delete using (public.pmu_is_admin());

alter table public.pmu_quantum_payments enable row level security;
create policy "pmu_quantum_payments_select_own" on public.pmu_quantum_payments for select using (user_id = auth.uid());
create policy "pmu_quantum_payments_select_admin" on public.pmu_quantum_payments for select using (public.pmu_is_admin());
create policy "pmu_quantum_payments_insert" on public.pmu_quantum_payments for insert with check (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_quantum_payments_update_admin" on public.pmu_quantum_payments for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_quantum_payments_delete_admin" on public.pmu_quantum_payments for delete using (public.pmu_is-admin());

alter table public.pmu_mentorship_packs enable row level security;
create policy "pmu_mentorship_packs_select_own" on public.pmu_mentorship_packs for select using (user_id = auth.uid());
create policy "pmu_mentorship_packs_select_admin" on public.pmu_mentorship_packs for select using (public.pmu_is_admin());
create policy "pmu_mentorship_packs_insert" on public.pmu_mentorship_packs for insert with check (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_mentorship_packs_update_admin" on public.pmu_mentorship_packs for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_mentorship_packs_delete_admin" on public.pmu_mentorship_packs for delete using (public.pmu_is-admin());

alter table public.pmu_quantum_early_adopter_redemptions enable row level security;
create policy "pmu_quantum_ea_redemptions_select_own" on public.pmu_quantum_early_adopter_redemptions for select using (user_id = auth.uid());
create policy "pmu_quantum_ea_redemptions_select_admin" on public.pmu_quantum_early_adopter_redemptions for select using (public.pmu_is_admin());
create policy "pmu_quantum_ea_redemptions_insert" on public.pmu_quantum_early_adopter_redemptions for insert with check (user_id = auth.uid());
create policy "pmu_quantum_ea_redemptions_update_admin" on public.pmu_quantum_early_adopter_redemptions for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_quantum_ea_redemptions_delete_admin" on public.pmu_quantum_early_adopter_redemptions for delete using (public.pmu_is-admin());

alter table public.pmu_cyber_orders enable row level security;
create policy "pmu_cyber_orders_select_own" on public.pmu_cyber_orders for select using (user_id = auth.uid());
create policy "pmu_cyber_orders_select_admin" on public.pmu_cyber_orders for select using (public.pmu_is_admin());
create policy "pmu_cyber_orders_insert" on public.pmu_cyber_orders for insert with check (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_cyber_orders_update_admin" on public.pmu_cyber_orders for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_cyber_orders_delete_admin" on public.pmu_cyber_orders for delete using (public.pmu_is-admin());

alter table public.pmu_cyber_payments enable row level security;
create policy "pmu_cyber_payments_select_own" on public.pmu_cyber_payments for select using (user_id = auth.uid());
create policy "pmu_cyber_payments_select_admin" on public.pmu_cyber_payments for select using (public.pmu_is_admin());
create policy "pmu_cyber_payments_insert" on public.pmu_cyber_payments for insert with check (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_cyber_payments_update_admin" on public.pmu_cyber_payments for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_cyber_payments_delete_admin" on public.pmu_cyber_payments for delete using (public.pmu_is-admin());

alter table public.pmu_cyber_mentorship_packs enable row level security;
create policy "pmu_cyber_mentorship_packs_select_own" on public.pmu_cyber_mentorship_packs for select using (user_id = auth.uid());
create policy "pmu_cyber_mentorship_packs_select_admin" on public.pmu_cyber_mentorship_packs for select using (public.pmu_is_admin());
create policy "pmu_cyber_mentorship_packs_insert" on public.pmu_cyber_mentorship_packs for insert with check (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_cyber_mentorship_packs_update_admin" on public.pmu_cyber_mentorship_packs for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_cyber_mentorship_packs_delete_admin" on public.pmu_cyber_mentorship_packs for delete using (public.pmu_is-admin());

alter table public.pmu_cyber_early_adopter_redemptions enable row level security;
create policy "pmu_cyber_ea_redemptions_select_own" on public.pmu_cyber_early_adopter_redemptions for select using (user_id = auth.uid());
create policy "pmu_cyber_ea_redemptions_select_admin" on public.pmu_cyber_early_adopter_redemptions for select using (public.pmu_is_admin());
create policy "pmu_cyber_ea_redemptions_insert" on public.pmu_cyber_early_adopter_redemptions for insert with check (user_id = auth.uid());
create policy "pmu_cyber_ea_redemptions_update_admin" on public.pmu_cyber_early_adopter_redemptions for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_cyber_ea_redemptions_delete_admin" on public.pmu_cyber_early_adopter_redemptions for delete using (public.pmu-is-admin());

alter table public.pmu_unified_orders enable row level security;
create policy "pmu_unified_orders_select_own" on public.pmu_unified_orders for select using (user_id = auth.uid());
create policy "pmu_unified_orders_select_admin" on public.pmu_unified_orders for select using (public.pmu_is_admin());
create policy "pmu_unified_orders_insert" on public.pmu_unified_orders for insert with check (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_unified_orders_update_admin" on public.pmu_unified_orders for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_unified_orders_delete_admin" on public.pmu_unified_orders for delete using (public.pmu_is-admin());

alter table public.pmu_unified_payments enable row level security;
create policy "pmu_unified_payments_select_own" on public.pmu_unified_payments for select using (user_id = auth.uid());
create policy "pmu_unified_payments_select_admin" on public.pmu_unified_payments for select using (public.pmu_is_admin());
create policy "pmu_unified_payments_insert" on public.pmu_unified_payments for insert with check (user_id = auth.uid() or public.pmu_is_admin());
create policy "pmu_unified_payments_update_admin" on public.pmu_unified_payments for update using (public.pmu_is_admin()) with check (public.pmu_is-admin());
create policy "pmu_unified_payments_delete_admin" on public.pmu_unified_payments for delete using (public.pmu-is-admin());

alter table public.pmu_all_access_entitlements enable row level security;
create policy "pmu_all_access_entitlements_select_own" on public.pmu_all_access_entitlements for select using (user_id = auth.uid());
create policy "pmu_all_access_entitlements_select_admin" on public.pmu_all_access_entitlements for select using (public.pmu_is_admin());
create policy "pmu_all_access_entitlements_insert" on public.pmu_all_access_entitlements for insert with check (public.pmu_is_admin());
create policy "pmu_all_access_entitlements_update_admin" on public.pmu_all_access_entitlements for update using (public.pmu_is_admin()) with check (public.pmu_is-admin());
create policy "pmu_all_access_entitlements_delete_admin" on public.pmu_all_access_entitlements for delete using (public.pmu-is-admin());

alter table public.pmu_all_access_early_adopter_redemptions enable row level security;
create policy "pmu_all_access_ea_redemptions_select_own" on public.pmu_all_access_early_adopter_redemptions for select using (user_id = auth.uid());
create policy "pmu_all_access_ea_redemptions_select_admin" on public.pmu_all_access_early_adopter_redemptions for select using (public.pmu_is-admin());
create policy "pmu_all_access_ea_redemptions_insert" on public.pmu_all_access_early_adopter_redemptions for insert with check (public.pmu-is-admin());
create policy "pmu_all_access_ea_redemptions_update_admin" on public.pmu_all_access_early_adopter_redemptions for update using (public.pmu-is-admin()) with check (public.pmu-is-admin());
create policy "pmu_all_access_ea_redemptions_delete_admin" on public.pmu_all_access_early_adopter_redemptions for delete using (public.pmu-is-admin());

-- MENTORSHIP RLS
alter table public.pmu_instructor_availability enable row level security;
create policy "pmu_instructor_availability_select_admin" on public.pmu_instructor_availability for select using (public.pmu_is_admin());
create policy "pmu_instructor_availability_insert_admin" on public.pmu_instructor_availability for insert with check (public.pmu_is_admin());
create policy "pmu_instructor_availability_update_admin" on public.pmu_instructor_availability for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_instructor_availability_delete_admin" on public.pmu_instructor_availability for delete using (public.pmu_is-admin());

alter table public.pmu_mentorship_slots enable row level security;
create policy "pmu_mentorship_slots_select_available" on public.pmu_mentorship_slots for select using (status = 'available');
create policy "pmu_mentorship_slots_select_own_booked" on public.pmu_mentorship_slots for select using (booked_by = auth.uid());
create policy "pmu_mentorship_slots_insert_booked" on public.pmu_mentorship_slots for insert with check (exists (select 1 from public.pmu_mentorship_packs p where p.user_id = auth.uid()) and (status = 'available' or booked_by = auth.uid()));
create policy "pmu_mentorship_slots_update_instructor" on public.pmu_mentorship_slots for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());
create policy "pmu_mentorship_slots_delete_admin" on public.pmu_mentorship_slots for delete using (public.pmu_is-admin());

alter table public.pmu_mentorship_sessions enable row level security;
create policy "pmu_mentorship_sessions_select_student" on public.pmu_mentorship_sessions for select using (student_id = auth.uid());
create policy "pmu_mentorship_sessions_select_instructor" on public.pmu_mentorship_sessions for select using (instructor_id = auth.uid());
create policy "pmu_mentorship_sessions_insert_student" on public.pmu_mentorship_sessions for insert with check (student_id = auth.uid());
create policy "pmu_mentorship_sessions_update_student" on public.pmu_mentorship_sessions for update using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "pmu_mentorship_sessions_update_instructor_status" on public.pmu_mentorship_sessions for update using (public.pmu_is_admin()) with check (public.pmu_is-admin());
create policy "pmu_mentorship_sessions_delete_admin" on public.pmu_mentorship_sessions for delete using (public.pmu-is-admin());

alter table public.pmu_mentorship_session_audit enable row level security;
create policy "pmu_mentorship_session_audit_select_admin" on public.pmu_mentorship_session_audit for select using (public.pmu_is-admin());
create policy "pmu_mentorship_session_audit_insert_admin" on public.pmu_mentorship_session_audit for insert with check (public.pmu-is-admin());

-- CERTIFICATES RLS
alter table public.pmu_certificates enable row level security;
create policy "pmu_certificates_select_own" on public.pmu_certificates for select using (user_id = auth.uid());
create policy "pmu_certificates_select_admin" on public.pmu_certificates for select using (public.pmu_is-admin());
create policy "pmu_certificates_insert_admin" on public.pmu_certificates for insert with check (public.pmu-is-admin());
create policy "pmu_certificates_update_admin" on public.pmu_certificates for update using (public.pmu-is-admin()) with check (public.pmu-is-admin());
create policy "pmu_certificates_delete_admin" on public.pmu_certificates for delete using (public.pmu-is-admin());

-- CYBERSECURITY RLS
alter table public.pmu_cyber_labs enable row level security;
create policy "pmu_cyber_labs_select_published" on public.pmu_cyber_labs for select using (status = 'published' or public.pmu_is-admin());
create policy "pmu_cyber_labs_insert_admin" on public.pmu_cyber_labs for insert with check (public.pmu-is-admin());
create policy "pmu_cyber_labs_update_admin" on public.pmu_cyber_labs for update using (public.pmu-is-admin()) with check (public.pmu-is-admin());
create policy "pmu_cyber_labs_delete_admin" on public.pmu_cyber_labs for delete using (public.pmu-is-admin());

alter table public.pmu_cyber_lab_tasks enable row level security;
create policy "pmu_cyber_lab_tasks_select_lab" on public.pmu_cyber_lab_tasks for select using (lab_id = auth.uid() or public.pmu-is-admin());
create policy "pmu_cyber_lab_tasks_insert_admin" on public.pmu_cyber_lab_tasks for insert with check (public.pmu-is-admin());
create policy "pmu_cyber_lab_tasks_update_admin" on public.pmu_cyber_lab_tasks for update using (public.pmu-is-admin()) with check (public.pmu-is-admin());
create policy "pmu_cyber_lab_tasks_delete_admin" on public.pmu_cyber_lab_tasks for delete using (public.pmu-is-admin());

alter table public.pmu_cyber_lab_attempts enable row level security;
create policy "pmu_cyber_lab_attempts_select_own" on public.pmu_cyber_lab_attempts for select using (user_id = auth.uid());
create policy "pmu_cyber_lab_attempts_insert_student" on public.pmu_cyber_lab_attempts for insert with check (user_id = auth.uid());
create policy "pmu_cyber_lab_attempts_update_student" on public.pmu_cyber_lab_attempts for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "pmu_cyber_lab_attempts_delete_admin" on public.pmu_cyber_lab_attempts for delete using (public.pmu-is-admin());

alter table public.pmu_cyber_lab_progress enable row level security;
create policy "pmu_cyber_lab_progress_select_own" on public.pmu_cyber_lab_progress for select using (user_id = auth.uid());
create policy "pmu_cyber_lab_progress_insert_student" on public.pmu_cyber_lab_progress for insert with check (user_id = auth.uid());
create policy "pmu_cyber_lab_progress_update_student" on public.pmu_cyber_lab_progress for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "pmu_cyber_lab_progress_delete_admin" on public.pmu_cyber_lab_progress for delete using (public.pmu-is-admin());

alter table public.pmu_cyber_incident_cases enable row level security;
create policy "pmu_cyber_incident_cases_select_admin" on public.pmu_cyber_incident_cases for select using (public.pmu-is-admin());
create policy "pmu_cyber_incident_cases_insert_admin" on public.pmu_cyber_incident_cases for insert with check (public.pmu-is-admin());
create policy "pmu_cyber_incident_cases_update_admin" on public.pmu_cyber_incident_cases for update using (public.pmu-is-admin()) with check (public.pmu-is-admin());
create policy "pmu_cyber_incident_cases_delete_admin" on public.pmu_cyber_incident_cases for delete using (public.pmu-is-admin());

alter table public.pmu_lab_acceptances enable row level security;
create policy "pmu_lab_acceptances_select_own" on public.pmu_lab_acceptances for select using (user_id = auth.uid());
create policy "pmu_lab_acceptances_insert_student" on public.pmu_lab_acceptances for insert with check (user_id = auth.uid());
create policy "pmu_lab_acceptances_delete_admin" on public.pmu_lab_acceptances for delete using (public.pmu-is-admin());

-- ACADEMIC CONTENT RLS (extend existing)
alter table public.pmu_modules enable row level security;
create policy "pmu_modules_select_published" on public.pmu_modules for select using (is_published = true or public.pmu_is-admin());
create policy "pmu_modules_insert_admin" on public.pmu_modules for insert with check (public.pmu-is-admin());
create policy "pmu_modules_update_admin" on public.pmu_modules for update using (public.pmu-is-admin()) with check (public.pmu-is-admin());
create policy "pmu_modules_delete_admin" on public.pmu_modules for delete using (public.pmu-is-admin());

alter table public.pmu_topics enable row level security;
create policy "pmu_topics_select_published" on public.pmu_topics for select using (is_published = true or public.pmu-is-admin());
create policy "pmu_topics_insert_admin" on public.pmu_topics for insert with check (public.pmu-is-admin());
create policy "pmu_topics_update_admin" on public.pmu_topics for update using (public.pmu-is-admin()) with check (public.pmu-is-admin());
create policy "pmu_topics_delete_admin" on public.pmu_topics for delete using (public.pmu-is-admin());

alter table public.pmu_past_papers enable row level security;
create policy "pmu_past_papers_select_published" on public.pmu_past_papers for select using (is_published = true or public.pmu-is-admin());
create policy "pmu_past_papers_insert_admin" on public.pmu_past_papers for insert with check (public.pmu-is-admin());
create policy "pmu_past_papers_update_admin" on public.pmu_past_papers for update using (public.pmu-is-admin()) with check (public.pmu-is-admin());
create policy "pmu_past_papers_delete_admin" on public.pmu_past_papers for delete using (public.pmu-is-admin());

alter table public.pmu_courses enable row level security;
create policy "pmu_courses_select_published" on public.pmu_courses for select using (status = 'published' or public.pmu-is-admin());
create policy "pmu_courses_insert_admin" on public.pmu_courses for insert with check (public.pmu-is-admin());
create policy "pmu_courses_update_admin" on public.pmu_courses for update using (public.pmu-is-admin()) with check (public.pmu-is-admin());
create policy "pmu_courses_delete_admin" on public.pmu_courses for delete using (public.pmu-is-admin());

alter table public.pmu_course_modules enable row level security;
create policy "pmu_course_modules_select_course" on public.pmu_course_modules for select using (course_id is not null);
create policy "pmu_course_modules_insert_admin" on public.pmu_course_modules for insert with check (public.pmu-is-admin());
create policy "pmu_course_modules_update_admin" on public.pmu_course_modules for update using (public.pmu-is-admin()) with check (public.pmu-is-admin());
create policy "pmu_course_modules_delete_admin" on public.pmu_course_modules for delete using (public.pmu-is-admin());

alter table public.pmu_course_lessons enable row level security;
create policy "pmu_course_lessons_select_module" on public.pmu_course_lessons for select using (module_id is not null);
create policy "pmu_course_lessons_insert_admin" on public.pmu_course_lessons for insert with check (public.pmu-is-admin());
create policy "pmu_course_lessons_update_admin" on public.pmu_course_lessons for update using (public.pmu-is-admin()) with check (public.pmu-is-admin());
create policy "pmu_course_lessons_delete_admin" on public.pmu_course_lessons for delete using (public.pmu-is-admin());

-- Indexes
create index if not exists pmu_idx_course_enrollments_user on public.pmu_course_enrollments (user_id);
create index if not exists pmu_idx_course_enrollments_course on public.pmu_course_enrollments (course_id);
create index if not exists pmu_idx_quantum_orders_user on public.pmu_quantum_orders (user_id);
create index if not exists pmu_idx_quantum_orders_status on public.pmu_quantum_orders (status);
create index if not exists pmu_idx_quantum_payments_user on public.pmu_quantum_payments (user_id);
create index if not exists pmu_idx_mentorship_packs_user on public.pmu_mentorship_packs (user_id);
create index if not exists pmu_idx_quantum_ea_redemptions_user on public.pmu_quantum_early_adopter_redemptions (user_id);
create index if not exists pmu_idx_cyber_orders_user on public.pmu_cyber_orders (user_id);
create index if not exists pmu_idx_cyber_payments_user on public.pmu_cyber_payments (user_id);
create index if not exists pmu_idx_cyber_mentorship_packs_user on public.pmu_cyber_mentorship_packs (user_id);
create index if not exists pmu_idx_cyber_ea_redemptions_user on public.pmu_cyber_early_adopter_redemptions (user_id);
create index if not exists pmu_idx_unified_orders_user on public.pmu_unified_orders (user_id);
create index if not exists pmu_idx_unified_payments_user on public.pmu_unified_payments (user_id);
create index if not exists pmu_idx_all_access_entitlements_user on public.pmu_all_access_entitlements (user_id);
create index if not exists pmu_idx_all_access_ea_redemptions_user on public.pmu_all_access_early_adopter_redemptions (user_id);
create index if not exists pmu_idx_instructor_availability_instructor on public.pmu_instructor_availability (instructor_id);
create index if not exists pmu_idx_mentorship_slots_instructor on public.pmu_mentorship_slots (instructor_id);
create index if not exists pmu_idx_mentorship_sessions_student on public.pmu_mentorship_sessions (student_id);
create index if not exists pmu_idx_mentorship_sessions_slot on public.pmu_mentorship_sessions (slot_id);
create index if not exists pmu_idx_certificates_user on public.pmu_certificates (user_id);
create index if not exists pmu_idx_cyber_labs_status on public.pmu_cyber_labs (status);
create index if not exists pmu_idx_cyber_lab_tasks_lab on public.pmu_cyber_lab_tasks (lab_id);
create index if not exists pmu_idx_cyber_lab_attempts_user_task on public.pmu_cyber_lab_attempts (user_id, task_id);
create index if not exists pmu_idx_cyber_lab_progress_user_lab on public.pmu_cyber_lab_progress (user_id, lab_id);
create index if not exists pmu_idx_cyber_incident_cases_severity on public.pmu_cyber_incident_cases (severity);
create index if not exists pmu_idx_lab_acceptances_user_lab on public.pmu_lab_acceptances (user_id, lab_task_id);
create index if not exists pmu_idx_courses_slug on public.pmu_courses (slug);
create index if not exists pmu_idx_courses_status on public.pmu_courses (status);
create index if not exists pmu_idx_course_modules_course on public.pmu_course_modules (course_id);
create index if not exists pmu_idx_course_lessons_module on public.pmu_course_lessons (module_id);
create index if not exists pmu_idx_tracks_slug on public.pmu_tracks (slug);
create index if not exists pmu_idx_rate_limit_events_identifier on public.pmu_rate_limit_events (identifier, type);
create index if not exists pmu_idx_analytics_events_type on public.pmu_analytics_events (event_type);
create index if not exists pmu_idx_analytics_events_created on public.pmu_analytics_events (created_at desc);
create index if not exists pmu_idx_tool_history_user on public.pmu_tool_history (user_id);
create index if not exists pmu_idx_tool_history_tool on public.pmu_tool_history (tool_name, created_at);

-- ============================================================================
-- 8. SEED DATA — Idempotent upserts for existing JSON content
-- ============================================================================

-- Seed tracks from quantum_track_data.json
do $$
declare
  v_track_btech uuid; v_track_quantum uuid; v_track_cyber uuid;
begin
  insert into public.pmu_tracks (slug, title, description, status, display_order, badge)
  values ('btech-cse-aiml', 'B.Tech CSE AI/ML', 'University-aligned engineering curriculum covering Semester 1 through graduation with AI-augmented exam preparation, notes, and coding labs.', 'published', 1, 'Active Semester 1')
  on conflict (slug) do nothing;

  insert into public.pmu_tracks (slug, title, description, status, display_order, badge)
  values ('quantum-computing', 'Quantum Computing', 'From Hilbert spaces and Bloch spheres to quantum algorithms and Qiskit circuit compilation. Master next-generation computational physics.', 'published', 2, 'Phase Q1 Live')
  on conflict (slug) do nothing;

  insert into public.pmu_tracks (slug, title, description, status, display_order, badge)
  values ('cybersecurity', 'CyberSecurity', 'Defensive security engineering, cryptographic protocols, cloud penetration testing, and security operations fundamentals.', 'draft', 3, 'Coming Soon')
  on conflict (slug) do nothing;
end $$;

-- Seed quantum courses from quantum_track_data.json
do $$
declare
  v_course_quantum uuid;
begin
  insert into public.pmu_courses (slug, title, description, level, language, format, status, is_free_preview)
  values ('quantum-computing-foundations', 'Quantum Computing Foundations', 'From Qubits and Superposition to Qiskit Circuit Simulation & Grover Search', 'beginner', 'English', 'hybrid', 'published', true)
  on conflict (slug) do nothing;

  select id into v_course_quantum from public.pmu_courses where slug = 'quantum-computing-foundations';

  insert into public.pmu_course_modules (course_id, module_number, title, description, is_published)
  values
    (v_course_quantum, 1, 'Quantum Computing Essentials', 'Foundational principles: classical bits versus quantum bits, linear algebraic statevectors, Born rule measurements, and 3D Bloch sphere projections.', true),
    (v_course_quantum, 2, 'Quantum Gates and Circuits', 'Unitary transformations in Hilbert space: Pauli X, Y, Z gates, Hadamard transformation, phase S and T gates, and multi-qubit CNOT architectures.', true),
    (v_course_quantum, 3, 'Entanglement and Correlation', 'Composite systems, Kronecker tensor products, Bell state synthesis, GHZ states, EPR non-local correlations, and quantum teleportation foundations.', true),
    (v_course_quantum, 4, 'Quantum Algorithms', 'Quantum computational speedups: Deutsch-Jozsa oracle problem, Grover amplitude amplification search, Quantum Phase Estimation (QPE), and Shor overview.', true),
    (v_course_quantum, 5, 'Quantum Programming with Qiskit', 'Translating quantum circuits to production code: QuantumCircuit API, StatevectorSampler, AerSimulator, noisy backend simulation, and execution diagnostics.', true)
  on conflict (course_id, module_number) do nothing;
end $$;

-- Seed CyberSecurity labs as draft (not visible to students under RLS)
do $$
declare
  v_lab_crypto uuid; v_lab_network uuid;
begin
  insert into public.pmu_cyber_labs (slug, title, description, status, is_sample)
  values ('crypto-fundamentals', 'Cryptography Fundamentals', 'Defensive cryptography: ciphers, hashes, PKI, and key exchange protocols.', 'draft', true)
  on conflict (slug) do nothing;

  insert into public.pmu_cyber_labs (slug, title, description, status, is_sample)
  values ('network-security', 'Network Security', 'Cloud security groups, VPC design, intrusion detection, and traffic analysis.', 'draft', true)
  on conflict (slug) do nothing;
end $$;

-- Seed CyberSecurity incident cases (empty, admin-managed)
do $$
begin
  insert into public.pmu_cyber_incident_cases (title, description, severity)
  values ('Sample incident', 'A sample incident case for the incident management system', 'medium')
  on conflict do nothing;
end $$;

-- ============================================================================
-- 9. DEFAULT SETTINGS & HELPER FUNCTIONS
-- ============================================================================

-- Helper: check if user has active course enrollment
create or replace function public.pmu_has_course_access(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.pmu_course_enrollments
    where course_id = p_course_id
      and user_id = auth.uid()
      and status = 'active'
      and expires_at > now()
  ) or public.pmu_is_admin();
$$;

-- Helper: check if user has active quantum course access
create or replace function public.pmu_has_quantum_access(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.pmu_course_enrollments
    where course_id = p_course_id
      and user_id = auth.uid()
  ) or public.pmu_is_admin();
$$;

-- Helper: check if user has active mentorship pack
create or replace function public.pmu_has_mentorship_access(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.pmu_mentorship_packs
    where user_id = p_user_id
      and status = 'active'
      and consumed_sessions < total_sessions
  ) or public.pmu_is_admin();
$$;

-- ============================================================================
-- MIGRATION END
-- ============================================================================
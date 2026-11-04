-- ============================================================================
-- PrepMeUp AI — Phase Q3: Quantum Commercial Enrollment, Razorpay & Mentorship Entitlements
-- Tables, constraints, unique indexes, and separate RLS policies.
-- Prefixed with `pmu_`.
-- ============================================================================

-- Ensure uuid-ossp extension
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. Course Enrollments Table
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_course_enrollments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.pmu_profiles (id) on delete cascade,
  course_id     uuid not null references public.pmu_courses (id) on delete cascade,
  track_id      uuid references public.pmu_tracks (id) on delete set null,
  access_type   text not null default 'free_preview'
                check (access_type in ('free_preview', 'semester_pass', 'mentorship_pack', 'admin_granted')),
  status        text not null default 'active'
                check (status in ('active', 'expired', 'cancelled', 'revoked')),
  starts_at     timestamptz not null default now(),
  expires_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Unique constraint: user has only one active Semester Pass per course
create unique index if not exists idx_pmu_one_active_semester_pass
  on public.pmu_course_enrollments (user_id, course_id)
  where status = 'active' and access_type = 'semester_pass';

create index if not exists idx_pmu_enrollments_user_course_status
  on public.pmu_course_enrollments (user_id, course_id, status);

-- ----------------------------------------------------------------------------
-- 2. Quantum Orders Table
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_quantum_orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.pmu_profiles (id) on delete cascade,
  course_id         uuid not null references public.pmu_courses (id) on delete cascade,
  product_type      text not null
                    check (product_type in ('semester_pass', 'mentorship_pack')),
  razorpay_order_id text unique not null,
  amount_in_paise   int not null,
  currency          text not null default 'INR',
  status            text not null default 'created'
                    check (status in ('created', 'pending', 'paid', 'failed', 'expired', 'refunded')),
  metadata          jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_pmu_quantum_orders_user_status
  on public.pmu_quantum_orders (user_id, status);

-- ----------------------------------------------------------------------------
-- 3. Quantum Payments Table
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_quantum_payments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references public.pmu_quantum_orders (id) on delete cascade,
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  razorpay_payment_id text unique not null,
  razorpay_signature  text,
  amount_in_paise     int not null,
  currency            text not null default 'INR',
  status              text not null default 'created'
                      check (status in ('created', 'authorized', 'captured', 'failed', 'refunded')),
  verification_status text not null default 'pending'
                      check (verification_status in ('pending', 'verified', 'failed')),
  webhook_status      text not null default 'pending'
                      check (webhook_status in ('pending', 'received', 'processed', 'failed')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_pmu_quantum_payments_order_user
  on public.pmu_quantum_payments (order_id, user_id);

-- ----------------------------------------------------------------------------
-- 4. Mentorship Packs Table
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_mentorship_packs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.pmu_profiles (id) on delete cascade,
  course_id      uuid not null references public.pmu_courses (id) on delete cascade,
  pack_type      text not null default 'single_session',
  total_sessions int not null default 1,
  used_sessions  int not null default 0,
  status         text not null default 'active'
                 check (status in ('active', 'exhausted', 'expired', 'revoked')),
  expires_at     timestamptz not null,
  created_at     timestamptz not null default now()
);

create index if not exists idx_pmu_mentorship_packs_user_status
  on public.pmu_mentorship_packs (user_id, status);

-- ----------------------------------------------------------------------------
-- 5. Quantum Early Adopter Redemptions Table
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_quantum_early_adopter_redemptions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.pmu_profiles (id) on delete cascade,
  course_id         uuid not null references public.pmu_courses (id) on delete cascade,
  redemption_number int not null,
  status            text not null default 'claimed'
                    check (status in ('claimed', 'revoked')),
  created_at        timestamptz not null default now()
);

-- Unique constraint: one redemption per user per course
create unique index if not exists idx_pmu_early_adopter_user_course
  on public.pmu_quantum_early_adopter_redemptions (user_id, course_id);

create index if not exists idx_pmu_early_adopter_course_status
  on public.pmu_quantum_early_adopter_redemptions (course_id, status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Separate policies for SELECT, INSERT, UPDATE, DELETE on each table
-- ============================================================================

-- 1. Enable RLS
alter table public.pmu_course_enrollments enable row level security;
alter table public.pmu_quantum_orders enable row level security;
alter table public.pmu_quantum_payments enable row level security;
alter table public.pmu_mentorship_packs enable row level security;
alter table public.pmu_quantum_early_adopter_redemptions enable row level security;

-- 2. pmu_course_enrollments policies
create policy "pmu_enrollments_select" on public.pmu_course_enrollments
  for select using (
    user_id = auth.uid() or
    public.pmu_is_admin() or
    exists (
      select 1 from public.pmu_courses c
      where c.id = course_id and c.instructor_id = auth.uid()
    )
  );

create policy "pmu_enrollments_insert" on public.pmu_course_enrollments
  for insert with check (public.pmu_is_admin());

create policy "pmu_enrollments_update" on public.pmu_course_enrollments
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());

create policy "pmu_enrollments_delete" on public.pmu_course_enrollments
  for delete using (public.pmu_is_admin());

-- 3. pmu_quantum_orders policies
create policy "pmu_quantum_orders_select" on public.pmu_quantum_orders
  for select using (user_id = auth.uid() or public.pmu_is_admin());

create policy "pmu_quantum_orders_insert" on public.pmu_quantum_orders
  for insert with check (user_id = auth.uid() or public.pmu_is_admin());

create policy "pmu_quantum_orders_update" on public.pmu_quantum_orders
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());

create policy "pmu_quantum_orders_delete" on public.pmu_quantum_orders
  for delete using (public.pmu_is_admin());

-- 4. pmu_quantum_payments policies
-- Instructors CANNOT access financial data
create policy "pmu_quantum_payments_select" on public.pmu_quantum_payments
  for select using (user_id = auth.uid() or public.pmu_is_admin());

create policy "pmu_quantum_payments_insert" on public.pmu_quantum_payments
  for insert with check (public.pmu_is_admin());

create policy "pmu_quantum_payments_update" on public.pmu_quantum_payments
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());

create policy "pmu_quantum_payments_delete" on public.pmu_quantum_payments
  for delete using (public.pmu_is_admin());

-- 5. pmu_mentorship_packs policies
create policy "pmu_mentorship_packs_select" on public.pmu_mentorship_packs
  for select using (user_id = auth.uid() or public.pmu_is_admin());

create policy "pmu_mentorship_packs_insert" on public.pmu_mentorship_packs
  for insert with check (public.pmu_is_admin());

create policy "pmu_mentorship_packs_update" on public.pmu_mentorship_packs
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());

create policy "pmu_mentorship_packs_delete" on public.pmu_mentorship_packs
  for delete using (public.pmu_is_admin());

-- 6. pmu_quantum_early_adopter_redemptions policies
create policy "pmu_early_adopter_select" on public.pmu_quantum_early_adopter_redemptions
  for select using (user_id = auth.uid() or public.pmu_is_admin());

create policy "pmu_early_adopter_insert" on public.pmu_quantum_early_adopter_redemptions
  for insert with check (public.pmu_is_admin());

create policy "pmu_early_adopter_update" on public.pmu_quantum_early_adopter_redemptions
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());

create policy "pmu_early_adopter_delete" on public.pmu_quantum_early_adopter_redemptions
  for delete using (public.pmu_is_admin());

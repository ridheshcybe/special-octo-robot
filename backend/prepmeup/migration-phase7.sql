-- ============================================================================
-- PrepMeUp AI — Phase 7 Database Migration: Razorpay Payments & Free Redemptions
-- Safe, additive migration:
--  1. Verify and align `pmu_subscriptions`, `pmu_payments`, `pmu_free_access_redemptions`
--  2. Atomic redemption check function for the first 10 students (100% off)
--  3. Strict Row-Level Security
-- ============================================================================

-- 1. Ensure `pmu_subscriptions` columns
alter table public.pmu_subscriptions
  add column if not exists student_id uuid references public.pmu_profiles (id) on delete cascade;

update public.pmu_subscriptions
set student_id = user_id
where student_id is null and user_id is not null;

-- 2. Ensure `pmu_payments` columns
alter table public.pmu_payments
  add column if not exists student_id uuid references public.pmu_profiles (id) on delete cascade;

update public.pmu_payments
set student_id = user_id
where student_id is null and user_id is not null;

-- 3. Atomic Function: Claim Free Adopter Access (Strict limit = 10 students)
create or replace function public.pmu_claim_free_adopter_seat(
  p_student_id uuid,
  p_semester_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_claimed_count int;
  v_already_claimed boolean;
  v_redemption_id uuid;
begin
  -- 1. Check if user already claimed free seat
  select exists (
    select 1 from public.pmu_free_access_redemptions
    where user_id = p_student_id and semester_id = p_semester_id and status = 'claimed'
  ) into v_already_claimed;

  if v_already_claimed then
    return jsonb_build_object(
      'success', true,
      'alreadyClaimed', true,
      'message', 'You have already activated your 100% free early adopter semester pass!'
    );
  end if;

  -- 2. Count existing claimed seats with lock
  select count(*) into v_claimed_count
  from public.pmu_free_access_redemptions
  where semester_id = p_semester_id and status = 'claimed'
  for update;

  if v_claimed_count >= 10 then
    return jsonb_build_object(
      'success', false,
      'code', 'SEATS_EXHAUSTED',
      'message', 'All 10 early adopter 100% off seats have been claimed. Semester pass is available at ₹99.'
    );
  end if;

  -- 3. Insert Redemption record
  insert into public.pmu_free_access_redemptions (
    user_id,
    semester_id,
    redemption_number,
    status
  ) values (
    p_student_id,
    p_semester_id,
    v_claimed_count + 1,
    'claimed'
  ) returning id into v_redemption_id;

  -- 4. Provision active semester subscription
  insert into public.pmu_subscriptions (
    user_id,
    student_id,
    semester_id,
    status,
    access_type,
    starts_at,
    expires_at
  ) values (
    p_student_id,
    p_student_id,
    p_semester_id,
    'active',
    'free_early_adopter',
    now(),
    now() + interval '180 days'
  )
  on conflict do nothing;

  return jsonb_build_object(
    'success', true,
    'claimedSeatNumber', v_claimed_count + 1,
    'remainingSeats', 9 - v_claimed_count,
    'message', 'Congratulations! 100% off early adopter pass claimed successfully. All notes, PYQs, and simulations unlocked.'
  );
end;
$$;

-- RLS Updates
alter table public.pmu_subscriptions enable row level security;
alter table public.pmu_payments enable row level security;
alter table public.pmu_free_access_redemptions enable row level security;

-- Student Select Policies
drop policy if exists "pmu_subscriptions_student_select" on public.pmu_subscriptions;
create policy "pmu_subscriptions_student_select" on public.pmu_subscriptions
  for select using (auth.uid() = student_id or auth.uid() = user_id or public.pmu_is_admin());

drop policy if exists "pmu_payments_student_select" on public.pmu_payments;
create policy "pmu_payments_student_select" on public.pmu_payments
  for select using (auth.uid() = student_id or auth.uid() = user_id or public.pmu_is_admin());

drop policy if exists "pmu_free_redemptions_student_select" on public.pmu_free_access_redemptions;
create policy "pmu_free_redemptions_student_select" on public.pmu_free_access_redemptions
  for select using (auth.uid() = user_id or public.pmu_is_admin());

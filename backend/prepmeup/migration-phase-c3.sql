-- ============================================================================
-- PrepMeUp AI — Phase C3: Unified Pricing, All-Access Pass, Central Checkout,
-- Entitlement Management & Admin Revenue
--
-- Additive only. Does not alter the legacy `/courses` portfolio billing flow,
-- the Quantum (Phase Q3) or CyberSecurity (Phase C2) order/payment tables.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Extensions / helpers (idempotent)
-- ----------------------------------------------------------------------------
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Products
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_products (
  id                        uuid primary key default gen_random_uuid(),
  slug                      text unique not null,
  name                      text not null,
  description               text not null default '',
  product_type              text not null
                            check (product_type in ('semester_pass', 'mentorship_pack', 'all_access_pass')),
  track_id                  uuid references public.pmu_tracks (id) on delete set null,
  course_ids                uuid[],
  price_in_paise            int not null check (price_in_paise >= 0),
  currency                  text not null default 'INR',
  duration_days             int not null check (duration_days > 0),
  is_active                 boolean not null default true,
  is_early_adopter_eligible boolean not null default false,
  early_adopter_limit       int check (early_adopter_limit is null or early_adopter_limit > 0),
  features                  jsonb not null default '[]'::jsonb,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index if not exists idx_pmu_products_type_active
  on public.pmu_products (product_type, is_active);

create index if not exists idx_pmu_products_slug_active
  on public.pmu_products (slug, is_active);

-- ----------------------------------------------------------------------------
-- 2. Unified orders
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_unified_orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.pmu_profiles (id) on delete cascade,
  product_id        uuid not null references public.pmu_products (id) on delete restrict,
  razorpay_order_id text unique not null,
  amount_in_paise   int not null check (amount_in_paise >= 0),
  currency          text not null default 'INR',
  status            text not null default 'created'
                    check (status in ('created', 'pending', 'paid', 'failed', 'expired', 'refunded')),
  metadata          jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_pmu_unified_orders_user_status
  on public.pmu_unified_orders (user_id, status);

create index if not exists idx_pmu_unified_orders_status_created
  on public.pmu_unified_orders (status, created_at desc);

-- ----------------------------------------------------------------------------
-- 3. Unified payments
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_unified_payments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references public.pmu_unified_orders (id) on delete cascade,
  user_id             uuid not null references public.pmu_profiles (id) on delete cascade,
  razorpay_payment_id text unique not null,
  razorpay_signature  text,
  amount_in_paise     int not null check (amount_in_paise >= 0),
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

create index if not exists idx_pmu_unified_payments_order
  on public.pmu_unified_payments (order_id);

create index if not exists idx_pmu_unified_payments_user_created
  on public.pmu_unified_payments (user_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 4. All-access / course entitlements
--
-- `metadata` carries mentorship session accounting
-- ({ "sessionsTotal": 1, "sessionsUsed": 0 }) so a single entitlement table
-- covers both course access and mentorship credits.
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_all_access_entitlements (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.pmu_profiles (id) on delete cascade,
  product_id         uuid not null references public.pmu_products (id) on delete restrict,
  included_track_ids uuid[] not null default '{}'::uuid[],
  included_course_ids uuid[] not null default '{}'::uuid[],
  starts_at          timestamptz not null default now(),
  expires_at         timestamptz not null,
  status             text not null default 'active'
                     check (status in ('active', 'expired', 'cancelled', 'revoked')),
  metadata           jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_pmu_entitlements_user_status
  on public.pmu_all_access_entitlements (user_id, status);

create index if not exists idx_pmu_entitlements_expiry
  on public.pmu_all_access_entitlements (expires_at);

create index if not exists idx_pmu_entitlements_status_expiry
  on public.pmu_all_access_entitlements (status, expires_at);

-- ----------------------------------------------------------------------------
-- 5. All-access early-adopter redemptions
-- ----------------------------------------------------------------------------
create table if not exists public.pmu_all_access_early_adopter_redemptions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.pmu_profiles (id) on delete cascade,
  product_id        uuid not null references public.pmu_products (id) on delete cascade,
  redemption_number int not null check (redemption_number > 0),
  status            text not null default 'claimed'
                    check (status in ('claimed', 'revoked')),
  created_at        timestamptz not null default now()
);

-- One early-adopter redemption per user per All-Access product.
create unique index if not exists idx_pmu_all_access_ea_user_product
  on public.pmu_all_access_early_adopter_redemptions (user_id, product_id);

create index if not exists idx_pmu_all_access_ea_product_status
  on public.pmu_all_access_early_adopter_redemptions (product_id, status);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.pmu_products enable row level security;
alter table public.pmu_unified_orders enable row level security;
alter table public.pmu_unified_payments enable row level security;
alter table public.pmu_all_access_entitlements enable row level security;
alter table public.pmu_all_access_early_adopter_redemptions enable row level security;

-- ---------------------------------------------------------------- products
-- Anyone (anon + authenticated) may read active products & pricing.
drop policy if exists "pmu_products_select" on public.pmu_products;
create policy "pmu_products_select" on public.pmu_products
  for select using (is_active = true or public.pmu_is_admin());

drop policy if exists "pmu_products_insert" on public.pmu_products;
create policy "pmu_products_insert" on public.pmu_products
  for insert with check (public.pmu_is_admin());

drop policy if exists "pmu_products_update" on public.pmu_products;
create policy "pmu_products_update" on public.pmu_products
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());

drop policy if exists "pmu_products_delete" on public.pmu_products;
create policy "pmu_products_delete" on public.pmu_products
  for delete using (public.pmu_is_admin());

-- ------------------------------------------------------------------ orders
-- Students read only their own orders. Writes are service-role / admin only.
drop policy if exists "pmu_unified_orders_select" on public.pmu_unified_orders;
create policy "pmu_unified_orders_select" on public.pmu_unified_orders
  for select using (user_id = auth.uid() or public.pmu_is_admin());

drop policy if exists "pmu_unified_orders_insert" on public.pmu_unified_orders;
create policy "pmu_unified_orders_insert" on public.pmu_unified_orders
  for insert with check (public.pmu_is_admin());

drop policy if exists "pmu_unified_orders_update" on public.pmu_unified_orders;
create policy "pmu_unified_orders_update" on public.pmu_unified_orders
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());

drop policy if exists "pmu_unified_orders_delete" on public.pmu_unified_orders;
create policy "pmu_unified_orders_delete" on public.pmu_unified_orders
  for delete using (public.pmu_is_admin());

-- ---------------------------------------------------------------- payments
-- Students read only their own payments and can never write them.
drop policy if exists "pmu_unified_payments_select" on public.pmu_unified_payments;
create policy "pmu_unified_payments_select" on public.pmu_unified_payments
  for select using (user_id = auth.uid() or public.pmu_is_admin());

drop policy if exists "pmu_unified_payments_insert" on public.pmu_unified_payments;
create policy "pmu_unified_payments_insert" on public.pmu_unified_payments
  for insert with check (public.pmu_is_admin());

drop policy if exists "pmu_unified_payments_update" on public.pmu_unified_payments;
create policy "pmu_unified_payments_update" on public.pmu_unified_payments
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());

drop policy if exists "pmu_unified_payments_delete" on public.pmu_unified_payments;
create policy "pmu_unified_payments_delete" on public.pmu_unified_payments
  for delete using (public.pmu_is_admin());

-- ------------------------------------------------------------- entitlements
-- Students read only their own entitlements. Instructors can see enrollment
-- status for students in their own courses (no price / payment data here).
drop policy if exists "pmu_entitlements_select" on public.pmu_all_access_entitlements;
create policy "pmu_entitlements_select" on public.pmu_all_access_entitlements
  for select using (
    user_id = auth.uid()
    or public.pmu_is_admin()
    or exists (
      select 1 from public.pmu_courses c
      where c.id = any (included_course_ids)
        and c.instructor_id = auth.uid()
    )
  );

drop policy if exists "pmu_entitlements_insert" on public.pmu_all_access_entitlements;
create policy "pmu_entitlements_insert" on public.pmu_all_access_entitlements
  for insert with check (public.pmu_is_admin());

drop policy if exists "pmu_entitlements_update" on public.pmu_all_access_entitlements;
create policy "pmu_entitlements_update" on public.pmu_all_access_entitlements
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());

drop policy if exists "pmu_entitlements_delete" on public.pmu_all_access_entitlements;
create policy "pmu_entitlements_delete" on public.pmu_all_access_entitlements
  for delete using (public.pmu_is_admin());

-- ------------------------------------------------------ early-adopter claims
-- Students can read their own claim; only the atomic RPC / service role writes.
drop policy if exists "pmu_all_access_ea_select" on public.pmu_all_access_early_adopter_redemptions;
create policy "pmu_all_access_ea_select" on public.pmu_all_access_early_adopter_redemptions
  for select using (user_id = auth.uid() or public.pmu_is_admin());

drop policy if exists "pmu_all_access_ea_insert" on public.pmu_all_access_early_adopter_redemptions;
create policy "pmu_all_access_ea_insert" on public.pmu_all_access_early_adopter_redemptions
  for insert with check (public.pmu_is_admin());

drop policy if exists "pmu_all_access_ea_update" on public.pmu_all_access_early_adopter_redemptions;
create policy "pmu_all_access_ea_update" on public.pmu_all_access_early_adopter_redemptions
  for update using (public.pmu_is_admin()) with check (public.pmu_is_admin());

drop policy if exists "pmu_all_access_ea_delete" on public.pmu_all_access_early_adopter_redemptions;
create policy "pmu_all_access_ea_delete" on public.pmu_all_access_early_adopter_redemptions
  for delete using (public.pmu_is_admin());

-- ============================================================================
-- ATOMIC EARLY-ADOPTER CLAIM
--
-- Serialised per product with a transaction-scoped advisory lock, so two
-- concurrent requests can never both take the last seat. Called only from the
-- server with the service-role key.
-- ============================================================================
create or replace function public.pmu_claim_all_access_early_adopter(
  p_user_id    uuid,
  p_product_id uuid,
  p_limit      int default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product      public.pmu_products%rowtype;
  v_limit        int;
  v_existing     public.pmu_all_access_early_adopter_redemptions%rowtype;
  v_claimed      int;
  v_next_number  int;
  v_redemption   public.pmu_all_access_early_adopter_redemptions%rowtype;
begin
  if p_user_id is null or p_product_id is null then
    return jsonb_build_object('success', false, 'error', 'USER_OR_PRODUCT_MISSING');
  end if;

  -- Serialise all claims for this product.
  perform pg_advisory_xact_lock(hashtextextended('pmu_all_access_early_adopter:' || p_product_id::text, 0));

  select * into v_product
  from public.pmu_products
  where id = p_product_id and is_active = true;

  if not found then
    return jsonb_build_object('success', false, 'error', 'PRODUCT_NOT_FOUND');
  end if;

  if v_product.product_type <> 'all_access_pass' or v_product.is_early_adopter_eligible is not true then
    return jsonb_build_object('success', false, 'error', 'NOT_EARLY_ADOPTER_ELIGIBLE');
  end if;

  select * into v_existing
  from public.pmu_all_access_early_adopter_redemptions
  where user_id = p_user_id
    and product_id = p_product_id
    and status = 'claimed';

  if found then
    return jsonb_build_object(
      'success', true,
      'alreadyClaimed', true,
      'exhausted', false,
      'redemptionNumber', v_existing.redemption_number
    );
  end if;

  v_limit := coalesce(p_limit, v_product.early_adopter_limit, 10);
  if v_limit <= 0 then
    return jsonb_build_object('success', false, 'exhausted', true, 'error', 'SEATS_EXHAUSTED');
  end if;

  select count(*) into v_claimed
  from public.pmu_all_access_early_adopter_redemptions
  where product_id = p_product_id and status = 'claimed';

  if v_claimed >= v_limit then
    return jsonb_build_object('success', false, 'exhausted', true, 'error', 'SEATS_EXHAUSTED');
  end if;

  select coalesce(max(redemption_number), 0) + 1 into v_next_number
  from public.pmu_all_access_early_adopter_redemptions
  where product_id = p_product_id;

  insert into public.pmu_all_access_early_adopter_redemptions
    (user_id, product_id, redemption_number, status)
  values
    (p_user_id, p_product_id, v_next_number, 'claimed')
  returning * into v_redemption;

  return jsonb_build_object(
    'success', true,
    'alreadyClaimed', false,
    'exhausted', false,
    'redemptionNumber', v_redemption.redemption_number,
    'redemptionId', v_redemption.id
  );
exception
  when unique_violation then
    -- Concurrent double-claim: the unique (user_id, product_id) index wins.
    select * into v_existing
    from public.pmu_all_access_early_adopter_redemptions
    where user_id = p_user_id and product_id = p_product_id;

    return jsonb_build_object(
      'success', true,
      'alreadyClaimed', true,
      'exhausted', false,
      'redemptionNumber', v_existing.redemption_number
    );
end;
$$;

revoke all on function public.pmu_claim_all_access_early_adopter(uuid, uuid, int) from public;
grant execute on function public.pmu_claim_all_access_early_adopter(uuid, uuid, int) to service_role;

-- ============================================================================
-- SEED: UNIFIED PRODUCT CATALOG
--
-- Prices mirror the server defaults; the application reads live prices from
-- environment variables, so these rows are the durable catalog/reporting copy.
-- CyberSecurity has no seeded pmu_tracks row (Phase C2 shipped without SQL),
-- so its track_id stays null and its course id lives in course_ids.
-- ============================================================================
insert into public.pmu_products
  (id, slug, name, description, product_type, track_id, course_ids,
   price_in_paise, currency, duration_days, is_active,
   is_early_adopter_eligible, early_adopter_limit, features)
values
  (
    'a0000000-0000-4000-8000-000000000001',
    'btech-semester-pass',
    'B.Tech CSE AI/ML Semester Pass',
    'Full access to B.Tech CSE AI/ML Semester 1 content for one semester.',
    'semester_pass',
    '11111111-2222-3333-4444-555555550001',
    array['c1111111-1111-4111-8111-111111111111']::uuid[],
    9900, 'INR', 180, true, false, null,
    '["All Semester 1 subjects","Module notes & PYQs","Quizzes and progress tracking"]'::jsonb
  ),
  (
    'a0000000-0000-4000-8000-000000000002',
    'quantum-semester-pass',
    'Quantum Semester Pass',
    'Six months of full Quantum Computing Foundations access with one included 1-on-1 session.',
    'semester_pass',
    '11111111-2222-3333-4444-555555550002',
    array['c0000000-0000-0000-0000-000000000001']::uuid[],
    99900, 'INR', 180, true, false, null,
    '["All 20 Quantum lessons","All interactive simulators & quizzes","1 included 1-on-1 mentorship session","Certificate eligibility"]'::jsonb
  ),
  (
    'a0000000-0000-4000-8000-000000000003',
    'cybersecurity-semester-pass',
    'CyberSecurity Semester Pass',
    'Six months of full CyberSecurity Foundations access with one included 1-on-1 session.',
    'semester_pass',
    null,
    array['c2222222-2222-4222-8222-222222222222']::uuid[],
    99900, 'INR', 180, true, false, null,
    '["All CyberSecurity modules & labs","CTF challenges & final assessment","1 included 1-on-1 mentorship session","Certificate eligibility"]'::jsonb
  ),
  (
    'a0000000-0000-4000-8000-000000000004',
    'prepmeup-all-access-pass',
    'PrepMeUp All-Access Semester Pass',
    'One pass for B.Tech CSE AI/ML Semester 1, Quantum Computing Foundations and CyberSecurity Foundations.',
    'all_access_pass',
    null,
    array[
      'c1111111-1111-4111-8111-111111111111',
      'c0000000-0000-0000-0000-000000000001',
      'c2222222-2222-4222-8222-222222222222'
    ]::uuid[],
    149900, 'INR', 180, true, true, 10,
    '["All three included tracks","Certificates for each track","1 included 1-on-1 mentorship session","First 10 buyers get 100% off"]'::jsonb
  ),
  (
    'a0000000-0000-4000-8000-000000000005',
    'quantum-mentorship-pack',
    'Quantum Mentorship Pack',
    'One private 45-minute 1-on-1 session with Quantum faculty.',
    'mentorship_pack',
    '11111111-2222-3333-4444-555555550002',
    array['c0000000-0000-0000-0000-000000000001']::uuid[],
    49900, 'INR', 90, true, false, null,
    '["One 45-minute 1-on-1 session","Session credit valid for 90 days","Credit refunded if cancelled before completion"]'::jsonb
  ),
  (
    'a0000000-0000-4000-8000-000000000006',
    'cybersecurity-mentorship-pack',
    'CyberSecurity Mentorship Pack',
    'One private 45-minute 1-on-1 session with CyberSecurity faculty.',
    'mentorship_pack',
    null,
    array['c2222222-2222-4222-8222-222222222222']::uuid[],
    49900, 'INR', 90, true, false, null,
    '["One 45-minute 1-on-1 session","Session credit valid for 90 days","Credit refunded if cancelled before completion"]'::jsonb
  ),
  (
    'a0000000-0000-4000-8000-000000000007',
    'all-access-mentorship-pack',
    'All-Access Mentorship Pack',
    'One private 45-minute session, bookable for any included PrepMeUp track.',
    'mentorship_pack',
    null,
    array[
      'c1111111-1111-4111-8111-111111111111',
      'c0000000-0000-0000-0000-000000000001',
      'c2222222-2222-4222-8222-222222222222'
    ]::uuid[],
    89900, 'INR', 90, true, false, null,
    '["One 45-minute 1-on-1 session","Bookable for any included track","Session credit valid for 90 days"]'::jsonb
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  product_type = excluded.product_type,
  track_id = excluded.track_id,
  course_ids = excluded.course_ids,
  price_in_paise = excluded.price_in_paise,
  currency = excluded.currency,
  duration_days = excluded.duration_days,
  is_active = excluded.is_active,
  is_early_adopter_eligible = excluded.is_early_adopter_eligible,
  early_adopter_limit = excluded.early_adopter_limit,
  features = excluded.features,
  updated_at = now();

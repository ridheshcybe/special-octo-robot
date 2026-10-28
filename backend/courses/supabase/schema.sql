-- ============================================================================
-- Courses platform (free-tier edition) — Phase 1 schema
-- Run this whole file in: Supabase Dashboard → SQL Editor → New query.
--
-- Free-tier design notes:
--   • Rows are small; no JSON blobs; indexes only where queried.
--   • Video is an unlisted YouTube embed — nothing stored here.
--   • PDFs are capped at 10 MB in the app; bucket is private.
--   • Secrets (youtube_id, meeting_url) live in lesson_secrets, never in the
--     lessons row that non-subscribers can read.
--
-- Access rule: a user has access iff profiles.access_expires_at > now().
-- Buying while active extends from the current expiry (see grant_access()).
-- ============================================================================

-- ----------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  full_name         text not null default '',
  role              text not null default 'student'
                      check (role in ('student', 'admin')),
  access_expires_at timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Creates a profile row for every new signup (email + Google both land here).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'email',
      ''
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------ courses
create table if not exists public.courses (
  id             bigint generated always as identity primary key,
  title          text not null,
  slug           text not null unique,
  description    text not null default '',
  thumbnail_url  text,
  published      boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ------------------------------------------------------------------ lessons
-- NOTE: no youtube_id / meeting_url here on purpose. Those live in
-- lesson_secrets so a non-subscriber can never read them via the normal API.
create table if not exists public.lessons (
  id              bigint generated always as identity primary key,
  course_id       bigint not null references public.courses (id) on delete cascade,
  title           text not null,
  type            text not null check (type in ('pdf', 'video', 'live')),
  position        int not null default 0,
  storage_path    text,           -- PDF path in the course-files bucket
  duration_label  text,           -- optional "12 min" display for video/live
  is_free_preview boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists lessons_course_idx on public.lessons (course_id, position);

-- ----------------------------------------------------------- lesson_secrets
-- One row per video/live lesson. SECURITY: readable ONLY by admins via RLS.
-- Students must NEVER read this table directly — per-type gating (video id,
-- meeting URL only inside the join window, recordings, HLS paths) happens in
-- the edge functions (get-video / get-lesson-secret / get-live-link /
-- get-hls-url), which read it with the service role AFTER their own checks.
-- A policy like "has_access() can read" would let any subscriber dump every
-- meeting_url and recording via the plain REST API, bypassing all windows.
create table if not exists public.lesson_secrets (
  lesson_id   bigint primary key references public.lessons (id) on delete cascade,
  youtube_id  text,   -- unlisted YouTube video id (embed)
  meeting_url text,   -- gated live-session meeting link
  starts_at   timestamptz,
  updated_at  timestamptz not null default now()
);

-- -------------------------------------------------------------------- plans
create table if not exists public.plans (
  id            bigint generated always as identity primary key,
  name          text not null,
  price_inr     int not null check (price_inr between 1 and 100000),
  duration_days int not null check (duration_days between 1 and 3650),
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------- payments
create table if not exists public.payments (
  id                  bigint generated always as identity primary key,
  user_id             uuid not null references public.profiles (id) on delete cascade,
  plan_id             bigint references public.plans (id) on delete set null,
  razorpay_order_id   text not null unique,
  razorpay_payment_id text,
  amount              int not null,  -- paise
  status              text not null default 'created'
                        check (status in ('created', 'paid', 'failed')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists payments_user_idx on public.payments (user_id, created_at desc);

-- ======================================================================= RLS
alter table public.profiles       enable row level security;
alter table public.courses        enable row level security;
alter table public.lessons        enable row level security;
alter table public.lesson_secrets enable row level security;
alter table public.plans          enable row level security;
alter table public.payments       enable row level security;

-- helper: is the caller an admin? (also usable in edge functions via JWT)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- helper: does the caller have active access?
create or replace function public.has_access()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and access_expires_at > now()
  );
$$;

-- helper: student update guard (name only; role/expiry immutable by students).
-- security definer so the self-select cannot recurse through the policy.
create or replace function public.profile_update_allowed(
  p_id uuid,
  p_role text,
  p_expiry timestamptz
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_id = auth.uid()
    and p_role = (select role from public.profiles where id = auth.uid())
    and p_expiry is not distinct from
        (select access_expires_at from public.profiles where id = auth.uid());
$$;

-- profiles: read own (admins read all); update own name only.
drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (id = auth.uid())
  with check (public.profile_update_allowed(id, role, access_expires_at));

-- courses: everyone reads published; admin writes.
drop policy if exists "courses read" on public.courses;
create policy "courses read" on public.courses
  for select using (published or public.is_admin());

drop policy if exists "courses write" on public.courses;
create policy "courses write" on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

-- lessons: metadata readable for published courses; the SECRET parts of a
-- lesson (youtube id / meeting link) are in lesson_secrets, not here.
drop policy if exists "lessons read" on public.lessons;
create policy "lessons read" on public.lessons
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and c.published
    )
  );

drop policy if exists "lessons write" on public.lessons;
create policy "lessons write" on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());

-- lesson_secrets: admins only. Students get gated values exclusively through
-- the edge functions, which enforce access AND (for live sessions) the join
-- window. Never expose this table to has_access() via RLS.
drop policy if exists "lesson_secrets read" on public.lesson_secrets;
create policy "lesson_secrets read" on public.lesson_secrets
  for select using (public.is_admin());

drop policy if exists "lesson_secrets write" on public.lesson_secrets;
create policy "lesson_secrets write" on public.lesson_secrets
  for all using (public.is_admin()) with check (public.is_admin());

-- plans: active plans public; admin writes.
drop policy if exists "plans read" on public.plans;
create policy "plans read" on public.plans
  for select using (active or public.is_admin());

drop policy if exists "plans write" on public.plans;
create policy "plans write" on public.plans
  for all using (public.is_admin()) with check (public.is_admin());

-- payments: own receipts only; writes happen exclusively in edge functions
-- with the service role (never from the browser).
drop policy if exists "payments select own" on public.payments;
create policy "payments select own" on public.payments
  for select using (user_id = auth.uid() or public.is_admin());

-- ==================================================================== access
-- Called ONLY by the razorpay-webhook function (service role). Idempotent:
-- a redelivered webhook cannot extend access twice.
create or replace function public.grant_access(
  p_razorpay_order_id text,
  p_razorpay_payment_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments%rowtype;
  v_profile public.profiles%rowtype;
  v_base    timestamptz;
begin
  select * into v_payment
  from public.payments
  where razorpay_order_id = p_razorpay_order_id
  for update;

  if not found then
    raise exception 'grant_access: unknown order %', p_razorpay_order_id;
  end if;

  -- Idempotency guard: already paid → already granted.
  if v_payment.status = 'paid' then
    return;
  end if;

  select * into v_profile from public.profiles where id = v_payment.user_id for update;

  v_base := greatest(
    coalesce(v_profile.access_expires_at, to_timestamp(0)),
    now()
  );

  update public.profiles
  set access_expires_at = v_base + make_interval(days => (
    select duration_days from public.plans where id = v_payment.plan_id
  )),
  updated_at = now()
  where id = v_payment.user_id;

  update public.payments
  set status = 'paid',
      razorpay_payment_id = p_razorpay_payment_id,
      updated_at = now()
  where id = v_payment.id;
end;
$$;

-- ================================================================== storage
-- Private bucket for PDFs (10 MB cap enforced in the edge function + admin UI).
insert into storage.buckets (id, name, public)
values ('course-files', 'course-files', false)
on conflict (id) do nothing;

-- Enforce the PDF-only, 10 MB rules at the STORAGE layer, not just in the
-- admin UI (the UI check is convenience; this is the actual gate).
update storage.buckets
set file_size_limit = 10485760,                 -- 10 MB
    allowed_mime_types = array['application/pdf']
where id = 'course-files';

drop policy if exists "course-files admin write" on storage.objects;
create policy "course-files admin write" on storage.objects
  for all
  using (bucket_id = 'course-files' and public.is_admin())
  with check (bucket_id = 'course-files' and public.is_admin());

-- No read policy on purpose: students never fetch objects directly; signed
-- URLs (5 min) come from the get-pdf-url edge function after an access check.

-- ==================================================================== seed
insert into public.plans (name, price_inr, duration_days, active)
values
  ('30-day pass', 99, 30, true),
  ('90-day pass', 199, 90, true)
on conflict do nothing;

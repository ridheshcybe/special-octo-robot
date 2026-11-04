-- ============================================================================
-- PrepMeUp AI — Phase 6 Database Migration: Interactive Simulations Suite
-- Safe, additive migration:
--  1. Verify and populate `pmu_simulations` table
--  2. Strict Row-Level Security ensuring student/public read access
-- ============================================================================

create table if not exists public.pmu_simulations (
  id              uuid primary key default gen_random_uuid(),
  subject_id      uuid references public.pmu_subjects (id) on delete cascade,
  module_id       uuid references public.pmu_modules (id) on delete set null,
  topic_id        uuid references public.pmu_topics (id) on delete set null,
  slug            text unique not null,
  title           text not null,
  description     text not null default '',
  category        text not null check (category in ('bee', 'python')),
  component_key   text not null,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now()
);

alter table public.pmu_simulations enable row level security;

-- Public / Student select policy for published simulations
drop policy if exists "pmu_simulations_select" on public.pmu_simulations;
create policy "pmu_simulations_select" on public.pmu_simulations
  for select using (is_published = true or public.pmu_is_admin());

-- Admin full access
drop policy if exists "pmu_simulations_admin_all" on public.pmu_simulations;
create policy "pmu_simulations_admin_all" on public.pmu_simulations
  for all using (public.pmu_is_admin())
  with check (public.pmu_is_admin());

-- Index for category and slug lookups
create index if not exists pmu_idx_simulations_slug on public.pmu_simulations (slug);
create index if not exists pmu_idx_simulations_cat on public.pmu_simulations (category, is_published);

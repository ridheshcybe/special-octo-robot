-- ============================================================================
-- Ridhesh Walavalkar — content schema
--
-- Run this once in the Supabase SQL editor (or `supabase db push`).
-- Anyone may read published content; only the admin account may write.
-- ============================================================================

-- ----------------------------------------------------------------- site copy
create table if not exists site_settings (
  id int primary key default 1 check (id = 1),           -- singleton row
  hero_roles text[] not null default '{}',               -- Developer, Researcher, Founder
  hero_description text not null default '',
  marquee_words text[] not null default '{}',
  story_heading text not null default '',
  story_body text not null default '',
  projects_heading text not null default '',
  research_heading text not null default '',
  numbers_heading text not null default '',
  contact_heading text not null default '',
  contact_body text not null default '',
  contact_email text not null default '',
  hero_portrait_url text,
  hero_video_url text,
  github_username text not null default 'ridheshcybe',
  papers_count int not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists story_principles (
  id bigint generated always as identity primary key,
  sort_order int not null default 0,
  title text not null,
  body text not null default ''
);

create table if not exists projects (
  id bigint generated always as identity primary key,
  sort_order int not null default 0,
  published boolean not null default true,
  name text not null,
  category text not null default '',
  year_label text not null default '',          -- "2026", "Ongoing"
  outcome text not null default '',             -- "Live", "Prototype"
  blurb text not null default '',
  image_url text,
  href text
);

create table if not exists research (
  id bigint generated always as identity primary key,
  sort_order int not null default 0,
  published boolean not null default true,
  meta text not null default '',                -- "IAEME Publication — 2026"
  title text not null,
  url text not null default ''
);

create table if not exists social_links (
  id bigint generated always as identity primary key,
  sort_order int not null default 0,
  label text not null,
  url text not null default ''
);

create index if not exists projects_sort_idx on projects (sort_order);
create index if not exists research_sort_idx on research (sort_order);
create index if not exists story_principles_sort_idx on story_principles (sort_order);
create index if not exists social_links_sort_idx on social_links (sort_order);

-- --------------------------------------------------------------------- RLS
alter table site_settings    enable row level security;
alter table story_principles enable row level security;
alter table projects         enable row level security;
alter table research         enable row level security;
alter table social_links     enable row level security;

-- Public may read everything except unpublished projects / research.
drop policy if exists "public read site_settings" on site_settings;
create policy "public read site_settings" on site_settings
  for select using (true);

drop policy if exists "public read story_principles" on story_principles;
create policy "public read story_principles" on story_principles
  for select using (true);

drop policy if exists "public read social_links" on social_links;
create policy "public read social_links" on social_links
  for select using (true);

drop policy if exists "public read projects" on projects;
create policy "public read projects" on projects
  for select using (published);

drop policy if exists "public read research" on research;
create policy "public read research" on research
  for select using (published);

-- Only the admin account may write. Change the email below if the admin
-- account ever changes.
drop policy if exists "admin write site_settings" on site_settings;
create policy "admin write site_settings" on site_settings
  for all
  using ((auth.jwt() ->> 'email') = 'walavalkarridhesh@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'walavalkarridhesh@gmail.com');

drop policy if exists "admin write story_principles" on story_principles;
create policy "admin write story_principles" on story_principles
  for all
  using ((auth.jwt() ->> 'email') = 'walavalkarridhesh@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'walavalkarridhesh@gmail.com');

drop policy if exists "admin write projects" on projects;
create policy "admin write projects" on projects
  for all
  using ((auth.jwt() ->> 'email') = 'walavalkarridhesh@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'walavalkarridhesh@gmail.com');

drop policy if exists "admin write research" on research;
create policy "admin write research" on research
  for all
  using ((auth.jwt() ->> 'email') = 'walavalkarridhesh@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'walavalkarridhesh@gmail.com');

drop policy if exists "admin write social_links" on social_links;
create policy "admin write social_links" on social_links
  for all
  using ((auth.jwt() ->> 'email') = 'walavalkarridhesh@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'walavalkarridhesh@gmail.com');

-- ----------------------------------------------------------------- storage
-- Public-read bucket for the portrait, hero video and project stills.
insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', true)
on conflict (id) do nothing;

drop policy if exists "public read portfolio assets" on storage.objects;
create policy "public read portfolio assets" on storage.objects
  for select using (bucket_id = 'portfolio-assets');

drop policy if exists "admin upload" on storage.objects;
create policy "admin upload" on storage.objects
  for all
  using (
    bucket_id = 'portfolio-assets'
    and (auth.jwt() ->> 'email') = 'walavalkarridhesh@gmail.com'
  )
  with check (
    bucket_id = 'portfolio-assets'
    and (auth.jwt() ->> 'email') = 'walavalkarridhesh@gmail.com'
  );

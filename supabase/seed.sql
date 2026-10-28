-- ============================================================================
-- Ridhesh Walavalkar — seed content (the Part 1 copy, verbatim)
--
-- Run after schema.sql. Idempotent: re-running resets the copy to these values.
-- Image / video URLs are left NULL so the site falls back to the files in
-- public/assets/. Set them from the admin panel once they are uploaded to the
-- portfolio-assets Storage bucket.
-- ============================================================================

-- ----------------------------------------------------------------- settings
insert into site_settings (
  id,
  hero_roles,
  hero_description,
  marquee_words,
  story_heading,
  story_body,
  projects_heading,
  research_heading,
  numbers_heading,
  contact_heading,
  contact_body,
  contact_email,
  hero_portrait_url,
  hero_video_url,
  github_username,
  papers_count
) values (
  1,
  array['Developer', 'Researcher', 'Founder'],
  'I start projects that shouldn''t be public — and make them public.',
  array['Ship Fast', 'Build With Ridhesh', 'Ship Fast', 'Build With Ridhesh', 'Ship Fast'],
  'Ship first. Refine in public.',
  'I''m an AI/ML developer and researcher, studying B.Tech AI/ML at D.Y. Patil International University. I build full-stack products solo — frontend, backend, and the AI that powers them — and I''ve published research on crop stress detection, with more on the way. The through-line: take the idea that isn''t supposed to be out yet, and put it in front of people.',
  'Built fast. Shipped anyway.',
  'Published. More to come.',
  'Shipped, measured.',
  'Got an idea that shouldn''t be public yet?',
  'Internships, research, or a project that needs shipping — send it over. I read every message.',
  'walavalkarridhesh@gmail.com',
  null,
  null,
  'ridheshcybe',
  1
)
on conflict (id) do update set
  hero_roles = excluded.hero_roles,
  hero_description = excluded.hero_description,
  marquee_words = excluded.marquee_words,
  story_heading = excluded.story_heading,
  story_body = excluded.story_body,
  projects_heading = excluded.projects_heading,
  research_heading = excluded.research_heading,
  numbers_heading = excluded.numbers_heading,
  contact_heading = excluded.contact_heading,
  contact_body = excluded.contact_body,
  contact_email = excluded.contact_email,
  github_username = excluded.github_username,
  papers_count = excluded.papers_count,
  updated_at = now();

-- --------------------------------------------------------------- principles
delete from story_principles;
insert into story_principles (sort_order, title, body) values
  (0, 'Ship before it''s polished', 'A working prototype teaches more than a perfect plan. I build in the open and fix in public.'),
  (1, 'Own the whole stack', 'Frontend, backend, and the AI in between. When I own every layer, nothing gets lost in a handoff.'),
  (2, 'Research has to run', 'A paper only matters if the idea works. I turn research into tools people can actually use.'),
  (3, 'Always in motion', 'Every project is a step toward the next one, and there''s always another one coming.');

-- ----------------------------------------------------------------- projects
delete from projects;
insert into projects (sort_order, published, name, category, year_label, outcome, blurb, image_url, href) values
  (0, true, 'CineMatch', 'AI Recommendation Engine', 'Ongoing', 'Prototype',
   'A full-stack AI movie recommendation engine that learns what you like and finds what to watch next.', null,
   'https://github.com/ridheshcybe'),
  (1, true, 'HIA Lite', 'AI Medical Report Explainer', 'Ongoing', 'Prototype',
   'An educational AI app that turns dense medical reports into plain language anyone can follow.', null,
   'https://github.com/ridheshcybe'),
  (2, true, 'Queue Cure ''26', 'Clinic Queue Management', '2026', 'Live',
   'A Next.js queue management system that keeps clinic waiting rooms moving and patients informed.', null,
   'https://github.com/ridheshcybe'),
  (3, true, 'SecureOps Sync', 'Incident Triage & Remediation', '2025', 'Live',
   'An AI-powered system that triages security incidents and drives them to remediation.', null,
   'https://github.com/ridheshcybe');

-- ----------------------------------------------------------------- research
delete from research;
insert into research (sort_order, published, meta, title, url) values
  (0, true, 'IAEME Publication — 2026',
   'A Unified Multi-Modal Framework for Crop Stress Detection: Combining Tabular Environmental Data and Leaf-Image Classification',
   'https://iaeme.com/Home/article_id/IJAIA_04_02_001');

-- ------------------------------------------------------------- social links
delete from social_links;
insert into social_links (sort_order, label, url) values
  (0, 'GitHub', 'https://github.com/ridheshcybe'),
  (1, 'LinkedIn', 'https://www.linkedin.com/in/ridheshcybe'),
  (2, 'X / Twitter', 'https://x.com/ridheshcybe');

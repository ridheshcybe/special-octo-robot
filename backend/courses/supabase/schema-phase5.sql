-- ============================================================================
-- Phase 5 — in-browser coding playground (zero-cost, client-side execution)
-- Run AFTER schema.sql..schema-phase4.sql in: Supabase SQL Editor.
--
-- Design:
--   • New lesson type 'exercise'. Public metadata (title, language) lives on
--     `lessons`; the CONTENT (instructions, starter, tests, hints, sample DB)
--     lives in `exercises`, which is admin-only through RLS and served to
--     subscribers by the get-exercise edge function after an access check.
--     (Lesson learned from the Phase-1 review: no subscriber-readable secret
--     table — ever.)
--   • Progress: one row per (user, exercise) — ONLY the latest submission.
--     `latest_code` ≤ 20 KB, `best_score` ≤ 100%. Saves happen straight from
--     the browser through RLS (user_id = auth.uid()), so there is no edge
--     function or egress cost at all. Small rows, capped size — free-tier
--     safe: 1,000 active students ≈ a few MB.
--   • Honest security note (see also README): tests ship to the browser, so
--     this checks learning, not cheating. A determined student can read the
--     tests in DevTools and hardcode expected outputs. That is an accepted
--     trade for ₹0/month — graded exams need a server.
-- ============================================================================

-- New lesson type.
alter table public.lessons drop constraint if exists lessons_type_check;
alter table public.lessons
  add constraint lessons_type_check check (type in ('pdf', 'video', 'live', 'exercise'));

-- ----------------------------------------------------------------- exercises
create table if not exists public.exercises (
  lesson_id      bigint primary key references public.lessons (id) on delete cascade,
  language       text not null check (language in ('javascript', 'python', 'html-css', 'sql')),
  instructions_md text not null default '',        -- markdown instructions
  starter_code   text not null default '',
  tests          jsonb not null default '[]'::jsonb, -- [{name, expect, fn}]
  hints          jsonb not null default '[]'::jsonb, -- ["...", "..."]
  sample_db_sql  text not null default '',           -- SQL runner: schema+seed
  updated_at     timestamptz not null default now()
);

alter table public.exercises enable row level security;

-- Admin-only write AND read. Students never select from this table — the
-- get-exercise edge function serves it after the usual access check.
drop policy if exists "exercises admin all" on public.exercises;
create policy "exercises admin all" on public.exercises
  for all using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------- exercise_progress
create table if not exists public.exercise_progress (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  lesson_id   bigint not null references public.lessons (id) on delete cascade,
  latest_code text not null default '',
  best_score  int not null default 0 check (best_score between 0 and 100),
  passed      boolean not null default false,
  attempts    int not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.exercise_progress enable row level security;

-- Students write ONLY their own row; size caps are enforced in the CHECK
-- constraints so a tampered client cannot bloat the free-tier database.
drop policy if exists "exercise_progress own all" on public.exercise_progress;
create policy "exercise_progress own all" on public.exercise_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 20 KB code cap (bytes, matches octet_length for plain ASCII/UTF-8 code) and
-- a sane attempts ceiling. Students can only ever shrink their own usage.
alter table public.exercise_progress
  add constraint exercise_progress_code_cap check (octet_length(latest_code) <= 20480);
alter table public.exercise_progress
  add constraint exercise_progress_attempts_cap check (attempts between 0 and 10000);

-- ==================================================================== seed
-- Three example exercises for testing. Assumes course id 1 exists; if you
-- haven't created courses yet, run this AFTER creating one in /admin.
insert into public.lessons (course_id, title, type, position, is_free_preview)
values
  ((select id from public.courses order by id limit 1), 'Exercise: Sum two numbers (JS)',   'exercise', 900, true),
  ((select id from public.courses order by id limit 1), 'Exercise: Even or odd (Python)',   'exercise', 901, false),
  ((select id from public.courses order by id limit 1), 'Exercise: Top student (SQL)',      'exercise', 902, false);

insert into public.exercises (lesson_id, language, instructions_md, starter_code, tests, hints, sample_db_sql)
values
(
  (select id from public.lessons where title = 'Exercise: Sum two numbers (JS)' limit 1),
  'javascript',
  E'## Sum two numbers\n\nWrite a function `sum(a, b)` that returns the **sum** of `a` and `b`.\n\n```js\nsum(2, 3) // → 5\n```\n\nPress **Run** to try it, **Submit** to check the tests.',
  'function sum(a, b) {\n  // your code here\n}\n',
  '[{"name":"2 + 3 = 5","expect":5,"fn":"sum(2,3)"},{"name":"negative numbers","expect":-2,"fn":"sum(-5,3)"},{"name":"decimals","expect":3.75,"fn":"sum(1.5, 2.25)"}]',
  '["Remember: JavaScript does NOT convert strings for the + operator. If one argument is a string, + concatenates.", "Convert inputs with Number(...) before adding."]',
  ''
),
(
  (select id from public.lessons where title = 'Exercise: Even or odd (Python)' limit 1),
  'python',
  E'## Even or odd?\n\nWrite a function `even_or_odd(n)` that returns the string `"even"` or `"odd"`.\n\n```python\neven_or_odd(4)  # → "even"\neven_or_odd(7)  # → "odd"\n```\n\nPyodide (real Python in your browser) runs this — no server involved.',
  'def even_or_odd(n):\n    # your code here\n    pass\n',
  '[{"name":"4 is even","expect":"even","fn":"even_or_odd(4)"},{"name":"7 is odd","expect":"odd","fn":"even_or_odd(7)"},{"name":"0 is even","expect":"even","fn":"even_or_odd(0)"}]',
  '["n % 2 gives the remainder — 0 means divisible by 2.", "Return the STRING, not a boolean."]',
  ''
),
(
  (select id from public.lessons where title = 'Exercise: Top student (SQL)' limit 1),
  'sql',
  E'## Find the top student\n\nThe database has a `students` table:\n\n- Aisha — 82\n- Rohit — 91\n- Meena — 77\n\nWrite a query that returns the name and marks of the student with the **highest marks**.\n\nYour result must have exactly two columns: `name`, then `marks`.',
  'SELECT name, marks\nFROM students\n-- your code here\n',
  '[{"name":"returns Rohit with 91","expect":"Rohit,91","fn":""}]',
  '["ORDER BY marks DESC sorts highest first.", "LIMIT 1 keeps only the first row."]',
  E'CREATE TABLE students (name TEXT, marks INT);\nINSERT INTO students VALUES (''Aisha'', 82), (''Rohit'', 91), (''Meena'', 77);'
);

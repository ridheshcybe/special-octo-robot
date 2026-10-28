# Ridhesh Walavalkar — portfolio + courses platform

One **Next.js (App Router) + TypeScript + React 19** app that contains two halves of a
single product, deployed together:

| Area | Route | What it is |
| ---- | ----- | ---------- |
| **Portfolio** | `/` | Cinematic, dark-mode one-pager. Copy is data (Supabase) and is edited at `/admin`. |
| **Courses** | `/courses` | A paid, gated course storefront (list → course → lesson → pricing → checkout → dashboard), with its own admin at `/courses/admin`. |

The portfolio is the storefront; **Courses is a section of it** (the `#courses` block links
straight into `/courses`). Both build and deploy as one Next app.

> The courses feature talks to a **separate Supabase project** from the portfolio. Its schema
> and Deno edge functions live in [`backend/courses/`](backend/courses/) and are deployed
> independently. The two frontends share one codebase and one deployment, not one database.

---

## 1. Requirements

- Node.js 20+ (developed on 26)
- Two Supabase projects (free tier is fine): one for the portfolio, one for courses

## 2. Environment

```bash
cp .env.example .env.local
```

Fill in `.env.example`. Everything is `NEXT_PUBLIC_*` (public by design); no service-role key
or Razorpay secret belongs in this file. The courses vars are namespaced
`NEXT_PUBLIC_COURSES_*` so they never collide with the portfolio's.

## 3. Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

## 4. Portfolio setup

1. Create a Supabase project, open **SQL Editor**, and run `supabase/schema.sql` then
   `supabase/seed.sql`.
2. Create the admin user (Authentication → Users). The RLS policies grant write access to
   `walavalkarridhesh@gmail.com` — change that email in `supabase/schema.sql` if needed.
3. Set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Portfolio admin (`/admin`)

| Route             | Edits |
| ----------------- | ----- |
| `/admin`          | Overview + content counts |
| `/admin/settings` | Hero roles & description, marquee words, headings, contact, GitHub username, papers count |
| `/admin/story`    | Story heading/body + numbered principles |
| `/admin/projects` | Project cards: add, edit, reorder, publish/unpublish, link, image |
| `/admin/research` | Published papers |
| `/admin/social`   | Footer social links |
| `/admin/media`    | Hero portrait + hero video |

Every save calls `POST /api/revalidate` (session-verified) so changes appear immediately.
`middleware.ts` refreshes the session and gates `/admin/*`. Design tokens, motion timings and
layout are **not** editable by design.

## 5. Courses setup

The courses backend (schema, migrations by phase, edge functions, HLS script) is documented in
[`backend/courses/README.md`](backend/courses/README.md). In short:

1. Create the **courses** Supabase project and run
   `backend/courses/supabase/schema.sql` (then the `schema-phase*.sql` files you need).
2. Deploy the edge functions in `backend/courses/supabase/functions/` and set their secrets.
3. Make yourself admin (`profiles.role = 'admin'`).
4. Set the `NEXT_PUBLIC_COURSES_*` vars in `.env.local`.

### Courses admin (`/courses/admin`)

`Courses` · `Lessons` (PDF upload, YouTube/HLS video, live sessions, coding exercises) ·
`Plans` · `Users` (grant days) · `Payments`. Authorization is RLS (`profiles.role = 'admin'`)
plus a re-check inside every admin edge function — the route guard is UX only.

## 6. Architecture

```
app/
  layout.tsx                fonts, globals.css, the js / html.rem-grid flag, adaptive grid
  page.tsx                  the portfolio one-pager (server component, revalidate = 60)
  globals.css               portfolio tokens, rem grid, motion + admin CSS
  api/revalidate/route.ts   session-verified cache purge
  (admin)/admin/…           portfolio CMS (login + dashboard screens)
  courses/
    layout.tsx              AuthProvider (courses Supabase) + courses.css
    courses.css             Tailwind v4 (theme + utilities, NO preflight) + component classes
    (site)/…                public storefront: /courses, [slug], lessons/[id], pricing,
                            login, dashboard, payment-success, legal pages
    admin/…                 /courses/admin screens (guarded)
    _src/                   the ported courses code — pages, components, admin, executors,
                            auth, lib. Private folder (`_`), never routed directly.
components/
  SmoothScroll.tsx          Lenis provider with a scroll-lock registry
  AdaptiveGrid.tsx          damped root font scale-up above 1920px
  RemGrid.tsx               keeps html.rem-grid correct across client navigation
  site/                     Preloader, SiteNav, Hero, Marquee, Story, Projects, Research,
                            Numbers, Courses, ContactFooter, LiquidImage, TextReveal, …
  admin/                    AdminShell, SettingsForm, CrudList, api, ui
lib/
  types.ts / seed.ts / content.ts / github.ts / supabase/…   portfolio data layer
backend/
  courses/
    supabase/               courses schema.sql + phase migrations + Deno edge functions
    scripts/make-hls.sh     ffmpeg → HLS for the R2 self-hosted video path
```

Components never query Supabase directly for the portfolio: they receive slices of
`SiteContent` from `lib/content.ts`. The courses half is client-rendered (auth, gated fetches).

### Why the CSS is split

`globals.css` (portfolio) and `courses.css` (courses) intentionally share one `--` variable
space without colliding:

- Tailwind's theme/utilities are imported into `courses.css` **without preflight**, so the
  portfolio's own reset is never clobbered after a client navigation into `/courses`.
- The portfolio's responsive rem grid is gated behind `html.rem-grid`, which the inline script
  in `app/layout.tsx` sets everywhere **except** `/courses` — so the storefront keeps its
  viewport-scaled rem while the Tailwind UI keeps a normal 16px rem.
- The portfolio's body font variable was renamed `--font-sans` → `--font-body` so it can't
  collide with Tailwind's own `--font-sans`.

### Fallbacks

`lib/content.ts` wraps every portfolio read in try/catch and returns the matching slice of
`lib/seed.ts` when Supabase is unreachable or unset — the public page always renders. The
courses pages show a friendly "Supabase is not configured yet" message instead of throwing.

## 7. Deploy

One Next.js deployment serves both halves. On Netlify (or any Next host): connect the repo and
add every variable from `.env.example`. Nothing is host-specific.

## 8. Keep-alive

`.github/workflows/keep-alive.yml` pings the courses Supabase REST API daily so the free
project never pauses. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` (the courses project) as repo
secrets.

## 9. Note on `middleware.ts`

Next 16 prints a deprecation warning for the `middleware.ts` convention (renamed to
`proxy.ts`). It behaves correctly; to adopt the new name run
`npx @next/codemod@canary middleware-to-proxy .`.

## 10. Verification checklist

Verified locally:

- [x] `npm run typecheck` is clean
- [x] Production `next build` succeeds; `/` prerenders static with a 60s ISR window and all
      `/courses/*` routes register
- [x] The portfolio loads only its own stylesheet; `/courses` loads Tailwind + the portfolio
      reset, with no cross-contamination
- [x] `/` links into `/courses`; `/courses` links back to `/`
- [x] `/admin/*` still redirects when signed out (portfolio session)

TODO before launch:

- [ ] Run the portfolio `supabase/schema.sql` + `seed.sql`, and the courses schema/migrations
- [ ] Create both admin users, deploy the courses edge functions + secrets
- [ ] Fill `.env.local` with both projects' vars (see `.env.example`)
- [ ] Replace the placeholder project links on the portfolio project cards
- [ ] (Optional) Make the `#courses` block on `/` render live courses from the courses project
      instead of the hard-coded trio in `components/site/Courses.tsx`
#   s p e c i a l - o c t o - r o b o t  
 
# College Courses — backend (free-tier edition)

The backend for the `/courses` section of this app. **₹0/month** courses platform for college
students in India.

- **Database + Auth:** Supabase (free plan) — Postgres + RLS, email/Google auth, a private PDF
  bucket, and **Deno Edge Functions** for anything needing a secret.
- **Payments:** Razorpay (UPI-first checkout; test mode is free). Prepaid passes only, no
  auto-debit.
- **Video:** unlisted YouTube embeds, gated Google Meet live sessions, and optional
  self-hosted HLS on Cloudflare R2 — nothing is stored in Supabase except PDFs.

> The **frontend now lives in the Next app** at [`app/courses/`](../../app/courses) and deploys
> with it. This folder is only the backend: it is deployed to its own Supabase project,
> separately from the portfolio's.

## Folder structure

```
backend/courses/
├── supabase/
│   ├── schema.sql                # Run once: tables, RLS, trigger, grant_access(), bucket, seed plans
│   ├── schema-phase2.sql         # video lessons  (lesson_progress + get-video)
│   ├── schema-phase3.sql         # live sessions  (schedule columns + get-live-link)
│   ├── schema-phase4.sql         # self-hosted HLS (R2 + get-hls-url)
│   ├── schema-phase5.sql         # coding exercises (exercises + exercise_progress + get-exercise)
│   └── functions/
│       ├── create-order/         # Razorpay order creation (price read server-side)
│       ├── razorpay-webhook/     # signature check + IDEMPOTENT access grant
│       ├── get-pdf-url/          # access check → 5-minute signed PDF URL
│       ├── get-lesson-secret/    # access check → youtube_id / meeting_url
│       ├── get-video/            # access check → gated YouTube id
│       ├── get-live-link/        # server-clock gated Meet link (423/410 outside the window)
│       ├── get-hls-url/          # access check → 6-hour presigned R2 playlist + segments
│       ├── get-exercise/         # access check → exercise content + the student's progress
│       ├── admin-list-users/     # admin-only user list with emails
│       └── admin-grant-days/     # admin-only manual expiry extension
└── scripts/make-hls.sh           # ffmpeg → 360p/480p/720p HLS, 4s segments
```

The frontend env var names the functions map to live in the root
[`.env.example`](../../.env.example) (all `NEXT_PUBLIC_COURSES_*`).

## 1. Supabase project

1. Create a project (free plan) at supabase.com. Pick Mumbai `ap-south-1` for India.
2. **SQL Editor → New query** → paste `supabase/schema.sql` → Run. This creates `profiles`,
   `courses`, `lessons`, `lesson_secrets`, `plans`, `payments` + RLS, the signup trigger, the
   idempotent `grant_access()` function, the **private** `course-files` bucket, and the two
   seed plans (₹99/30d, ₹199/90d).
3. **Auth → Providers:** Email (on; turn off "Confirm email" while testing) and Google (add
   `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback` as an authorized redirect URI in
   Google Cloud Console).
4. **Settings → API:** copy the URL + anon key into `NEXT_PUBLIC_COURSES_SUPABASE_URL` /
   `_ANON_KEY`.

## 2. Make yourself admin

Sign up once through the app, then run:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

## 3. Edge functions + secrets

Run these from **inside `backend/courses/`** (the folder containing `supabase/`):

```bash
npm i -g supabase          # once
supabase login
supabase link --project-ref YOUR-PROJECT-REF

# Server-side only — never in the frontend bundle:
supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
supabase secrets set RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
supabase secrets set RAZORPAY_WEBHOOK_SECRET=replace-with-long-random-string

supabase functions deploy create-order
supabase functions deploy razorpay-webhook
supabase functions deploy get-pdf-url
supabase functions deploy get-lesson-secret
supabase functions deploy get-video
supabase functions deploy get-live-link
supabase functions deploy get-hls-url
supabase functions deploy get-exercise
supabase functions deploy admin-list-users
supabase functions deploy admin-grant-days
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected into functions automatically —
never put the service key in `.env.local`.

## 4. Razorpay test keys + webhook

1. Dashboard → Settings → API Keys → generate **Test** keys. The secret goes into the
   `supabase secrets set` commands above; the **id** goes into
   `NEXT_PUBLIC_COURSES_RAZORPAY_KEY_ID`.
2. Webhook: Settings → Webhooks → Add New Webhook
   - URL: `https://YOUR-PROJECT-REF.supabase.co/functions/v1/razorpay-webhook`
   - Secret: the same `RAZORPAY_WEBHOOK_SECRET`
   - Events: **payment.captured** and **payment.failed**
3. Test-mode checkout: UPI `success@razorpay` succeeds, `failure@razorpay` fails. Card
   `4111 1111 1111 1111`, any future expiry/CVV.

## 5. Migrations by phase

Each phase adds a migration you run in the SQL editor and one function to deploy. The
frontend UI for all of them already ships in `app/courses`.

| Phase | Run | Deploy | Frontend env |
| ----- | --- | ------ | ------------ |
| 2 — Video lessons (unlisted YouTube) | `supabase/schema-phase2.sql` | `get-video` | `NEXT_PUBLIC_COURSES_GET_VIDEO_URL` |
| 3 — Live sessions (gated Meet) | `supabase/schema-phase3.sql` | `get-live-link` | `NEXT_PUBLIC_COURSES_GET_LIVE_LINK_URL` |
| 4 — Self-hosted HLS (R2) | `supabase/schema-phase4.sql` | `get-hls-url` | `NEXT_PUBLIC_COURSES_GET_HLS_URL` |
| 5 — Coding playground | `supabase/schema-phase5.sql` | `get-exercise` | `NEXT_PUBLIC_COURSES_GET_EXERCISE_URL` |

### Phase 4 — R2 + HLS

The video lives as HLS in a **private** R2 bucket; students only receive 6-hour presigned URLs
minted by `get-hls-url` after the usual access check. R2 never bills egress, so a big month
costs ₹0 in bandwidth (storage/ops overage only if you enable billing).

```bash
# Deploy the edge secrets (browser never sees these):
supabase secrets set R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... \
  R2_SECRET_ACCESS_KEY=... R2_BUCKET=hls-videos

# Publish a lesson:
./scripts/make-hls.sh my-video.mp4 lesson-7
rclone copy hls/lesson-7/ r2:hls-videos/hls/lesson-7/ --transfers 8
```

Then in `/courses/admin/lessons`, set type **Video**, source **Self-hosted HLS (R2)**, and the
path `hls/lesson-7/master.m3u8`.

### Phase 5 — coding playground

Exercises (JavaScript / Python / HTML-CSS / SQL) execute entirely in the student's browser
(Web Worker, Pyodide from jsDelivr, sql.js, and a sandboxed iframe) — no server compute, no
cost. Tests ship to the client, so this is practice tooling, not a graded-exam sandbox; see
the honest limits noted in `app/courses/_src/executors/jsWorker.ts`.

## 6. Security model

- The client sends only `plan_id`; the price is read server-side from `plans`. Amounts and
  statuses are never decided in the browser.
- Access is granted **only** inside `grant_access()` (one row-locked transaction, early-return
  if already paid), called exclusively by the signature-verified webhook.
- `youtube_id` / `meeting_url` / `recording_youtube_id` / `hls_path` live in `lesson_secrets`,
  invisible to non-subscribers; the client gets them only from the gated edge functions.
- The R2 bucket is private; every URL is a short-lived presigned URL minted after the access
  check.
- Admin = `profiles.role = 'admin'`, enforced by RLS on every table **and** re-verified inside
  every admin edge function. Students can never change `role` or `access_expires_at`.
- PDFs: private bucket, signed URLs expire in 5 minutes, 10 MB upload cap.

## 7. Keep-alive

The free project pauses after 7 days of inactivity. [`.github/workflows/keep-alive.yml`](../../.github/workflows/keep-alive.yml)
pings it daily at 04:00 UTC. Add the **courses** `SUPABASE_URL` and `SUPABASE_ANON_KEY` as repo
secrets.

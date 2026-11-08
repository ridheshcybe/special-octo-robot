# PrepMeUp AI — Hostinger Deployment Guide (Not Yet Deployed)

## Status: pre-deployment checklist

PrepMeUp AI is a Next.js 16 app with server-only Supabase service-role access,
signed admin sessions, and Razorpay webhook HMAC verification. It uses
`output: "standalone"` in `next.config.mjs`, so it must run as a Node.js server.
It does **not** work as a static `output: "export"` site.

Deploy command:

```bash
bash deploy_hostinger.sh
```

or, to build only plus verify:

```bash
npm ci
npm run build
```

The repo already contains:

- `deploy_hostinger.sh` — production build + server-only secret leak check
- `deploy_hostinger.env.example` — `.env` template with `<placeholder>` tokens
- `package_for_hostinger.py` — builds a deployable archive of the repo tree

---

## 1. What the repo template already covers

Files shipped for a generic Node.js Web App on Hostinger:

| File | Purpose |
|---|---|
| `deploy_hostinger.sh` | `npm ci`, `npm run build`, secret-leak check, env template |
| `deploy_hostinger.env.example` | copy to `.env`, fill `<...>` placeholders |
| `package_for_hostinger.py` | builds a deployable archive from the repo tree |

Hostinger Node.js Web App settings:

- Node.js version: **20 LTS or higher**
- Install command: `npm ci`
- Build command: `npm run build`
- Start command: `npm run start -- -p $PORT` (Hostinger injects `$PORT`)
- Output directory: `.next`
- Add the environment variables below in Hostinger before deploying

---

## 2. Environment variables for Hostinger

Add these in **Hostinger hPanel → Websites → Manage → Environment variables**.
Never commit real secrets to `.env`, `.env.local`, `deploy_hostinger.env.example`, or the repository.

### A. Supabase (PrepMeUp AI)

| Variable | Exposure | Notes |
|---|---|---|
| `NEXT_PUBLIC_PMU_SUPABASE_URL` | Public / Client | `https://<project>.supabase.co` |
| `NEXT_PUBLIC_PMU_SUPABASE_ANON_KEY` | Public / Client | Anon JWT key |
| `PMU_SUPABASE_SERVICE_ROLE_KEY` | **Secret / Server Only** | Never shipped to the browser |

### B. Google Gemini AI

| Variable | Exposure |
|---|---|
| `GEMINI_API_KEY` | **Secret / Server Only** |
| `GEMINI_TEXT_MODEL` | `gemini-1.5-flash` (recommended) |
| `GEMINI_DOCUMENT_MODEL` | `gemini-1.5-flash` or `gemini-1.5-pro` |

Optional:

- `GROQ_API_KEY` — optional Groq vision fallback

### C. Razorpay & webhooks

| Variable | Exposure |
|---|---|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public / Client |
| `RAZORPAY_KEY_SECRET` | **Secret / Server Only** |
| `RAZORPAY_WEBHOOK_SECRET` | **Secret / Server Only** |

### D. Twilio Verify (WhatsApp OTP)

| Variable | Exposure |
|---|---|
| `TWILIO_ACCOUNT_SID` | **Secret / Server Only** |
| `TWILIO_AUTH_TOKEN` | **Secret / Server Only** |
| `TWILIO_VERIFY_SERVICE_SID` | **Secret / Server Only** |

### E. Upstash Redis (distributed rate limiting)

| Variable | Exposure |
|---|---|
| `UPSTASH_REDIS_REST_URL` | **Secret / Server Only** |
| `UPSTASH_REDIS_REST_TOKEN` | **Secret / Server Only** |

Optional. If unset, rate limiting falls back to the `pmu_rate_limits` Supabase table.

---

## 3. Server-only and app variables

| Variable | Exposure | Notes |
|---|---|---|
| `PMU_APP_URL` | Server | `https://<your-hostinger-domain>` (must be `https` in production) |
| `PMU_SESSION_SECRET` | **Secret / Server Only** | 32+ characters in production |
| `PMU_OTP_DEV_MODE` | **Server** | must stay `false` in production |
| `PMU_ENABLE_DEV_ADMIN_FALLBACK` | **Server** | must stay `false` in production |
| `CERTIFICATE_SIGNING_SECRET` | **Secret / Server Only** | certificate signing |
| `NEXT_PUBLIC_CMS_URL` | Public / Client | self-hosted CMS if used |
| `CMS_API_URL` | Server | self-hosted CMS API |
| `CMS_API_TOKEN` | **Secret / Server Only** | self-hosted CMS service token |
| `CMS_WEBHOOK_SECRET` | **Secret / Server Only** | self-hosted CMS webhook secret |
| `UNIFIED_RAZORPAY_KEY_SECRET` | **Secret / Server Only** | unified checkout |
| `UNIFIED_RAZORPAY_WEBHOOK_SECRET` | **Secret / Server Only** | unified checkout webhook |
| `NEXT_PUBLIC_UNIFIED_RAZORPAY_KEY_ID` | Public / Client | unified checkout |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public / Client | payer-facing Razorpay key |

---

## 4. Public (browser-readable) variables

Only these may appear in client bundles:

- `NEXT_PUBLIC_PMU_SUPABASE_URL`
- `NEXT_PUBLIC_PMU_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `NEXT_PUBLIC_UNIFIED_RAZORPAY_KEY_ID`

All other keys stay server-only. The app enforces this with fail-closed
session verification, webhook HMAC checks, and service-role protection.

---

## 5. Deployment steps

1. Push the repository to GitHub.
2. Log in to **Hostinger hPanel → Websites → Add Website**.
3. Choose **Node.js Apps**.
4. Select **Import Git Repository**, authorize GitHub access, and pick this repo.
5. Review the auto-detected settings:

   - Node.js: `20`
   - Install command: `npm ci`
   - Build command: `npm run build`
   - Start command: `npm run start -- -p $PORT`
   - Output directory: `.next`

6. Add every environment variable from **Section 2** in **Production**.
7. Click **Deploy**. Hostinger rebuilds on push to the configured branch.

---

## 6. Razorpay webhook

1. Open the Razorpay Dashboard and go to **Settings → Webhooks**.
2. Add a new webhook with URL:

   ```text
   https://<your-hostinger-domain>/api/prepmeup/payments/webhook
   ```

3. Enter the exact value of `RAZORPAY_WEBHOOK_SECRET` as the secret.
4. Enable `order.paid` and `payment.captured`.
5. Ping the webhook and confirm an HTTP `200`.

---

## 7. Post-deployment verification

1. Open `https://<your-hostinger-domain>/prepmeup`.
2. Run the full launch checklist (`docs/prepmeup/launch-checklist.md`, all 7 sections).
3. Confirm the custom 404 page renders for unknown routes.
4. Confirm API routes respond, e.g. `/api/prepmeup/auth/...`, `/api/prepmeup/payments/webhook`.
5. Check hPanel server logs on any startup failure; missing env vars and a
   hardcoded `PORT` are the common causes.

---

## 8. What the developer (code owner) must do before this is live

A template and build pipeline are not a backend deployment. Before the site is
public, the operator must provision the real values:

1. Create or copy the **PrepMeUp AI Supabase project** and run the SQL migrations
   in `backend/prepmeup/migrations/` in order, plus `backend/prepmeup/schema.sql`
   and `backend/prepmeup/seed.sql` or the newest migration phase.
2. Create the **Supabase service role key** and paste it into
   `PMU_SUPABASE_SERVICE_ROLE_KEY`.
3. Create the **Razorpay live/test keys** and paste `RAZORPAY_KEY_SECRET`,
   `RAZORPAY_WEBHOOK_SECRET`, `UNIFIED_RAZORPAY_KEY_SECRET`,
   `UNIFIED_RAZORPAY_WEBHOOK_SECRET`, and `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
4. Create the **Twilio Verify service** (`TWILIO_ACCOUNT_SID`,
   `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`).
5. Create the **Gemini API key** (`GEMINI_API_KEY`).
6. Create the **Upstash Redis REST URL and token** if using distributed rate limits.
7. Set `PMU_APP_URL=https://<your-hostinger-domain>` and a 32+ character
   `PMU_SESSION_SECRET`.
8. Set the Phase Q3 pricing values server-authoritatively in the repo or,
   better, in Supabase/environment config so the browser never sees them.
9. Verify the webhook and the free-seat + paid access flow with a Razorpay
   test card before opening the site publicly.

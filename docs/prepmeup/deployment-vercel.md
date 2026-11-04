# Vercel Production Deployment Runbook for PrepMeUp AI

This document details the configuration, deployment, and verification protocol for hosting **PrepMeUp AI** on **Vercel** alongside the existing portfolio codebase.

---

## 1. Prerequisites & Architectural Guardrails
1. **Runtime Requirements**:
   - Standard Next.js server runtime (`Node.js 20.x` or `22.x`).
   - Dynamic API route handlers, cookie-based session verification, AI SSE streaming, and webhook signature verification require a persistent or serverless Node environment. **Do not use static output mode (`output: 'export'`)**.
2. **Path Isolation**:
   - All PrepMeUp AI routes (`/prepmeup/*` and `/api/prepmeup/*`) are scoped and isolated from root portfolio paths (`/`, `/admin`, `/courses`, `/courses/admin`).
   - Security headers for `/prepmeup/:path*` are enforced inside `next.config.mjs`.

---

## 2. Environment Variables Checklist
Add these in the **Vercel Project Dashboard** under **Settings → Environment Variables** (for `Production` and `Preview` environments):

### A. Supabase Database & Service Role
| Variable | Description | Exposure |
|---|---|---|
| `NEXT_PUBLIC_PMU_SUPABASE_URL` | Supabase Project URL (`https://xyz.supabase.co`) | Public / Client |
| `NEXT_PUBLIC_PMU_SUPABASE_ANON_KEY` | Public Anon JWT Key | Public / Client |
| `PMU_SUPABASE_SERVICE_ROLE_KEY` | High-privilege secret key for server-side operations (RLS bypass) | **Secret / Server Only** |

### B. Google Gemini AI Engine
| Variable | Description | Default / Recommended |
|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio or Vertex AI API Key | **Secret / Server Only** |
| `GEMINI_TEXT_MODEL` | Text generation model identifier | `gemini-1.5-flash` |
| `GEMINI_DOCUMENT_MODEL` | Vision / Multimodal OCR model identifier | `gemini-1.5-flash` or `gemini-1.5-pro` |

*(Optional Groq Vision fallback)*:
- `GROQ_API_KEY`: Groq API key for ultra-low latency `llama-3.2-11b-vision-preview`.

### C. Razorpay Payments & Webhooks
| Variable | Description | Exposure |
|---|---|---|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public Key ID (`rzp_live_...` or `rzp_test_...`) | Public / Client |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret Key for HMAC-SHA256 signature verification | **Secret / Server Only** |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook secret configured on Razorpay Dashboard | **Secret / Server Only** |

### D. Twilio Verify (WhatsApp OTP)
| Variable | Description | Exposure |
|---|---|---|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | **Secret / Server Only** |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | **Secret / Server Only** |
| `TWILIO_VERIFY_SERVICE_SID` | Twilio Verify Service SID (`VA...`) | **Secret / Server Only** |

### E. Upstash Redis (Distributed Rate Limiting)
| Variable | Description | Exposure |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST API URL | **Secret / Server Only** |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token | **Secret / Server Only** |

*(Note: If Upstash environment variables are not provided, rate limiting automatically falls back to the database-level `pmu_rate_limits` table).*

---

## 3. Database Migration Execution Order
Run the following SQL migrations in order within the **Supabase SQL Editor** before promoting the production deployment:

1. `backend/prepmeup/migration-phase1.sql` (Subjects, Modules, Topics, Notes, Questions)
2. `backend/prepmeup/migration-phase2.sql` (Profiles, OTP Sessions, Auth RLS)
3. `backend/prepmeup/migration-phase3.sql` (Notes drafts, past papers, storage buckets)
4. `backend/prepmeup/migration-phase4.sql` (Quiz attempts, question answers, progress tracking)
5. `backend/prepmeup/migration-phase5.sql` (AI doubt threads, messages, RAG search vectors)
6. `backend/prepmeup/migration-phase6.sql` (Interactive simulation state & topic references)
7. `backend/prepmeup/migration-phase7.sql` (Razorpay payments, subscriptions, atomic free seat counter)
8. `backend/prepmeup/migration-phase9-ratelimit.sql` (Distributed rate-limiting table fallback)

---

## 4. Razorpay Webhook Configuration
1. Open the [Razorpay Dashboard](https://dashboard.razorpay.com/) and navigate to **Settings → Webhooks**.
2. Click **Add New Webhook**.
3. **Webhook URL**:
   ```
   https://<your-custom-domain.com>/api/prepmeup/payments/webhook
   ```
4. **Secret**: Enter the exact secret string assigned to `RAZORPAY_WEBHOOK_SECRET`.
5. **Active Events**:
   - `order.paid`
   - `payment.captured`
6. Save and send a test ping to confirm an HTTP `200` response.

---

## 5. Deployment Verification
1. Push git commits to `main`.
2. Vercel automatically runs `next build`.
3. Open `https://<your-custom-domain.com>/prepmeup` and execute the steps in `docs/prepmeup/launch-checklist.md`.

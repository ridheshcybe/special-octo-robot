# PrepMeUp AI — Final Launch QA & Pre-Flight Checklist

Complete this checklist prior to flipping production DNS or announcing public availability.

---

### 1. Database & Row-Level Security (RLS)
- [ ] **Unpublished Draft Isolation**: Verify that a non-admin client cannot fetch notes or syllabus items with `is_published = false`.
- [ ] **User Data Isolation**: Test that student profile `user_A` cannot query or mutate `user_B`'s `pmu_quiz_attempts`, `pmu_quiz_answers`, or `pmu_doubts`.
- [ ] **Service Role Protection**: Confirm that `PMU_SUPABASE_SERVICE_ROLE_KEY` is not bundled into client JavaScript bundles (zero instances in `public/` or `.next/static`).

### 2. WhatsApp OTP & Authentication
- [ ] **Real Device Delivery**: Test OTP generation with an active Indian mobile number (`+91XXXXXXXXXX`) to confirm delivery to WhatsApp within 10 seconds.
- [ ] **Rate Limiting**: Attempt to request 4 OTPs in under 10 minutes to verify HTTP 429 throttling.
- [ ] **Invalid Code Invalidation**: Test that entering 5 consecutive incorrect OTPs locks the session and requires requesting a new code.
- [ ] **Session Persistence**: Confirm SSR cookie `pmu_session` retains login state upon browser refresh and client-side navigation.

### 3. Monetization & Free Seat Allocation
- [ ] **First-10 Atomic Counter**:
  - Test claiming a free pass when remaining seats are > 0. Verify the server decrements available seats atomically.
  - Verify that when `free_claimed_count >= 10`, the button is disabled and API rejects further free claims.
- [ ] **Razorpay Checkout Flow**:
  - Test end-to-end checkout with Razorpay test card.
  - Confirm client signature verification succeeds and grants instant semester pass.
  - Simulate asynchronous webhook (`order.paid`) and ensure idempotency (no duplicate entries in `pmu_subscriptions`).
- [ ] **Paywall Enforcement**:
  - Confirm locked notes, module summaries, and past paper answers display the paywall banner when logged out or unsubscribed.
  - Confirm all locked resources instantly unlock upon successful payment or free pass redemption.

### 4. Interactive Simulators & Code Sandbox
- [ ] **BEE Circuit Visualizers**:
  - Verify KVL / KCL, AC Phasor, RLC Resonance, and Thevenin visualizers calculate values cleanly without network requests.
  - Confirm responsiveness across mobile screen widths (360px – 430px).
- [ ] **Python Execution Sandbox**:
  - Run test cases in the sandboxed Pyodide / structured state engine.
  - Confirm user code cannot execute arbitrary shell commands or access Node.js server globals.

### 5. AI Doubt Engine & Vision OCR
- [ ] **Vision Ingestion**:
  - Upload a circuit diagram or handwritten calculation image (< 5MB) and verify Groq/Gemini OCR extracts text without timing out.
- [ ] **Curriculum Grounding**:
  - Ask an in-syllabus BEE question: Verify response cites module syllabus topics.
  - Ask an out-of-syllabus query (e.g., Quantum Computing): Verify the response appends:
    > *"Note: This explanation is based on general computer science knowledge and is not explicitly indexed in your university syllabus."*

### 6. Portfolio Integration & Style Isolation
- [ ] **Homepage (`/`)**:
  - Verify Hero, Marquee, Story, Selected Projects, Research, Numbers, and Courses teaser render without missing styles or rem scaling glitches.
  - Verify the **PrepMeUp AI** project card points to `/projects/prepmeup-ai`.
- [ ] **Rem Grid Immunity**:
  - Verify `html.rem-grid` is active on `/` and `/projects/prepmeup-ai`.
  - Verify `html.rem-grid` is removed on `/prepmeup` and `/courses`.
- [ ] **Admin Panels**:
  - Verify `/admin` and `/courses/admin` load and authenticate correctly.

### 7. Performance & Error Resiliency
- [ ] **Error Boundaries**: Visit `/prepmeup/non-existent-module` to confirm the custom dark brutalist 404 page renders.
- [ ] **Security Headers**: Run `curl -I https://<domain>/prepmeup` and verify `X-Frame-Options: SAMEORIGIN` and `X-Content-Type-Options: nosniff`.

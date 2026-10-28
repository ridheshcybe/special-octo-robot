# PrepMeUp AI & Portfolio — Production Verification & Optimization Checklist

**Live Domain:** [https://www.ridheshcybe.dpdns.org](https://www.ridheshcybe.dpdns.org)  
**PrepMeUp AI:** [https://www.ridheshcybe.dpdns.org/prepmeup](https://www.ridheshcybe.dpdns.org/prepmeup)  
**Razorpay Checkout:** [https://www.ridheshcybe.dpdns.org/prepmeup/checkout](https://www.ridheshcybe.dpdns.org/prepmeup/checkout)  
**Directus CMS:** [https://cms.ridheshcybe.dpdns.org](https://cms.ridheshcybe.dpdns.org)  
**PrepMeUp Admin Login:** [https://www.ridheshcybe.dpdns.org/prepmeup/admin/login](https://www.ridheshcybe.dpdns.org/prepmeup/admin/login) (`walavalkarridhesh@gmail.com` / `jelly1974`)

---

## 1. Public Routing & Portfolio Checks

- [ ] **1.1 Portfolio Home Page** (`https://www.ridheshcybe.dpdns.org`)
  - Top navigation shows **PrepMeUp AI** (and does not show the old `/courses` link).
  - Clicking **PrepMeUp AI** navigates directly to `/prepmeup`.
- [ ] **1.2 Legacy `/courses` Redirect** (`https://www.ridheshcybe.dpdns.org/courses`)
  - Visiting `/courses` or `/courses/login` immediately redirects (`307`) to `/prepmeup`.
- [ ] **1.3 PrepMeUp Case Study Page** (`https://www.ridheshcybe.dpdns.org/projects/prepmeup-ai`)
  - Architectural breakdown cards and live stats strip render cleanly.

---

## 2. Public Academic Calculators (No Login Required)

- [ ] **2.1 Top Navbar & Landing Spotlight** (`https://www.ridheshcybe.dpdns.org/prepmeup`)
  - **🎯 SGPA & CGPA** and **🏆 Rank & Percentile** buttons appear in the top navigation bar, Hero buttons, and Calculators Spotlight section.
- [ ] **2.2 SGPA & Multi-Semester CGPA Calculator** (`https://www.ridheshcybe.dpdns.org/prepmeup/tools/cgpa`)
  - **Tab 1 — Semester SGPA Calculator**:
    - Click **Load Sem 1 Subjects** or **+ Add Subject**, adjust credits and letter grades (`O`, `A+`, `A`, `B+`, etc.), and confirm SGPA (`0.00–10.00`) updates live.
  - **Tab 2 — Multi-Semester Cumulative CGPA Calculator**:
    - Add multiple semesters (`Semester 1`, `Semester 2`, etc.), enter credits and SGPA for each, and confirm Cumulative CGPA updates live.
  - Confirm AICTE mathematical formulas render in formatted LaTeX (no raw `$` text).
- [ ] **2.3 Exam Rank & Percentile Predictor** (`https://www.ridheshcybe.dpdns.org/prepmeup/tools/rank-percentile`)
  - Adjust **Your Exam Score**, **Class Average (Mean)**, **Standard Deviation**, and **Total Batch Size** sliders.
  - Confirm **Estimated Rank (`#1 / N`)**, **Cohort Percentile**, and **Z-Score** update live with rendered LaTeX equations.

---

## 3. 3-Tier Financial Model & Razorpay Checkout

- [ ] **3.1 Tier 0 (`₹0` — First 10 Students FREE | Founding Beta Testers & Testimonials)** (`https://www.ridheshcybe.dpdns.org/prepmeup#pricing`)
  - Enter a 10-digit Indian WhatsApp number (e.g., `9820743178`).
  - Select your **#1 Semester 1 Struggle** from the dropdown.
  - Ensure the **Beta Tester Pledge** checkbox is checked and click **Claim Tier 0: Free Beta Pass (First 10) →**.
  - Confirm the success screen displays your Beta Seat number (`#1/10`), lets you submit a **5-Star Rating + Testimonial Quote**, and unlocks `/prepmeup/dashboard`.
- [ ] **3.2 Tier 1 (`₹99` Basic Access) vs Tier 2 (`₹199` Premium AI + 1:1 Human + Career Support)**
  - Confirm Tier 1 (`₹99`) explicitly shows:
    - `✕ No 1:1 Human Mentorship (Tier 2 Only)`
    - `✕ No Internship & Career Support (₹199 Only)`
  - Confirm Tier 2 (`₹199`) highlights:
    - Top badge: `★ Includes Internship & Career Support`
    - Feature box: `★ ONLY IN ₹199: Internship & Career Support (Resume & GitHub Review, Referrals & Roadmap)`
- [ ] **3.3 Official Razorpay Standard Checkout** (`https://www.ridheshcybe.dpdns.org/prepmeup/checkout`)
  - Switch between **Tier 2 (`₹199`)** and **Tier 1 (`₹99`)** and verify total payable updates (`₹199` vs `₹99`).
  - Enter **Student Full Name**, **WhatsApp Number**, and (for Tier 2) select a **1:1 Mentorship & Career Focus** (`★ Internship & Career Support`, `ACM-101`, `PYT-102`, `BEE-103`, `COA-104`).
  - Click **Pay via Razorpay**:
    - Confirm the official **Razorpay Checkout modal** opens with a live `order_...` ID.
    - **Test Modal Dismiss**: Close the modal without paying and verify the page displays a clear retry message.
    - **Test Successful Payment**: Complete payment using Razorpay Test UPI (`success@razorpay`) or Netbanking $\to$ **Success**, and confirm the **Verified Razorpay Receipt** displays Order ID, Payment ID, Amount Paid, and unlocks `/prepmeup/dashboard`.

---

## 4. Student Portal & Live Groq AI Engines

- [ ] **4.1 Student Dashboard & Beta Feedback Extractor** (`https://www.ridheshcybe.dpdns.org/prepmeup/dashboard`)
  - Confirm the **🔥 Tier 0 Beta Tester & Testimonial Program** banner appears at the top of the dashboard.
  - Submit an improvement suggestion + testimonial quote + star rating and confirm the green confirmation state appears.
- [ ] **4.2 Subject Notes — Sample & Non-Sample LaTeX Rendering** (`https://www.ridheshcybe.dpdns.org/prepmeup/subjects/applied-computational-mathematics`)
  - Confirm **both Sample Notes and Non-Sample Unit Notes** render formatted mathematical equations (display math blocks, fractions, matrices, square roots, Greek symbols, tables, and code blocks) directly inline in the **Syllabus & Unit Notes** tab.
  - Click **Expand Fullscreen →** on any topic to verify the fullscreen LaTeX modal reader.
  - Switch to the **Featured Chapter Note (LaTeX)** tab and confirm all Sample and Non-Sample notes render cleanly.
  - Switch to the **Past Papers & Solved PYQs** tab and click **View Solved LaTeX Key →**.
- [ ] **4.3 Live Groq AI Doubt Solver** (`https://www.ridheshcybe.dpdns.org/prepmeup/doubts`)
  - Select a subject, click a quick prompt chip (or type a custom question), and click **Submit Doubt to AI Tutor →**.
  - Confirm the **Interactive Waiting Mini-Game** (Digital Logic Gate Simulator / Exam Flashcards) appears while waiting.
  - Confirm a green **Doubt Submitted & Answered** confirmation banner appears and both the **Student Request** and **AI Verified Solution** cards render with formatted LaTeX and code blocks.
- [ ] **4.4 Topic-Wise Quizzes & Post-Submission Diagnostics** (`https://www.ridheshcybe.dpdns.org/prepmeup/quizzes`)
  - Open any quiz (e.g., `/prepmeup/quizzes/quiz-bee-1`), select answers, and click **Submit Quiz & View Explanations →**.
  - Confirm the green **Quiz Submitted Successfully** banner appears at the top.
  - Confirm wrong/unattempted questions display a red **Mistake / Error Diagnostic** box and every question displays a **Step-by-Step LaTeX Explanation**.
- [ ] **4.5 Python Coding Lab (with Input/Output Examples)** (`https://www.ridheshcybe.dpdns.org/prepmeup/coding`)
  - Click the preset challenge buttons (`Matrix Trace`, `Ohm's Law Solver`, `Prime Sieve`) and confirm **Sample Input**, **Expected Output**, and **Explanation** populate in the Input/Output specification cards.
  - Click **Submit & Analyze Code →** and confirm the green submission confirmation banner, **Error / Bug Diagnostics**, and **Step-by-Step Code Explanation** render cleanly.
- [ ] **4.6 Interactive BEE & Python Simulations** (`https://www.ridheshcybe.dpdns.org/prepmeup/simulations`)
  - Verify all 10 simulation cards display rendered formulas (no raw `$` LaTeX strings).
  - Open **Ohm's Law (`/prepmeup/simulations/ohms-law`)** and **Recursion Call Stack (`/prepmeup/simulations/call-stack`)** and test interactive sliders/buttons.
- [ ] **4.7 Progress & Submission Error Review** (`https://www.ridheshcybe.dpdns.org/prepmeup/progress`)
  - Click **View Explanation & Error Diagnostics ↓** on recent quiz and coding submissions to inspect root-cause mistakes and step-by-step LaTeX/code explanations.

---

## 5. Admin Portal & Directus CMS

- [ ] **5.1 PrepMeUp Admin Portal** (`https://www.ridheshcybe.dpdns.org/prepmeup/admin/login`)
  - Log in with:
    - **Email:** `walavalkarridhesh@gmail.com`
    - **Password:** `jelly1974`
  - Verify Syllabus, Study Notes, Past Papers, Quizzes, and AI Content Drafts pages load without errors.
- [ ] **5.2 Directus Headless CMS** (`https://cms.ridheshcybe.dpdns.org`)
  - Verify Directus login page loads over HTTPS via Cloudflare Tunnel.

---

## 6. Performance Optimization Guide

### A. Codebase & Docker Optimizations (Already Active)
1. **Zero Dead Database Calls (`~12ms–25ms` SSR)**:
   - `app/prepmeup/_lib/supabaseServer.ts` and `app/prepmeup/_lib/queries.ts` no longer query the main portfolio's Supabase URL for `pmu_*` tables unless `NEXT_PUBLIC_PMU_SUPABASE_URL` is explicitly configured.
2. **Next.js 16 Standalone Build in Alpine Docker (`pmu_web`)**:
   - `output: "standalone"` in `next.config.mjs` pre-compiles all 63 routes and runs them inside a lightweight `node:22-alpine` container (`restart: unless-stopped`).
3. **Immutable 1-Year Static Caching + HTTP Compression**:
   - `Cache-Control: public, max-age=31536000, immutable` is set on `/_next/static/:path*` with `compress: true` enabled.
4. **Live Groq AI (`llama-3.3-70b-versatile`)**:
   - `lib/prepmeup/ai-tutor.ts` and `lib/prepmeup/ai.ts` use your `GROQ_API_KEY` for sub-second AI doubt resolution and Python debugging.

### B. Cloudflare Dashboard Optimizations (Recommended 2-Minute Toggle)
Log in to [dash.cloudflare.com](https://dash.cloudflare.com) $\to$ select `ridheshcybe.dpdns.org`:
- [ ] **1. Speed $\to$ Optimization $\to$ Content Optimization**:
  - Enable **Brotli** compression.
  - Enable **Early Hints**.
- [ ] **2. Speed $\to$ Optimization $\to$ Protocol Optimization**:
  - Enable **HTTP/3 (with QUIC)**.
  - Enable **0-RTT Connection Resumption**.
- [ ] **3. Caching $\to$ Configuration**:
  - Set **Browser Cache TTL** to **Respect Existing Headers**.
- [ ] **4. Caching $\to$ Tiered Cache**:
  - Enable **Smart Tiered Caching Topology**.

---

## 7. Quick Docker Reload Command (After Any `.env` or Code Change)

Whenever you update `.env` (for example, swapping `rzp_test_...` keys for `rzp_live_...` keys), run this single command from `c:\Users\admin\Downloads\code\portfolio`:

```powershell
npm run build; Copy-Item -Recurse -Force .next\static .next\standalone\.next\; Copy-Item -Recurse -Force public .next\standalone\; cd deploy\cms; docker compose up -d --force-recreate web
```

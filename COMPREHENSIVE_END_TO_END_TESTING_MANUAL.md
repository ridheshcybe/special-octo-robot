# PrepMeUp AI & Portfolio — Comprehensive End-to-End Testing Manual

> **Scope:** Full-Stack Academic Platform (Next.js 16 Standalone, Directus Headless CMS, PostgreSQL 16, Razorpay Live Payment Gateway, Cloudflare Zero Trust Tunnel, Pyodide WASM, Groq AI Engine).  
> **Production URL:** [https://www.ridheshcybe.dpdns.org](https://www.ridheshcybe.dpdns.org)  
> **PrepMeUp AI Hub:** [https://www.ridheshcybe.dpdns.org/prepmeup](https://www.ridheshcybe.dpdns.org/prepmeup)  
> **Support Helpline:** `+91 98207 43178` | `walavalkarridhesh@gmail.com`  
> **Last Updated:** October 28, 2026

---

## Table of Contents
1. [Test Suite 1: Infrastructure, Networking & Security Protocols](#test-suite-1-infrastructure-networking--security-protocols)
2. [Test Suite 2: Public Portfolio & Routing Integrity](#test-suite-2-public-portfolio--routing-integrity)
3. [Test Suite 3: Public Academic Calculators (Zero Login)](#test-suite-3-public-academic-calculators-zero-login)
4. [Test Suite 4: Student Authentication & Onboarding](#test-suite-4-student-authentication--onboarding)
5. [Test Suite 5: 3-Tier Financial Model & Razorpay Checkout Suite](#test-suite-5-3-tier-financial-model--razorpay-checkout-suite)
6. [Test Suite 6: Daily High-Yield Academic Capsule & Notification System](#test-suite-6-daily-high-yield-academic-capsule--notification-system)
7. [Test Suite 7: Academic Curriculum & LaTeX Notes Library](#test-suite-7-academic-curriculum--latex-notes-library)
8. [Test Suite 8: Live Groq AI Doubt Solver & Wait Mini-Lab](#test-suite-8-live-groq-ai-doubt-solver--wait-mini-lab)
9. [Test Suite 9: In-Browser Python Coding Lab (Pyodide WASM)](#test-suite-9-in-browser-python-coding-lab-pyodide-wasm)
10. [Test Suite 10: Interactive Hardware & Logic Simulations](#test-suite-10-interactive-hardware--logic-simulations)
11. [Test Suite 11: Admin Command Center & Directus Headless CMS](#test-suite-11-admin-command-center--directus-headless-cms)
12. [Test Suite 12: Legal Compliance & Merchant Helpline](#test-suite-12-legal-compliance--merchant-helpline)
13. [Test Suite 13: Responsive Design & Cross-Device Resilience](#test-suite-13-responsive-design--cross-device-resilience)
14. [Defect Reporting & Severity Matrix](#defect-reporting--severity-matrix)

---

## Test Suite 1: Infrastructure, Networking & Security Protocols

### Test 1.1: Cloudflare Tunnel & SSL/TLS Termination
- **URL:** [https://www.ridheshcybe.dpdns.org](https://www.ridheshcybe.dpdns.org)
- **Action:** Open in browser and click the padlock icon in the address bar.
- **Expected Result:**
  - Connection is encrypted using TLS 1.3 with a valid Cloudflare edge certificate.
  - No mixed-content warnings in DevTools Console.
  - Zero exposed inbound ports on the host machine.
- **Potential Breakage Point:** Expired tunnel token, cloudflared container stoppage, or misconfigured DNS CNAME record in Cloudflare Zero Trust dashboard.

### Test 1.2: Docker Container Health & Process Isolation
- **Command:** `docker ps`
- **Action:** Run in terminal.
- **Expected Result:**
  - `pmu_web` is running on port `0.0.0.0:3001->3001/tcp`.
  - `pmu_directus` is running on port `0.0.0.0:8055->8055/tcp`.
  - `pmu_postgres` reports `Up (healthy)` on port `5432/tcp`.
  - `pmu_postgres_backup` reports `Up (healthy)`.
  - `pmu_cloudflared` is running without restart loops.
- **Potential Breakage Point:** Out of memory (OOM) kill on low-RAM VPS, unhandled Node.js exception killing PID 1 in container.

### Test 1.3: Automated Database Snapshot Verification
- **Command:** `Get-ChildItem -Path deploy\cms\backups\` (Windows) or `ls -lh deploy/cms/backups/` (Linux).
- **Action:** Inspect backup directory.
- **Expected Result:**
  - SQL dump archives (`.sql.gz`) exist with timestamps matching daily cron `@daily`.
- **Potential Breakage Point:** Full disk volume stopping backup script, incorrect `POSTGRES_PASSWORD` environment variable.

### Test 1.4: Client-Side DRM & Watermark Shield
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/subjects/applied-computational-mathematics](https://www.ridheshcybe.dpdns.org/prepmeup/subjects/applied-computational-mathematics)
- **Actions:**
  1. Attempt to select text and press `Ctrl+C` or right-click.
  2. Press `F12`, `Ctrl+Shift+I`, or `Ctrl+U`.
  3. Inspect the background of note content cards.
- **Expected Result:**
  - Copy and context menu events are prevented with non-intrusive notification.
  - DevTools shortcut keys are blocked.
  - Diagonal canvas watermark overlay displays logged-in student's full name, phone number, and timestamp.
- **Potential Breakage Point:** Content visible without watermark if JavaScript is disabled via browser settings (mitigated by `<noscript>` tags hiding sensitive blocks).

### Test 1.5: Structured JSON Logging & Sensitive Key Redaction
- **Command:** `docker logs --tail 30 pmu_web`
- **Action:** Inspect output after initiating payment or API calls.
- **Expected Result:**
  - Single-line JSON log output containing `timestamp`, `level`, `context`, `message`, `durationMs`, `ip`, and sanitized `data`.
  - Sensitive keys (`password`, `key_secret`, `token`, `otp`, `signature`, `cookie`) display `"[REDACTED]"`.
- **Potential Breakage Point:** Secret leaks occurring if an API handler bypasses `lib/logger.ts` and calls raw `console.log(process.env)`.

---

## Test Suite 2: Public Portfolio & Routing Integrity

### Test 2.1: Portfolio Landing & Brand Shell
- **URL:** [https://www.ridheshcybe.dpdns.org](https://www.ridheshcybe.dpdns.org)
- **Actions:**
  1. Load page from clean cache.
  2. Scroll down through Hero, Numbers, Projects, Research, Story, and Contact sections.
  3. Observe preloader and letter-reveal animations.
- **Expected Result:**
  - Preloader transitions smoothly into brutalist dark layout (`#08080a`).
  - Top navigation displays **PrepMeUp AI** linking to `/prepmeup`.
  - GitHub numbers ticker animates smoothly.
- **Potential Breakage Point:** CSS animation stutter on low-end mobile devices without `prefers-reduced-motion` support.

### Test 2.2: Legacy `/courses` Redirect Guard
- **URLs to test:**
  - `https://www.ridheshcybe.dpdns.org/courses`
  - `https://www.ridheshcybe.dpdns.org/courses/login`
  - `https://www.ridheshcybe.dpdns.org/courses/dashboard`
- **Action:** Enter each URL directly into browser.
- **Expected Result:**
  - Immediate `307 Temporary Redirect` to [https://www.ridheshcybe.dpdns.org/prepmeup](https://www.ridheshcybe.dpdns.org/prepmeup).
  - No 404 Not Found error.
- **Potential Breakage Point:** Infinite redirect loop if Next.js proxy/middleware does not match exact path prefixes.

### Test 2.3: PrepMeUp AI Case Study Page
- **URL:** [https://www.ridheshcybe.dpdns.org/projects/prepmeup-ai](https://www.ridheshcybe.dpdns.org/projects/prepmeup-ai)
- **Action:** Review architecture breakdown cards and live stats strip.
- **Expected Result:**
  - Page renders with `HTTP 200 OK`.
  - Links to live platform (`/prepmeup`) work properly.
- **Potential Breakage Point:** Broken asset links for architecture diagrams.

---

## Test Suite 3: Public Academic Calculators (Zero Login)

### Test 3.1: Single Semester SGPA Calculator (`/prepmeup/tools/cgpa`)
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/tools/cgpa](https://www.ridheshcybe.dpdns.org/prepmeup/tools/cgpa)
- **Tab:** **Tab 1 — Semester SGPA Calculator**
- **Actions:**
  1. Click **Load Sem 1 Subjects** preset button.
  2. Confirm 6 subjects load (ACM, BEEE, COA, FWT, Python, IKS) with appropriate credits (3 to 4 credits each).
  3. Change all grades to `O` (Grade Point 10).
  4. Change one grade to `F` (Grade Point 0).
  5. Click **+ Add Subject** to add a custom row (e.g. "Linear Algebra", 3 credits, grade `A`).
  6. Click the trash icon to delete a row.
- **Expected Result:**
  - All `O`s yields `SGPA: 10.00 / 10.00`.
  - Introducing `F` drops SGPA according to the AICTE formula:
    $$\text{SGPA} = \frac{\sum (C_i \cdot G_i)}{\sum C_i}$$
  - Formula displays rendered KaTeX math without unescaped HTML entities (`&lt;span&gt;`).
- **Potential Breakage Point:** `NaN` displaying if credits input is empty or zero, division by zero if all courses have 0 credits.

### Test 3.2: Multi-Semester Cumulative CGPA Calculator (`/prepmeup/tools/cgpa`)
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/tools/cgpa](https://www.ridheshcybe.dpdns.org/prepmeup/tools/cgpa)
- **Tab:** **Tab 2 — Multi-Semester Cumulative CGPA Calculator**
- **Actions:**
  1. Enter:
     - Semester 1: `20` Credits, `8.50` SGPA
     - Semester 2: `22` Credits, `9.10` SGPA
  2. Click **+ Add Semester** and enter:
     - Semester 3: `18` Credits, `7.80` SGPA
  3. Click **- Remove** on Semester 3.
- **Expected Result:**
  - Cumulative CGPA recalculates dynamically:
    $$\text{CGPA} = \frac{(20 \times 8.5) + (22 \times 9.1)}{20 + 22} = \frac{170 + 200.2}{42} = \frac{370.2}{42} \approx 8.81$$
  - Displays grade card interpretation badge (`First Class with Distinction`).
- **Potential Breakage Point:** Non-numeric characters typed into SGPA input causing `NaN`.

### Test 3.3: Exam Rank & Cohort Percentile Predictor (`/prepmeup/tools/rank-percentile`)
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/tools/rank-percentile](https://www.ridheshcybe.dpdns.org/prepmeup/tools/rank-percentile)
- **Actions:**
  1. Move **Your Exam Score ($X$)** slider to `85`.
  2. Set **Class Average ($\mu$)** to `60`.
  3. Set **Standard Deviation ($\sigma$)** to `10`.
  4. Set **Total Batch Size ($N$)** to `120`.
  5. Test Edge Cases:
     - Score equal to mean ($X = 60$).
     - Score at maximum ($X = 100$).
     - Score below mean ($X = 35$).
- **Expected Result:**
  - For $X=85, \mu=60, \sigma=10$:
    $$Z = \frac{85 - 60}{10} = +2.50$$
    Percentile shows `~99.38%`, Predicted Rank shows `#1 / 120`.
  - For $X = 60$: $Z = 0.00$, Percentile shows `50.00%`, Predicted Rank shows `#60 / 120`.
  - Gaussian bell curve visualization highlights the student's relative cohort standing.
- **Potential Breakage Point:** Standard deviation slider set to `0` causing divide-by-zero (handled by minimum bound $\sigma \ge 1$).

---

## Test Suite 4: Student Authentication & Onboarding

### Test 4.1: Login Validation (`/prepmeup/login`)
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/login](https://www.ridheshcybe.dpdns.org/prepmeup/login)
- **Actions:**
  1. Enter 9 digits: `982074317` &rarr; Click **Send Verification OTP →**.
  2. Enter letters: `abcdefghij` &rarr; Click button.
  3. Enter valid 10-digit phone: `9820743178` &rarr; Click button.
- **Expected Result:**
  - Inputs with less than 10 digits or non-digits show red validation error: `Please enter a valid 10-digit Indian mobile number`.
  - Valid number transitions smoothly to the OTP verification screen.
- **Potential Breakage Point:** Leading zeros (`098207...`) or country codes (`+91`) corrupting the 10-digit parser.

### Test 4.2: OTP Verification & Session Provisioning
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/verify-otp](https://www.ridheshcybe.dpdns.org/prepmeup/verify-otp)
- **Actions:**
  1. Enter invalid OTP `000000` &rarr; Verify error alert: `Invalid OTP code`.
  2. Enter valid test OTP (configured in environment or Twilio) &rarr; Click **Verify & Access Workspace →**.
- **Expected Result:**
  - Returns `HTTP 200 OK` with encrypted `pmu-session` cookie (`HttpOnly; SameSite=Lax`).
  - Redirects to `/prepmeup/dashboard`.
- **Potential Breakage Point:** Cookie expiration or browser third-party cookie blockers if domain does not match.

### Test 4.3: Session Logout
- **Action:** Inside student workspace, click **Sign Out** button in the sidebar or top header.
- **Expected Result:**
  - Calls `POST /api/prepmeup/auth/logout`.
  - Clears `pmu-session` cookie.
  - Redirects immediately to `/prepmeup/login`.
  - Clicking browser **Back** button redirects back to login and denies unauthenticated access.
- **Potential Breakage Point:** Cached pages rendering protected content from browser back-forward cache (`bfcache`) (prevented by `Cache-Control: no-store` headers).

---

## Test Suite 5: 3-Tier Financial Model & Razorpay Checkout Suite

### Test 5.1: Tier 0 Beta Pass Free Claim (`/prepmeup#pricing`)
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup#pricing](https://www.ridheshcybe.dpdns.org/prepmeup#pricing)
- **Actions:**
  1. Scroll down to Tier 0 card.
  2. Enter WhatsApp number: `9820743178`.
  3. Select struggle: `ACM-101: Linear Algebra & Matrix Proofs`.
  4. Ensure **Beta Tester Pledge** checkbox is checked.
  5. Click **Claim Tier 0: Free Beta Pass (First 10) →**.
- **Expected Result:**
  - Calls `POST /api/prepmeup/payments/claim-free`.
  - Decrements live seat counter (`#X/10 Claimed`).
  - Displays green confirmation screen with feedback prompt.
  - Grants full 180-day Semester 1 access without charging payment.
- **Potential Breakage Point:** Claiming twice with the same WhatsApp number should gracefully log the student back in rather than erroring.

### Test 5.2: Direct Standalone Razorpay Checkout (`/checkout`)
- **URL:** [https://www.ridheshcybe.dpdns.org/checkout](https://www.ridheshcybe.dpdns.org/checkout)
- **Actions:**
  1. Confirm preselected amount is **₹1.00 (Test Min)**.
  2. Confirm prefilled phone is `9820743178`.
  3. Click **Pay ₹1.00 via Razorpay Standard Checkout**.
  4. **Test Modal Dismissal:** When the Razorpay payment sheet opens, click the `✕` close button in the top right.
- **Expected Result:**
  - Modal closes cleanly.
  - Page displays amber warning: `Payment cancelled or dismissed. Click the button above to retry.`
  - Zero JavaScript errors or page crashes.
- **Potential Breakage Point:** Modal hanging open if script tag fails to inject or popup blocker intercepts checkout.

### Test 5.3: Live Real ₹1.00 Payment Transaction
- **URL:** [https://www.ridheshcybe.dpdns.org/checkout](https://www.ridheshcybe.dpdns.org/checkout)
- **Actions:**
  1. Click **Pay ₹1.00 via Razorpay Standard Checkout**.
  2. In the Razorpay modal, select **UPI** &rarr; Scan QR Code with Google Pay / PhonePe / Paytm (or enter your VPA).
  3. Authorize the ₹1.00 transaction on your phone.
- **Expected Result:**
  - Razorpay modal verifies payment and triggers client callback with `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`.
  - Calls `POST /api/verify-payment`.
  - Backend verifies HMAC-SHA256 signature against `RAZORPAY_KEY_SECRET`.
  - Verified receipt card renders with green badge: `Payment Verified & Active`.
  - Displays Order ID (`order_...`) and Payment ID (`pay_...`).
  - Button **Access Student Workspace →** unlocks `/prepmeup/dashboard`.
- **Potential Breakage Point:** Bank UPI timeout or delay. Handled by background webhook listener.

### Test 5.4: Security Tamper Test (Invalid Signature)
- **Command:** Run API tamper test via terminal:
  ```powershell
  python -c "import requests; r = requests.post('https://www.ridheshcybe.dpdns.org/api/verify-payment', json={'razorpay_order_id':'order_fake123','razorpay_payment_id':'pay_fake123','razorpay_signature':'tampered_bad_sig'}); print(r.status_code, r.json())"
  ```
- **Expected Result:**
  - Returns `HTTP 400 Bad Request`.
  - Response body: `{"ok": false, "verified": false, "error": "Signature mismatch: Invalid Razorpay cryptographic signature."}`.
  - Access is NOT granted.
  - Structured log prints warning event: `Cryptographic signature mismatch`.
- **Potential Breakage Point:** Insecure payment validation that trusts client status without verifying HMAC signature.

---

## Test Suite 6: Daily High-Yield Academic Capsule & Notification System

### Test 6.1: Global Notification Banner Display
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/dashboard](https://www.ridheshcybe.dpdns.org/prepmeup/dashboard)
- **Actions:**
  1. Inspect the top bar of the page.
  2. Observe pulsing bell badge: `🔔 New Daily Drop: Series Resonance, Quality Factor (Q) & Half-Power Frequencies in RLC Circuits • +50 XP`.
  3. Click **Study Capsule & Quiz →**.
- **Expected Result:**
  - Page smoothly scrolls directly to the `#daily-capsule` section.
- **Potential Breakage Point:** Banner overlapping top navigation drawer on small mobile screens (fixed with responsive `flexWrap: wrap`).

### Test 6.2: Notification Dismissal Persistence
- **Action:** Click the `✕` close button on the notification banner.
- **Expected Result:**
  - Banner vanishes immediately.
  - Dismissal ID is written to `localStorage` under `pmu_dismissed_notif_id`.
  - Refreshing the page keeps the banner hidden.
  - When a *new* topic is published with a new ID, the banner reappears automatically.
- **Potential Breakage Point:** Corrupted `localStorage` data throwing an uncaught exception.

### Test 6.3: 60-Second Exam Summary Tab
- **Actions:**
  1. In the Daily Capsule card, click **⚡ 60-Second Exam Summary**.
  2. Read bullet points.
- **Expected Result:**
  - All mathematical equations (e.g. $f_0 = \frac{1}{2\pi\sqrt{LC}}$, $Q = \frac{\omega_0 L}{R}$, $BW = \frac{f_0}{Q}$) render cleanly via KaTeX.
  - No raw `$` characters or unparsed LaTeX macros.
- **Potential Breakage Point:** Unescaped backslashes in AI response breaking markdown parser.

### Test 6.4: Deep High-Yield Notes Tab
- **Actions:**
  1. Click **📖 Deep High-Yield Notes & Derivations**.
  2. Inspect definitions, circuit schematics, derivations, and worked numerical proofs.
- **Expected Result:**
  - Multi-line display equations render centered in display blocks ($$...$$).
  - Worked numerical example with exact parameter numbers ($R=5\,\Omega, L=200\,\mu\text{H}, C=20\,\text{nF}$) calculates $f_0 \approx 79.58\text{ kHz}$.
- **Potential Breakage Point:** Long equations overflowing horizontally on narrow mobile screens (handled by `overflow-x: auto` on math containers).

### Test 6.5: Interactive 3-Question Diagnostic Quiz
- **Actions:**
  1. Click **🎯 Daily Diagnostic Quiz (3 Qs)**.
  2. On Question 1, select an option (A, B, C, or D).
  3. Click **Check Answer →**.
  4. If correct, verify green badge: `✓ Correct (+15 XP)`.
  5. If incorrect, verify red badge: `✕ Incorrect`.
  6. Verify step-by-step LaTeX explanation card expands below.
  7. Complete Questions 2 and 3.
- **Expected Result:**
  - After answering all 3 questions, the completion banner triggers:  
    `🎉 Daily Capsule Completed! Score: X / 3 • You have earned +50 XP and updated your study streak.`
  - Saves completed capsule ID in `localStorage` under `pmu_completed_capsules`.
- **Potential Breakage Point:** Changing answer after submitting (prevented by disabling radio buttons post-check).

### Test 6.6: Admin AI Capsule Generation & Broadcast
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/admin/content-studio](https://www.ridheshcybe.dpdns.org/prepmeup/admin/content-studio)
- **Actions:**
  1. Locate the top card: **🔥 Daily High-Yield Capsule & Broadcast Hub**.
  2. Select target subject: `CSE1003: Computer Organization & Architecture`.
  3. Type custom topic: `Booth's Multiplication Algorithm with Step-by-Step Register Trace`.
  4. Click **⚡ Generate Daily Note, Quiz & Summary with AI →**.
  5. Wait ~3–5 seconds while Groq AI drafts the capsule.
  6. Review generated Summary, Notes, and Quiz tabs in the preview card.
  7. Click **🚀 Broadcast to All Students (+50 XP Drop) →**.
- **Expected Result:**
  - Green alert appears: `🚀 Capsule published and broadcast to all students! The notification banner is now active across the platform.`
  - Updates `deploy/cms/daily_note.json`.
  - Student dashboard now displays Booth's Multiplier capsule with new notification ID.
- **Potential Breakage Point:** Groq API rate limit or model timeout (handled with fallback model `qwen/qwen3.8-27b`).

---

## Test Suite 7: Academic Curriculum & LaTeX Notes Library

### Test 7.1: Applied Computational Mathematics (CSE1001)
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/subjects/applied-computational-mathematics](https://www.ridheshcybe.dpdns.org/prepmeup/subjects/applied-computational-mathematics)
- **Topics to verify:**
  - Matrix Rank, Echelon Form & System Consistency ($AX = B$).
  - Cayley-Hamilton Theorem & Matrix Inverse Shortcut ($A^{-1} = \frac{1}{\det A}(\text{Tr}(A)I - A)$).
  - Vector Spaces, Subspaces & Gram-Schmidt Orthogonalization.
  - Eigenvalues, Eigenvectors & Diagonalization ($P^{-1}AP = D$).
- **Expected Result:**
  - KaTeX matrix blocks ($\begin{bmatrix} ... \end{bmatrix}$) render with proper brackets and aligned columns.
  - "Expand Fullscreen" button opens distraction-free reading modal.
- **Potential Breakage Point:** Syntax errors in nested LaTeX matrices.

### Test 7.2: Basic Electrical & Electronics Engineering (CSE1002)
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/subjects/basic-electrical-and-electronics-engineering](https://www.ridheshcybe.dpdns.org/prepmeup/subjects/basic-electrical-and-electronics-engineering)
- **Laboratory Experiments 1 to 5 to verify:**
  - Exp 1: Verification of KCL & KVL (circuit loop diagrams + observation tables).
  - Exp 2: Verification of Thévenin’s & Norton’s Theorems ($V_{th}, R_{th}, I_N$).
  - Exp 3: Verification of Superposition Theorem (dual independent DC sources).
  - Exp 4: R-L-C Series Resonance Circuit ($f_r, Q, BW$).
  - Exp 5: Single-Phase Transformer Load Test (efficiency $\eta\%$ and voltage regulation curves).
- **Expected Result:**
  - All 5 observation tables display formatted headers, units (V, mA, $\Omega$, Hz), and sample calculation columns.
- **Potential Breakage Point:** Markdown tables breaking if pipe characters (`|`) inside LaTeX math are unescaped.

### Test 7.3: Computer Organization & Architecture (CSE1003)
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/subjects/computer-organization-and-architecture](https://www.ridheshcybe.dpdns.org/prepmeup/subjects/computer-organization-and-architecture)
- **Topics to verify:**
  - Booth's Algorithm step-by-step multiplication trace table with registers $A, Q, Q_{-1}$ and arithmetic right shift (`ASHR`).
  - IEEE-754 Single (32-bit) and Double (64-bit) precision floating-point conversions.
  - Solved Assignment 1 & Assignment 2 exam questions.
- **Expected Result:**
  - Binary bits, sign bits, biased exponents, and mantissas are highlighted in monospace code blocks.
- **Potential Breakage Point:** Bit alignment issues on mobile screens.

### Test 7.4: Fundamental Web Technologies (CSE1004)
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/subjects/fundamental-web-technologies](https://www.ridheshcybe.dpdns.org/prepmeup/subjects/fundamental-web-technologies)
- **Topics to verify:**
  - Semantic HTML5 structure templates.
  - CSS3 Flexbox & CSS Grid responsive layouts.
  - JavaScript client-side form validation using regular expressions.
- **Expected Result:**
  - Code syntax highlighting active with copy code snippet button.

### Test 7.5: Python for Engineers (CSE1005)
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/subjects/python-programming](https://www.ridheshcybe.dpdns.org/prepmeup/subjects/python-programming)
- **Topics to verify:**
  - OOP classes, inheritance, polymorphism, and dunder methods (`__init__`, `__str__`).
  - Generator functions, `yield` expressions, and memory profiling.
  - NumPy matrix operations and exception hierarchies.

### Test 7.6: Indian Knowledge Systems (CSE1006)
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/subjects/indian-knowledge-systems](https://www.ridheshcybe.dpdns.org/prepmeup/subjects/indian-knowledge-systems)
- **Topics to verify:**
  - Vedic Sutras (*Nikhilam*, *Urdhva Tiryagbhyam*, *Ekadhikena Purvena*).
  - Ancient Indian metallurgy (Wootz crucible steel, Delhi Iron Pillar corrosion resistance).
  - Town planning in Harappa & Mohenjo-Daro.

### Test 7.7: Interactive Visual Atlas (`/atlas.html`)
- **URL:** [https://www.ridheshcybe.dpdns.org/atlas.html](https://www.ridheshcybe.dpdns.org/atlas.html)
- **Action:** Open in browser and interact with matrix solvers and circuit simulations.
- **Expected Result:**
  - Interactive HTML5 canvas widgets render with zero console errors.

---

## Test Suite 8: Live Groq AI Doubt Solver & Wait Mini-Lab

### Test 8.1: Submitting an Engineering Math Query
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/doubts](https://www.ridheshcybe.dpdns.org/prepmeup/doubts)
- **Actions:**
  1. Select subject: **Applied Computational Mathematics (CSE1001)**.
  2. Click prompt chip: `How do I find eigenvalues of a 2x2 matrix?`.
  3. Click **Submit Doubt to AI Tutor →**.
- **Expected Result:**
  - **Interactive Wait Mini-Lab** appears immediately:
    - Click **AND**, **OR**, **XOR** logic gate buttons &rarr; Pulses counter increments, gate output updates.
    - Flip rapid revision flashcard &rarr; Card flips with Semester 1 concept.
  - Within 1–2 seconds, AI tutor returns structured response:
    - Green confirmation banner: `Doubt Submitted & Answered`.
    - KaTeX display equations render matrix determinants and characteristic roots.
- **Potential Breakage Point:** AI hallucinations or raw unparsed markdown.

### Test 8.2: Submitting a Python Bug / Traceback Query
- **Actions:**
  1. Select subject: **Python for Engineers (CSE1005)**.
  2. Paste code with intentional bug:
     ```python
     def calculate_avg(nums):
         return sum(nums) / len(nums)
     print(calculate_avg([]))
     ```
  3. Click **Submit Doubt to AI Tutor →**.
- **Expected Result:**
  - AI identifies `ZeroDivisionError: division by zero`.
  - Provides corrected code with guard clause (`if not nums: return 0`).
  - Code syntax highlighted cleanly.
- **Potential Breakage Point:** Multiline indentation stripped during API transmission.

---

## Test Suite 9: In-Browser Python Coding Lab (Pyodide WASM)

### Test 9.1: Pyodide WASM Initialization
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/coding](https://www.ridheshcybe.dpdns.org/prepmeup/coding)
- **Actions:**
  1. Open page and observe loading badge in code runner toolbar.
- **Expected Result:**
  - Loads Pyodide WebAssembly package into browser memory.
  - Displays green status indicator: `● Python 3.11 WASM Ready`.
- **Potential Breakage Point:** Slow initial CDN download on weak cellular connections (mitigated by caching WASM binaries in browser IndexedDB).

### Test 9.2: Running Challenge Presets
- **Actions:**
  1. Click **Matrix Trace Challenge** preset.
  2. Click **Submit & Analyze Code →**.
- **Expected Result:**
  - Executes code locally inside WebAssembly sandbox.
  - Output terminal displays:
    ```
    === Execution Output ===
    Matrix diagonal: [4, 5, 6]
    Trace result: 15
    [PASS] Test Case 1: Square 3x3 matrix -> 15
    [PASS] Test Case 2: Identity 4x4 matrix -> 4
    All Test Cases Passed! (+25 XP)
    ```
- **Potential Breakage Point:** Infinite `while True:` loop freezing browser tab (handled by Pyodide execution timeout interrupt).

---

## Test Suite 10: Interactive Hardware & Logic Simulations

### Test 10.1: Ohm's Law & Circuit Parameters (`/prepmeup/simulations/ohms-law`)
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/simulations/ohms-law](https://www.ridheshcybe.dpdns.org/prepmeup/simulations/ohms-law)
- **Actions:**
  1. Adjust **Voltage ($V$)** slider from `0V` to `24V`.
  2. Adjust **Resistance ($R$)** slider from `10\Omega` to `1000\Omega`.
- **Expected Result:**
  - Current $I = \frac{V}{R}$ recalculates instantly with milliamps/amps conversion.
  - Power dissipation $P = V \cdot I$ updates live.
  - Circuit schematic color temperature reflects resistor heating.
- **Potential Breakage Point:** Setting resistance to zero (slider clamped at $R \ge 1\Omega$).

### Test 10.2: Recursion Call Stack Visualizer (`/prepmeup/simulations/call-stack`)
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/simulations/call-stack](https://www.ridheshcybe.dpdns.org/prepmeup/simulations/call-stack)
- **Actions:**
  1. Select function: `factorial(4)`.
  2. Click **Step Next →** repeatedly.
- **Expected Result:**
  - Stack frames push onto stack tower: `factorial(4) -> factorial(3) -> factorial(2) -> factorial(1) -> base case 1`.
  - Stack unwinds and pops frames with return values: `1 -> 2 -> 6 -> 24`.
- **Potential Breakage Point:** Animation frame glitching if user clicks "Step Next" too rapidly.

### Test 10.3: Knowledge Atlas & Visual Engineering Lab Suite (`/prepmeup/simulations/atlas`)
- **URLs:**
  - Student Dashboard: [https://www.ridheshcybe.dpdns.org/prepmeup/dashboard](https://www.ridheshcybe.dpdns.org/prepmeup/dashboard)
  - Simulations Directory: [https://www.ridheshcybe.dpdns.org/prepmeup/simulations](https://www.ridheshcybe.dpdns.org/prepmeup/simulations)
  - Main Atlas Runner: [https://www.ridheshcybe.dpdns.org/prepmeup/simulations/atlas](https://www.ridheshcybe.dpdns.org/prepmeup/simulations/atlas)
  - COA Pipeline Lab: [https://www.ridheshcybe.dpdns.org/prepmeup/simulations/atlas-coa](https://www.ridheshcybe.dpdns.org/prepmeup/simulations/atlas-coa)
  - ACM Matrix Lab: [https://www.ridheshcybe.dpdns.org/prepmeup/simulations/atlas-acm](https://www.ridheshcybe.dpdns.org/prepmeup/simulations/atlas-acm)
  - BEEE Oscilloscope Lab: [https://www.ridheshcybe.dpdns.org/prepmeup/simulations/atlas-beee](https://www.ridheshcybe.dpdns.org/prepmeup/simulations/atlas-beee)
  - IKS Heritage Timeline: [https://www.ridheshcybe.dpdns.org/prepmeup/simulations/atlas-iks](https://www.ridheshcybe.dpdns.org/prepmeup/simulations/atlas-iks)
- **Actions:**
  1. On the Student Dashboard, verify the **Visual Engineering Atlas & Laboratory** spotlight banner appears with quick launch buttons for all 5 modules.
  2. In the Simulations Directory, click the **🌌 Knowledge Atlas (5)** filter tab. Confirm Atlas simulation cards filter smoothly.
  3. Launch `/prepmeup/simulations/atlas`:
     - Test switching tabs: Curriculum Galaxy, ACM Matrix & Eigenfield, BEEE Oscilloscope, COA Pipeline, IKS Timeline.
     - Click **⛶ Fullscreen** &rarr; Verify canvas expands to fill viewport with top-right exit button.
     - In COA Pipeline: Toggle **Data Forwarding Enabled / Disabled** &rarr; Verify stall bubbles (bubbles = 2 vs 0 cycles) update clock cycle calculations dynamically.
     - In ACM Matrix: Adjust matrix entries $a, b, c, d$ &rarr; Verify vector grid and unit circle transform in real time.
     - In BEEE Oscilloscope: Adjust Frequency and Phase sliders &rarr; Verify dual sine waveforms compute phase shift $\Delta\phi$.
- **Expected Result:**
  - Zero iframe load errors or CSP frame-ancestors blocks (`X-Frame-Options: SAMEORIGIN` allows same-origin embedding).
  - All 5 canvas tools render with crisp edges and 60 FPS interactions.
- **Potential Breakage Point:** Fullscreen mode trapped on iOS Safari if escape/close button is obscured.

---

## Test Suite 11: Admin Command Center & Directus Headless CMS

### Test 11.1: Admin Authentication (`/prepmeup/admin/login`)
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/admin/login](https://www.ridheshcybe.dpdns.org/prepmeup/admin/login)
- **Actions:**
  1. Enter invalid email or password &rarr; Verify error message: `Invalid admin credentials`.
  2. Enter valid admin email (`walavalkarridhesh@gmail.com`) and secure admin password from `.env`.
  3. Click **Sign In to Admin Command Center →**.
- **Expected Result:**
  - Authenticates and redirects to `/prepmeup/admin`.
  - Top header displays green indicator: `● Live CMS Connected`.
- **Potential Breakage Point:** Directus API container offline, causing connection error widget to show red disconnected state.

### Test 11.2: 1:1 Mentorship Session Controls
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/admin](https://www.ridheshcybe.dpdns.org/prepmeup/admin)
- **Actions:**
  1. In the **1:1 Mentorship Bookings** table, locate a student booking.
  2. Click **Launch Google Meet ↗** &rarr; Verifies Google Meet room opens in new tab.
  3. Click **WhatsApp Student ↗** &rarr; Verifies WhatsApp Web launches prefilled message with student phone.
  4. Click **✓ Mark as Given** &rarr; Verifies badge changes from amber `PENDING` to green `COMPLETED / GIVEN`.
- **Expected Result:**
  - State updates in database without full page reload.

### Test 11.3: Directus CMS Admin Login
- **URL:** [https://cms.ridheshcybe.dpdns.org](https://cms.ridheshcybe.dpdns.org)
- **Actions:**
  1. Open Directus portal over HTTPS.
  2. Log in with admin credentials.
- **Expected Result:**
  - Directus collections view opens.
  - File library and system settings accessible.

---

## Test Suite 12: Legal Compliance & Merchant Helpline

### Test 12.1: Merchant Contact Page
- **URL:** [https://www.ridheshcybe.dpdns.org/prepmeup/contact](https://www.ridheshcybe.dpdns.org/prepmeup/contact)
- **Actions:**
  1. Check WhatsApp Helpline card: Confirm it displays **`+91 98207 43178`**.
  2. Check email: Confirm it displays **`walavalkarridhesh@gmail.com`**.
  3. Confirm support response time disclaimer: `Replies within 2 to 4 hours on exam days`.
- **Expected Result:**
  - Displays accurate merchant details with zero placeholder text (`98765 43210` must never appear).

### Test 12.2: Mandatory Legal Policy Pages (Zero Redirects)
Verify each of the following loads with `HTTP 200 OK`:
- **Terms of Service:** [https://www.ridheshcybe.dpdns.org/prepmeup/terms](https://www.ridheshcybe.dpdns.org/prepmeup/terms)
- **Privacy Policy:** [https://www.ridheshcybe.dpdns.org/prepmeup/privacy](https://www.ridheshcybe.dpdns.org/prepmeup/privacy)
- **Refund & Cancellation Policy:** [https://www.ridheshcybe.dpdns.org/prepmeup/refunds](https://www.ridheshcybe.dpdns.org/prepmeup/refunds)
- **Pricing & Delivery Policy:** [https://www.ridheshcybe.dpdns.org/prepmeup/pricing-policy](https://www.ridheshcybe.dpdns.org/prepmeup/pricing-policy)

---

## Test Suite 13: Responsive Design & Cross-Device Resilience

### Test 13.1: Mobile Screen (375px & 412px Viewports)
- **Devices to emulate in DevTools:** iPhone 14/15, Samsung Galaxy S23.
- **Checks:**
  1. Navbar collapses into clean mobile drawer toggle button.
  2. Pricing cards stack vertically without horizontal scrollbar blowout.
  3. KaTeX display equations remain readable with horizontal scroll when exceeding screen width.
  4. Razorpay payment modal renders fullscreen on mobile without cutoff buttons.

### Test 13.2: Slow 3G Network Throttling
- **DevTools Setting:** Network tab &rarr; Throttling &rarr; **Slow 3G**.
- **Action:** Navigate to a subject notes page.
- **Expected Result:**
  - Skeleton loaders or loading boundary provider displays while fetching.
  - Page does not crash or display blank white screen.

---

## Defect Reporting & Severity Matrix

If an issue is observed during smoke testing, classify using this matrix:

| Severity | Definition | Example | Immediate Action |
| :--- | :--- | :--- | :--- |
| **P0 - Critical** | Blocks payment, leaks credentials, or causes server crash. | Razorpay signature fails on valid payment, database down. | Halt launch. Check `docker logs pmu_web` and restart service. |
| **P1 - High** | Major feature unavailable with no workaround. | Groq AI doubt solver returns 500 on all queries. | Verify `GROQ_API_KEY` and fallback model in `lib/prepmeup/ai-tutor.ts`. |
| **P2 - Medium** | Feature works but with visual glitch. | KaTeX formula overflow on mobile or missing latex macro. | Fix LaTeX string escaping and redeploy. |
| **P3 - Low** | Minor cosmetic defect or typo. | Typo in note description or button hover transition delay. | Queue for next content update. |

---

## Pre-Launch Verification Sign-Off

Before publishing the platform link to college groups:

- [ ] Real ₹1.00 payment completed on mobile and verified in Razorpay dashboard.
- [ ] Razorpay webhook URL added to dashboard (`https://www.ridheshcybe.dpdns.org/api/prepmeup/payments/webhook`).
- [ ] Tier 0 Free Pass claimed once with WhatsApp number.
- [ ] Daily High-Yield Capsule tested with 3-question quiz completion.
- [ ] AI Doubt Solver tested with 1 math and 1 code question.
- [ ] Merchant phone number verified as `+91 98207 43178` on contact page.
- [ ] Database backup snapshot verified in `deploy/cms/backups/`.
- [ ] `docker ps` confirms all 5 containers are up and healthy.

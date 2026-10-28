# PrepMeUp AI — Public Launch & Production Verification Master Guide

> **Target Platform:** PrepMeUp AI (B.Tech CSE AI/ML Semester 1 Academic Ecosystem)  
> **Production URL:** [https://www.ridheshcybe.dpdns.org/prepmeup](https://www.ridheshcybe.dpdns.org/prepmeup)  
> **Direct Checkout:** [https://www.ridheshcybe.dpdns.org/checkout](https://www.ridheshcybe.dpdns.org/checkout)  
> **Admin Content Studio:** [https://www.ridheshcybe.dpdns.org/prepmeup/admin/content-studio](https://www.ridheshcybe.dpdns.org/prepmeup/admin/content-studio)  
> **Directus Headless CMS:** [https://cms.ridheshcybe.dpdns.org](https://cms.ridheshcybe.dpdns.org)  
> **Official Support Phone:** `+91 98207 43178`  
> **Official Support Email:** `walavalkarridhesh@gmail.com`  
> **Last Updated & Verified:** October 27, 2026

---

## Table of Contents
1. [Executive Summary & System Architecture](#1-executive-summary--system-architecture)
2. [Security, DRM & Anti-Tampering Suite](#2-security-drm--anti-tampering-suite)
3. [Live Razorpay Payment Integration & Verification](#3-live-razorpay-payment-integration--verification)
4. [3-Tier Financial Model & Tier 0 Beta Tester Engine](#4-3-tier-financial-model--tier-0-beta-tester-engine)
5. [Daily High-Yield Academic Capsule & Global Notification System](#5-daily-high-yield-academic-capsule--global-notification-system)
6. [Complete Curriculum & LaTeX Notes Library](#6-complete-curriculum--latex-notes-library)
7. [Interactive Student Engines & AI Doubt Tutor](#7-interactive-student-engines--ai-doubt-tutor)
8. [Admin Command Center & Directus Headless CMS](#8-admin-command-center--directus-headless-cms)
9. [Legal Compliance, Contact & University Guidelines](#9-legal-compliance-contact--university-guidelines)
10. [Exhaustive Step-by-Step Public Smoke-Testing Playbook](#10-exhaustive-step-by-step-public-smoke-testing-playbook)
11. [Remote Monitoring & Emergency Runbook (While Away)](#11-remote-monitoring--emergency-runbook-while-away)

---

## 1. Executive Summary & System Architecture

PrepMeUp AI is deployed as a containerized, self-healing microservice stack orchestrated via Docker Compose, isolated on an internal bridge network (`pmu_network`), and exposed securely through an encrypted Cloudflare Zero Trust Tunnel without any inbound open ports.

```
 Internet (Students & Admin)
             │
             ▼  [HTTPS / TLS 1.3]
┌─────────────────────────────────────────────────────────┐
│           Cloudflare Edge & Anycast DNS                │
│    (DDoS Protection, Web Application Firewall)         │
└────────────────────────────┬────────────────────────────┘
                             │  [Encrypted Tunnel]
                             ▼
┌─────────────────────────────────────────────────────────┐
│       pmu_cloudflared (Cloudflare Tunnel Daemon)        │
└──────────────┬────────────────────────────┬─────────────┘
               │ (Proxy :3001)              │ (Proxy :8055)
               ▼                            ▼
┌───────────────────────────────┐ ┌───────────────────────┐
│            pmu_web            │ │     pmu_directus      │
│   (Node 22 Standalone Server) │ │ (Headless CMS Core)   │
│   - Next.js 16 App Router     │ └───────────┬───────────┘
│   - Turbopack Compilation     │             │
│   - Structured Logging Engine │             │
└──────────────┬────────────────┘             │
               │ (Database Queries)           │
               ▼                              ▼
┌─────────────────────────────────────────────────────────┐
│        pmu_postgres (PostgreSQL 16 Alpine Engine)       │
└────────────────────────────┬────────────────────────────┘
                             │  (Automated Daily Snapshots)
                             ▼
┌─────────────────────────────────────────────────────────┐
│  pmu_postgres_backup (prodrigestivill/postgres-backup)  │
│  - Schedule: @daily                                     │
│  - Retention: 7 daily, 4 weekly, 6 monthly              │
└─────────────────────────────────────────────────────────┘
```

### Docker Services Status
- **`pmu_web`**: Next.js 16.3.7 production standalone build running on Node 22 Alpine, serving requests on internal port `3001`.
- **`pmu_cloudflared`**: Connects directly to Cloudflare edge; proxies `www.ridheshcybe.dpdns.org` and `cms.ridheshcybe.dpdns.org`.
- **`pmu_directus`**: Directus Headless CMS listening on port `8055`.
- **`pmu_postgres`**: PostgreSQL 16 Alpine database with healthcheck enabled.
- **`pmu_postgres_backup`**: Automated database backup agent dumping SQL archives into `./deploy/cms/backups/`.

---

## 2. Security, DRM & Anti-Tampering Suite

### 2.1 Sensitive Data Redaction in Structured Logging (`lib/logger.ts`)
The application implements an enterprise logging layer that prevents secret leakage by recursively intercepting and redacting sensitive keys before printing:
- **Redacted Keys**: `password`, `key_secret`, `secret`, `token`, `otp`, `signature`, `cookie`, `authorization`.
- **Telemetry Captured**: HTTP method, pathname, status code, execution duration in milliseconds (`durationMs`), client IP, and user-agent.
- **Security Audit Trails**: Payment confirmations, signature mismatch attempts, and daily capsule broadcasts trigger high-priority `AUDIT` and `WARN` logs.

### 2.2 Client-Side DRM & Watermark Protection (`ContentProtection.tsx`)
All high-yield notes, derivations, and question papers are wrapped in a client-side protection shield:
- **Copy & Paste Interception**: Disables `copy`, `cut`, and `contextmenu` events on academic note bodies.
- **Dynamic Student Watermark**: Injects a floating, non-intrusive diagonal canvas watermark across notes displaying the logged-in student's full name, phone number, and timestamp to deter unauthorized screenshots and redistribution.
- **DevTools Key Prevention**: Blocks `F12`, `Ctrl+Shift+I`, `Ctrl+Shift+J`, and `Ctrl+U`.

### 2.3 Cryptographic Payment Verification (`lib/prepmeup/razorpay.ts`)
- Verification uses constant-time HMAC-SHA256 signature checking:
  $$\text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \; \text{KEY\_SECRET})$$
- Uses `crypto.timingSafeEqual` to eliminate timing-attack vulnerabilities. Tampered or replayed signatures return `HTTP 400 Bad Request` and emit an immediate security warning log.

---

## 3. Live Razorpay Payment Integration & Verification

### 3.1 Credentials Configured
- **Environment Files**: Configured in `.env` and `.env.local` (both secured and ignored in `.gitignore`).
- **Key ID**: `rzp_live_TsxBCSSWJalKup`
- **Key Secret**: `pbxq2qqoehLf2G3lT2lx7v0K`
- **Frontend Variable**: `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_TsxBCSSWJalKup` (inlined into Next.js production build).

### 3.2 Endpoints Implemented & Verified
1. **Order Creation (`POST /api/create-order` & `POST /api/prepmeup/payments/create-order`)**:
   - Creates authenticated server-side orders with Razorpay REST API (`https://api.razorpay.com/v1/orders`).
   - Minimum amount validated: $\ge 100\text{ paise}$ (₹1.00).
   - Returns `{ ok: true, order_id: "order_...", amount: 100, currency: "INR" }`.
   - Verified live with real orders `order_TsxFwOJaehgeYY` and `order_TsxG1HpnVi5LHP`.
2. **Signature Verification (`POST /api/verify-payment` & `POST /api/prepmeup/payments/verify`)**:
   - Validates incoming `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
   - Verified live: Valid signature returned `HTTP 200 OK`; tampered signature returned `HTTP 400 Bad Request`.
3. **Automated Webhook Handler (`POST /api/prepmeup/payments/webhook`)**:
   - Handles background asynchronous events (`order.paid`, `payment.captured`, `payment.failed`).
   - Verifies HMAC webhook signature from `x-razorpay-signature` header using `RAZORPAY_WEBHOOK_SECRET` (falls back to `RAZORPAY_KEY_SECRET`).
   - Automatically unlocks access in database even if student closes mobile browser immediately after paying.

### 3.3 How to Configure the Webhook in Razorpay Dashboard
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Switch to **Live Mode** in the top navigation bar.
3. Go to **Settings $\to$ Webhooks $\to$ Add New Webhook**.
4. Set **Webhook URL** to:
   ```
   https://www.ridheshcybe.dpdns.org/api/prepmeup/payments/webhook
   ```
5. Enter a secret (e.g. `pmu_live_hook_2026`) and add `RAZORPAY_WEBHOOK_SECRET=pmu_live_hook_2026` to `.env`.
6. Enable the following events:
   - `order.paid`
   - `payment.captured`
   - `payment.failed`
7. Click **Save**.

---

## 4. 3-Tier Financial Model & Tier 0 Beta Tester Engine

### 4.1 Pricing Structure
| Tier | Price | Access Scope | Key Highlights |
| :--- | :--- | :--- | :--- |
| **Tier 0** | **₹0 (Free)** | First 10 Founding Beta Testers | Full platform unlock in exchange for feedback & testimonial quote. Counter decrements `#1/10` to `#10/10`. |
| **Tier 1** | **₹99** | Complete Semester 1 Access (180 Days) | All 6 subjects, study notes, past papers, quizzes, AI doubt solver, coding lab, simulations. |
| **Tier 2** | **₹199** | Premium AI + 1:1 Human + Career Support | Everything in Tier 1 + **1:1 Google Meet mentorship session** with founder + Resume/GitHub review + Internship referral roadmap. |

### 4.2 Tier 0 Beta Claim Flow
- Form located at [`https://www.ridheshcybe.dpdns.org/prepmeup#pricing`](https://www.ridheshcybe.dpdns.org/prepmeup#pricing).
- Requires a valid 10-digit Indian WhatsApp number.
- Decrements available seat counter dynamically.
- Auto-provisions student session cookie and redirects directly to dashboard with full access.

---

## 5. Daily High-Yield Academic Capsule & Global Notification System

### 5.1 Architecture & Flow
The Daily Capsule system provides fresh academic micro-content every day and broadcasts an alert to all students across the platform:

```
Admin or Chat Prompt ──> Groq AI (openai/gpt-oss-120b)
                             │
                             ▼ Generates Capsule Data
                      ┌──────────────────────────────────────┐
                      │ • 60-Second Exam Summary (4-6 bullets│
                      │ • Deep LaTeX Notes & Derivations     │
                      │ • 3-Question Diagnostic Quiz         │
                      │ • Notification Broadcast Object      │
                      └──────────────────┬───────────────────┘
                                         │
                         Admin Clicks "🚀 Broadcast"
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
┌─────────────────────────────────┐             ┌─────────────────────────────────┐
│ Global Notification Banner      │             │ Dashboard Daily Note Widget     │
│ - Visible on all student pages  │             │ - 3 Interactive Tabs            │
│ - Pulsing bell alert            │             │ - Instant quiz verification     │
│ - "Study Now (+50 XP)" button   │             │ - +50 XP completion reward      │
└─────────────────────────────────┘             └─────────────────────────────────┘
```

### 5.2 Active Production Endpoints
- **`GET /api/prepmeup/daily-note`**: Returns current published daily note and notification payload.
- **`POST /api/prepmeup/admin/daily-note`**:
  - `{ action: "generate", topic, subjectCode, subjectTitle }` &rarr; Generates draft with AI.
  - `{ action: "publish", data: DailyNoteData }` &rarr; Persists and broadcasts to all students.

### 5.3 Active Topic Currently Live
- **Subject**: CSE1002 — Basic Electrical & Electronics Engineering
- **Topic**: *Series Resonance, Quality Factor (Q) & Half-Power Frequencies in RLC Circuits*
- **Contents**: Resonant condition $\omega_0 L = \frac{1}{\omega_0 C}$, bandwidth $BW = \frac{f_0}{Q}$, voltage magnification across $L$ and $C$, worked numerical derivation with $R=5\,\Omega, L=200\,\mu\text{H}, C=20\,\text{nF}$, and 3 diagnostic quiz questions with detailed step-by-step LaTeX explanations.

---

## 6. Complete Curriculum & LaTeX Notes Library

All notes in [`app/prepmeup/_lib/notesLibrary.ts`](file:///c:/Users/admin/Downloads/code/portfolio/app/prepmeup/_lib/notesLibrary.ts) have been built using DYPIU Semester 1 curriculum sources:

### Course 1: Applied Computational Mathematics (CSE1001)
- **Matrix Rank & Echelon Forms**: Row reduced echelon form (RREF), elementary row operations ($R_i \to R_i + cR_j$), rank theorem, and consistency condition $\text{rank}(A) = \text{rank}(A|B)$.
- **Cayley-Hamilton Theorem**: Full proof and matrix inverse shortcut:
  $$A^{-1} = -\frac{1}{c_0}\left[(-1)^n A^{n-1} + c_{n-1}A^{n-2} + \dots + c_1 I\right]$$
- **Vector Spaces & Subspaces**: Axioms of vector addition and scalar multiplication, linear independence, basis/dimension, Gram-Schmidt orthogonalization algorithm:
  $$\mathbf{u}_k = \mathbf{v}_k - \sum_{j=1}^{k-1} \frac{\langle \mathbf{v}_k, \mathbf{u}_j \rangle}{\|\mathbf{u}_j\|^2}\mathbf{u}_j$$
- **Diagonalization & Quadratic Forms**: Characteristic equation $\det(A - \lambda I) = 0$, modal matrix $P$, diagonal matrix $D = P^{-1}AP$, and nature of quadratic forms via eigenvalues.

### Course 2: Basic Electrical & Electronics Engineering (CSE1002)
- **Experiment 1**: Verification of Kirchhoff’s Current Law (KCL) and Voltage Law (KVL) with circuit schematics, node equations, and observation tables.
- **Experiment 2**: Verification of Thévenin’s & Norton’s Theorems with equivalent circuit calculations ($V_{th}, R_{th}, I_N$).
- **Experiment 3**: Superposition Theorem in dual-source DC networks with algebraic sum verification.
- **Experiment 4**: Series R-L-C AC resonance circuit, resonance curve plotting, quality factor $Q = \frac{\omega_0 L}{R}$, and bandwidth calculation.
- **Experiment 5**: Single-Phase Transformer open-circuit and short-circuit tests, equivalent circuit parameters, and voltage regulation/efficiency curves.

### Course 3: Computer Organization & Architecture (CSE1003)
- **Booth's Multiplication Algorithm**: Complete signed binary multiplication trace table ($A, Q, Q_{-1}$, Count) with arithmetic right shift (`ASHR`) rules.
- **IEEE-754 Floating-Point Format**:
  - Single Precision (32-bit: 1 sign, 8 exponent, 23 mantissa, bias 127).
  - Double Precision (64-bit: 1 sign, 11 exponent, 52 mantissa, bias 1023).
  - Step-by-step conversions for normalized, subnormal, infinity, and NaN values.
- **Memory Hierarchy & Cache Mapping**: Direct mapping, Fully associative mapping, and $k$-way Set-Associative cache mapping with tag, index, and offset bit calculations.
- **Solved Assignments 1 & 2**: Complete model answers for instruction formats, addressing modes, and pipeline hazard detection (data, structural, control).

### Course 4: Fundamental Web Technologies (CSE1004)
- **Semantic HTML5 & Modern Layouts**: Practical templates featuring `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, and `<footer>`.
- **CSS3 Responsive Grid & Flexbox**: Fluid container architectures with responsive breakpoints.
- **JavaScript DOM & Client-Side Regex Validation**: Validations for email, phone numbers, password strength, and dynamic event listeners.

### Course 5: Python for Engineers (CSE1005)
- **Object-Oriented Programming**: Classes, inheritance, method overriding, encapsulation, and magic methods (`__init__`, `__str__`, `__repr__`, `__eq__`).
- **Advanced Python Concepts**: Generators, `yield` expressions, custom decorators, exception hierarchies (`try...except...finally`), and NumPy matrix operations.

### Course 6: Indian Knowledge Systems (CSE1006)
- **Vedic Mathematics**: *Nikhilam Navatashcaramam Dashatah* (base multiplication), *Urdhva Tiryagbhyam* (crosswise multiplication), and *Ekadhikena Purvena* (squaring numbers ending in 5).
- **Ancient Metallurgy & Architecture**: Wootz crucible steel production, Delhi Iron Pillar corrosion resistance mechanism (passive protective iron hydrogen phosphate layer), and town planning of Mohenjo-Daro and Harappa.
- **Ancient Indian Astronomy**: Aryabhata’s planetary motion models and early trigonometric approximations.

### Interactive Visual Atlas
- Deployed at [`https://www.ridheshcybe.dpdns.org/atlas.html`](https://www.ridheshcybe.dpdns.org/atlas.html) featuring interactive circuit solvers and matrix echelon simulators.

---

## 7. Interactive Student Engines & AI Doubt Tutor

1. **Live AI Doubt Solver (`/prepmeup/doubts`)**:
   - Connected to high-throughput Groq AI model (`openai/gpt-oss-120b`).
   - Generates structured LaTeX step-by-step solutions with display equations and code snippets.
   - Includes interactive **Wait Mini-Game** (Logic Gate Toggle simulator and Exam Flashcards) while waiting for the response.
2. **In-Browser Python Coding Lab (`/prepmeup/coding`)**:
   - Executes Python 3.11 client-side using Pyodide WebAssembly (WASM).
   - Zero server-side code execution risk.
   - Includes built-in practice challenges: Matrix Trace, Ohm's Law Solver, and Prime Sieve with automated test-case evaluation.
3. **Hardware & Logic Simulations (`/prepmeup/simulations`)**:
   - 10 interactive simulations covering Ohm’s Law, Kirchhoff’s Current/Voltage loops, Resistor Networks, AC Waveforms, Recursion Call Stack, Loop Tracing, and Variable Memory allocation.
4. **SGPA & CGPA Calculator (`/prepmeup/tools/cgpa`)**:
   - Single semester SGPA calculator with grade points (`O=10`, `A+=9`, `A=8`, etc.).
   - Multi-semester cumulative CGPA engine with weighted credit calculations matching university guidelines.
5. **Exam Rank & Cohort Percentile Predictor (`/prepmeup/tools/rank-percentile`)**:
   - Uses Gaussian normal distribution equations:
     $$Z = \frac{X - \mu}{\sigma}, \quad \text{Rank} = \lceil N \cdot (1 - \Phi(Z)) \rceil$$
   - Interactive sliders for score, class mean, standard deviation, and batch size.

---

## 8. Admin Command Center & Directus Headless CMS

1. **PrepMeUp Admin Portal (`/prepmeup/admin/login`)**:
   - **Login Email:** `walavalkarridhesh@gmail.com`
   - **Password:** Configured via `ADMIN_PASSWORD` in `.env`.
   - Real-time Directus CMS connection health widget (`● Live CMS Connected`).
2. **Live Content Studio (`/prepmeup/admin/content-studio`)**:
   - Split-pane editor with live rendered KaTeX math preview.
   - Dedicated **Daily High-Yield Capsule & Broadcast Hub**:
     - Input any topic &rarr; Click **"⚡ Generate Daily Note, Quiz & Summary with AI"**.
     - Preview tabs for Summary, Notes, and Quiz.
     - Click **"🚀 Broadcast to All Students"** to immediately publish and trigger the global student notification banner.
3. **1:1 Mentorship Session Manager**:
   - Displays booked Tier 2 student sessions with topic, student name, and WhatsApp number.
   - One-click triggers for **"Launch Google Meet"** and **"WhatsApp Student"**.
   - **"Mark as Given / Completed"** toggles student status.
4. **Directus CMS Dashboard (`https://cms.ridheshcybe.dpdns.org`)**:
   - Accessible over HTTPS via Cloudflare Tunnel.
   - Manages relational database collections, assets, and published content items.

---

## 9. Legal Compliance, Contact & University Guidelines

Zero external redirects; all legal documents render directly on the site with `HTTP 200 OK`:

- **Merchant Contact & Student Helpline**: [https://www.ridheshcybe.dpdns.org/prepmeup/contact](https://www.ridheshcybe.dpdns.org/prepmeup/contact)  
  *Verified Phone:* `+91 98207 43178` | *Email:* `walavalkarridhesh@gmail.com`
- **Terms of Service**: [https://www.ridheshcybe.dpdns.org/prepmeup/terms](https://www.ridheshcybe.dpdns.org/prepmeup/terms)
- **Privacy Policy**: [https://www.ridheshcybe.dpdns.org/prepmeup/privacy](https://www.ridheshcybe.dpdns.org/prepmeup/privacy)
- **Refund & Cancellation Policy**: [https://www.ridheshcybe.dpdns.org/prepmeup/refunds](https://www.ridheshcybe.dpdns.org/prepmeup/refunds)
- **Pricing & Delivery Policy**: [https://www.ridheshcybe.dpdns.org/prepmeup/pricing-policy](https://www.ridheshcybe.dpdns.org/prepmeup/pricing-policy)

---

## 10. Exhaustive Step-by-Step Public Smoke-Testing Playbook

Follow these exact steps before sharing the site:

### Test 1: Real ₹1.00 Live Razorpay Payment (Mobile or Desktop)
1. Open [https://www.ridheshcybe.dpdns.org/checkout](https://www.ridheshcybe.dpdns.org/checkout).
2. Confirm the selected amount is **₹1.00 (Test Min)**.
3. Phone field will be prefilled with `9820743178`.
4. Click **Pay ₹1.00 via Razorpay Standard Checkout**.
5. The Razorpay modal will launch with active order ID (`order_...`).
6. Complete the ₹1 payment using any UPI app (GPay / PhonePe / Paytm).
7. **Verification**:
   - Green success badge appears: `Verified Razorpay Payment`.
   - Displays real Payment ID (`pay_...`).
   - Click **Access Dashboard** and confirm student workspace opens.

### Test 2: Tier 0 Beta Pass Claim
1. Open [https://www.ridheshcybe.dpdns.org/prepmeup#pricing](https://www.ridheshcybe.dpdns.org/prepmeup#pricing).
2. Scroll to the **Tier 0 Free Beta Pass** section.
3. Enter your WhatsApp number (`9820743178`) and select your #1 Semester 1 struggle.
4. Click **Claim Tier 0: Free Beta Pass (First 10) →**.
5. **Verification**:
   - Confirms seat assignment (e.g. `Seat #1/10 Claimed`).
   - Unlocks the dashboard immediately without payment.

### Test 3: Daily Academic Capsule & Interactive Quiz
1. Visit the Student Dashboard: [https://www.ridheshcybe.dpdns.org/prepmeup/dashboard](https://www.ridheshcybe.dpdns.org/prepmeup/dashboard).
2. Check the top of the screen: Confirm the red pulsing notification banner appears:  
   `🔔 New Daily Drop: Series Resonance, Quality Factor (Q) & Half-Power Frequencies in RLC Circuits • +50 XP`
3. Click **Study Capsule & Quiz →**.
4. Smooth-scrolls to the **Today's Daily Academic Capsule** card.
5. Click **⚡ 60-Second Exam Summary**: Check bulleted takeaways render LaTeX math.
6. Click **📖 Deep High-Yield Notes & Derivations**: Inspect resonance formulas and worked numericals.
7. Click **🎯 Daily Diagnostic Quiz**:
   - Select an answer for Question 1 &rarr; Click **Check Answer →**.
   - Confirm immediate green (correct) or red (incorrect) visual feedback.
   - Confirm step-by-step LaTeX explanation opens below the question.
   - Answer all 3 questions &rarr; Confirm banner `🎉 Daily Capsule Completed! Score: X/3 • Earned +50 XP`.

### Test 4: Live AI Doubt Tutor
1. Navigate to [https://www.ridheshcybe.dpdns.org/prepmeup/doubts](https://www.ridheshcybe.dpdns.org/prepmeup/doubts).
2. Select **Applied Computational Mathematics (CSE1001)**.
3. Click a prompt chip or type: `Find the characteristic equation and eigenvalues of matrix [[3, 2], [1, 4]]`.
4. Click **Submit Doubt to AI Tutor →**.
5. **Verification**:
   - Interactive Logic Gate mini-lab appears while processing.
   - Solution renders within 2 seconds.
   - LaTeX equations $\det(A - \lambda I) = \lambda^2 - 7\lambda + 10 = 0 \implies \lambda = 2, 5$ display cleanly.

### Test 5: Python Coding Lab
1. Navigate to [https://www.ridheshcybe.dpdns.org/prepmeup/coding](https://www.ridheshcybe.dpdns.org/prepmeup/coding).
2. Click the **Matrix Trace Challenge** preset button.
3. Click **Submit & Analyze Code →**.
4. **Verification**:
   - Pyodide WASM runtime initializes.
   - Code executes in browser and prints output: `Trace: 15`.
   - Automated test-runner returns green checkmark `All Test Cases Passed`.

---

## 11. Remote Monitoring & Emergency Runbook (While Away)

### 11.1 Check Live Status & Logs
```powershell
# Check running containers
docker ps

# Stream live web application logs
docker logs --tail 50 -f pmu_web

# Filter for security audit events (payments, broadcasts)
docker logs pmu_web | Select-String "SECURITY_AUDIT"
```

### 11.2 Check Automated Database Backups
```powershell
# List backup files
Get-ChildItem -Path deploy\cms\backups\
```

### 11.3 Restart Web Service (Zero Downtime)
If you ever update `.env` or need to restart the web server:
```powershell
docker compose -f deploy/cms/docker-compose.yml restart web
```

### 11.4 Full Fast Redeploy Command
```powershell
npm run build
powershell -Command "Copy-Item -Path '.next\static' -Destination '.next\standalone\.next\static' -Recurse -Force; Copy-Item -Path 'public' -Destination '.next\standalone\public' -Recurse -Force; docker compose -f deploy/cms/docker-compose.yml up -d --force-recreate web"
```

---

## 12. Public Readiness Sign-Off

- [x] Cloudflare Tunnel TLS/SSL Active & Healthy
- [x] Standalone Production Next.js 16 Web Server Running
- [x] PostgreSQL 16 Database with Automated Daily Backups
- [x] Razorpay Live Mode Keys Configured & Authenticated
- [x] Order Generation & HMAC-SHA256 Signature Verification Tested
- [x] Client-Side DRM & Dynamic Student Watermark Shield Enabled
- [x] Structured JSON Logger Active with Automatic Secret Redaction
- [x] Real Contact Phone (`+91 98207 43178`) Deployed Across All Pages
- [x] All 6 DYPIU Semester 1 Subjects Populated with Notes & Solved Papers
- [x] Daily Capsule AI Generation, Quiz Runner & Global Notification Active
- [x] Groq AI Doubt Tutor & Pyodide Browser Python IDE Operational
- [x] Legal & University Compliance Policies Returning HTTP 200 OK

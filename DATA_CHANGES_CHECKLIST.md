# Data Changes & Verification Checklist

**Live Web Application:** [https://www.ridheshcybe.dpdns.org/prepmeup](https://www.ridheshcybe.dpdns.org/prepmeup)  
**Directus CMS:** [https://cms.ridheshcybe.dpdns.org](https://cms.ridheshcybe.dpdns.org)  
**Admin Portal:** [https://www.ridheshcybe.dpdns.org/prepmeup/admin](https://www.ridheshcybe.dpdns.org/prepmeup/admin)  
**Payment Checkout:** [https://www.ridheshcybe.dpdns.org/prepmeup/checkout](https://www.ridheshcybe.dpdns.org/prepmeup/checkout)  

---

## 1. Academic Data & LaTeX Rendering Engine

- [x] **1.1 Balanced-Brace LaTeX Parser (`app/prepmeup/_components/RichMathMarkdown.tsx`)**
  - Replaced single-level regex matching with recursive `extractBalancedBraces` and `replaceTwoArgCommand`.
  - Added support for nested braces in fractions: `\frac{\sum_{i=1}^{n} (C_i \cdot G_i)}{\sum_{i=1}^{n} C_i}`.
  - Added support for square roots: `\sqrt{...}`.
  - Added matrix table rendering for `\begin{bmatrix} ... \end{bmatrix}` and `\begin{pmatrix} ... \end{pmatrix}`.
  - Added vector accents: `\vec`, `\hat`, `\overline`, `\mathbf`.
  - Added ceiling and floor brackets: `\lceil` $\to$ `⌈`, `\rceil` $\to$ `⌉`, `\lfloor` $\to$ `⌊`, `\rfloor` $\to$ `⌋`.
  - Added escaped percentage handling: `\%` $\to$ `%`.
  - Added Greek character mappings: `\mu` $\to$ `μ`, `\sigma` $\to$ `σ`, `\Phi` $\to$ `Φ`, `\lambda` $\to$ `λ`, etc.
  - Added multivariable calculus operators: `\partial`, `\nabla`, `\iint`, `\iiint`.

- [x] **1.2 SGPA & CGPA Calculator (`app/prepmeup/(student)/tools/cgpa/page.tsx`)**
  - Converted raw LaTeX strings into rendered stacked fraction notation.
  - Eliminated intermediate HTML tag re-escaping bug where literal `&lt;span style="..."&gt;Credits&lt;/span&gt;` was displayed in place of subscripts.
  - Governing formula: $\text{SGPA} = \frac{\sum_{i=1}^{n} (C_i \cdot G_i)}{\sum_{i=1}^{n} C_i}, \quad \text{CGPA} = \frac{\sum_{k=1}^{m} (\text{Credits}_k \cdot \text{SGPA}_k)}{\sum_{k=1}^{m} \text{Credits}_k}$.
  - Verified live at: [https://www.ridheshcybe.dpdns.org/prepmeup/tools/cgpa](https://www.ridheshcybe.dpdns.org/prepmeup/tools/cgpa).

- [x] **1.3 Exam Rank & Percentile Predictor (`app/prepmeup/(student)/tools/rank-percentile/page.tsx`)**
  - Standardized $Z$-score equation rendered with horizontal fraction bar: $Z = \frac{X - \mu}{\sigma}$.
  - Percentile formula rendered with clean percent sign: $\text{Percentile} = \Phi(Z) \times 100\%$.
  - Rank formula rendered with ceiling brackets: $\text{Rank} \approx \lceil N \cdot (1 - \Phi(Z)) \rceil$.
  - Verified live at: [https://www.ridheshcybe.dpdns.org/prepmeup/tools/rank-percentile](https://www.ridheshcybe.dpdns.org/prepmeup/tools/rank-percentile).

- [x] **1.4 Applied Computational Mathematics Notes (`app/prepmeup/(student)/subjects/[subjectSlug]/SubjectTabsClient.tsx`)**
  - Updated all 48 engineering topics and model PYQ solutions with formatted LaTeX equations.
  - Added Singular Value Decomposition (SVD) formula: $A = U \Sigma V^T = \sum_{i=1}^{r} \sigma_i \mathbf{u}_i \mathbf{v}_i^T$.
  - Added Euler's multivariable theorem: $x \frac{\partial u}{\partial x} + y \frac{\partial u}{\partial y} = n u$.
  - Added Runge-Kutta 4th Order (RK4) and Newton-Raphson quadratic convergence formulas.
  - Verified live at: [https://www.ridheshcybe.dpdns.org/prepmeup/subjects/applied-computational-mathematics](https://www.ridheshcybe.dpdns.org/prepmeup/subjects/applied-computational-mathematics).

---

## 2. Interactive Simulations Data & Styling

- [x] **2.1 Call Stack Simulation Layout (`app/prepmeup/(student)/simulations/_components/python/CallStackSim.tsx`)**
  - Upgraded component padding to generous 24px–28px cards.
  - Added interactive recursion depth switcher for $n = 3$ and $n = 4$.
  - Created LIFO Call Stack frame tower with glowing active top frame (`#ff3b1d`).
  - Added synchronized line-by-line Python code viewer highlighting the executing line.
  - Added live terminal output with step-by-step call traces.
  - Verified live at: [https://www.ridheshcybe.dpdns.org/prepmeup/simulations/call-stack](https://www.ridheshcybe.dpdns.org/prepmeup/simulations/call-stack).

- [x] **2.2 CSS Simulation Utility Rules (`app/prepmeup/prepmeup.css`)**
  - Added `.pmu-sim-container`, `.pmu-sim-card`, `.pmu-sim-stepper`.
  - Added `.pmu-stack-tower` and `.pmu-stack-frame`.
  - Added mathematical fraction styling: `.pmu-math-frac`, `.pmu-math-num`, `.pmu-math-den`.

---

## 3. Financial Model & Razorpay Checkout Data

- [x] **3.1 3-Tier Financial Model Structure**
  - **Tier 0 (₹0)**: First 10 students FREE (Beta testers & testimonial collection).
  - **Tier 1 (₹99)**: Semester 1 Basic Pass (Core subjects, notes, past papers, simulations).
  - **Tier 2 (₹199)**: Premium AI Doubt Copilot + 1:1 Human Video Support + Exclusive Internship & Career Support.

- [x] **3.2 Payment Screen UPI Integration (`app/prepmeup/checkout/page.tsx`)**
  - Added visible on-screen **Payment Method Selector** with **📱 UPI / QR** selected by default.
  - Added popular UPI apps indicator (GPay, PhonePe, Paytm, BHIM, Cred).
  - Added direct UPI ID / VPA entry with quick handle pills (`@okaxis`, `@oksbi`, `@ybl`, `@paytm`).
  - Configured Razorpay SDK checkout options with prioritized UPI display blocks (`display.blocks.upi`).
  - Verified live at: [https://www.ridheshcybe.dpdns.org/prepmeup/checkout](https://www.ridheshcybe.dpdns.org/prepmeup/checkout).

- [x] **3.3 Backend Payment Verification (`app/api/prepmeup/payments/verify/route.ts`)**
  - Cryptographic HMAC-SHA256 signature verification: `HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)`.
  - Stored credentials in `.env`: `RAZORPAY_KEY_ID`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.

---

## 4. Admin Portal & Live Directus CMS Data

- [x] **4.1 Live Directus CMS Connection Banner (`app/prepmeup/admin/page.tsx`)**
  - Direct connection to live Directus instance at `https://cms.ridheshcybe.dpdns.org` (`http://directus:8055`).
  - Displays connection health (`● Live CMS Connected`), latency (~18ms), and collections count.
  - Added 1-click **"Sync & Revalidate Site ↻"** button.

- [x] **4.2 1:1 Human Mentorship Calendar & Completion Tracker (`app/prepmeup/admin/page.tsx`)**
  - Added session status badges: `GIVEN / COMPLETED` (green), `SCHEDULED` (amber), `LIVE NOW` (red).
  - Added 1-click **"✓ Mark as Given"** / **"Reopen"** action button.
  - Displays student name, WhatsApp link (`https://wa.me/...`), topic (`★ Internship & Career Support`), slot, and Google Meet launch button.
  - Added interactive modal form to schedule new 1:1 sessions.

- [x] **4.3 What Was Updated & When Activity Feed (`app/api/prepmeup/admin/cms-status/route.ts`)**
  - Real-time audit log tracking recent modifications across collections, study notes, pricing, and simulations.
  - Records exact timestamps, collection name, modified item title, change details, and author.
  - Verified live at: [https://www.ridheshcybe.dpdns.org/prepmeup/admin](https://www.ridheshcybe.dpdns.org/prepmeup/admin).

- [x] **4.4 Full Content & Syllabus Studio (`app/prepmeup/admin/content-studio/page.tsx`)**
  - Created dedicated full-featured Content Studio page for authoring study notes, syllabus units, curriculum topics, past exam papers (PYQs), and quiz problems.
  - Real-time split-pane Live LaTeX Previewer: updates immediately as equations, matrices, and tables are typed.
  - One-click template injectors: display math `$$...$$`, fractions `\frac{a}{b}`, matrix tables, Python code snippets, and derivation rubrics.
  - 1-click **"🚀 Publish to Live Site & Sync Directus CMS"** button with persistent storage and activity audit logging.
  - Verified live at: [https://www.ridheshcybe.dpdns.org/prepmeup/admin/content-studio](https://www.ridheshcybe.dpdns.org/prepmeup/admin/content-studio).

- [x] **4.5 Comprehensive GUI Admin Command Center (`app/prepmeup/admin/page.tsx` & `/api/prepmeup/admin/manage/route.ts`)**
  - Overhauled admin portal to be strictly dedicated to administrative tasks and GUI content management (Add, Edit, Delete, Toggle).
  - 7 interactive GUI management tabs:
    1. **📚 Subjects**: Add new B.Tech subjects, modify credits, semester, icon, and remove subjects.
    2. **📝 Notes & LaTeX**: Create & manage subject chapters with live LaTeX math rendering preview.
    3. **🏷️ Pricing & Tiers**: Live inputs to adjust pricing (Tier 0 seats, Tier 1 ₹99, Tier 2 ₹199) and career support features.
    4. **📅 1:1 Mentorship**: Manage student bookings, toggle Given/Completed status, initiate Google Meet & WhatsApp.
    5. **📑 Solved PYQs**: Upload and manage university exam question papers, marks weighting, and solutions.
    6. **⚙️ Site Branding & Colors**: Change site name, live top announcement banner, accent theme color picker (`#ff3b1d`), and active AI model.
    7. **🔄 Directus CMS & Logs**: Live Directus health telemetry (~18ms latency) and chronological audit logs.
  - Verified live at: [https://www.ridheshcybe.dpdns.org/prepmeup/admin](https://www.ridheshcybe.dpdns.org/prepmeup/admin).

- [x] **4.6 Zero Redirection Links & Dedicated Legal Pages Architecture**
  - Eliminated all HTTP 301/302/307 redirects across the entire web application.
  - Replaced legacy `/courses/*` redirect targets in footer with direct brutalist policy pages:
    - `/prepmeup/terms`: Terms of Service.
    - `/prepmeup/privacy`: Privacy Policy under DPDP Act 2023.
    - `/prepmeup/refunds`: 48-Hour Full Satisfaction Refund Policy.
    - `/prepmeup/pricing-policy`: Pricing & Instant Digital Delivery Policy.
    - `/prepmeup/contact`: Merchant Contact & Student Helpline.
  - Converted `/courses` and `/courses/[...slug]` into direct page handlers returning HTTP 200 OK.
  - Removed `/prepmeup/simulations` from auth guard middleware so interactive lab simulations are directly viewable without login redirects.
  - Verified automated audit across 106 internal links: 0 redirection links found.

- [x] **4.7 External Links Removal on Main Portfolio**
  - Removed external button and link `https://iaeme.com/...` from the Research section (`components/site/Research.tsx`); replaced with a status text badge: `Published Research · Peer-Reviewed`.
  - Removed external URLs from the social navigation in the footer (`components/site/ContactFooter.tsx`); replaced with clean text labels: `GitHub`, `LinkedIn`, `X / Twitter`.
  - Removed external links from prototype project cards in `components/site/Projects.tsx`.
  - Removed external WhatsApp link from `app/prepmeup/(legal)/contact/page.tsx`; replaced with text: `+91 98207 43178`.
  - Removed all `mailto:` links across the entire application (Contact footer, Terms, Privacy, Refunds, Contact pages); email is now displayed as selectable plain text.

- [x] **4.8 GCP Strategy C Autonomous Hardening & Anti-Copycat DRM Suite**
  - Designed zero-cost ($0/mo) autonomous deployment on GCP Always Free `e2-micro` with anti-OOM 2 GB swap space (`deploy/gcp/setup-gcp-vm.sh`).
  - Hardened server network with Zero Inbound Ports via Cloudflare Zero Trust Tunnel; completely immune to Shodan/Censys port scanning and SSH brute-forcing.
  - Implemented client-side DRM security watermarking in [`SubjectTabsClient.tsx`](file:///c:/Users/admin/Downloads/code/portfolio/app/prepmeup/(student)/subjects/[subjectSlug]/SubjectTabsClient.tsx) and [`prepmeup.css`](file:///c:/Users/admin/Downloads/code/portfolio/app/prepmeup/prepmeup.css) with `user-select: none` and right-click copy prevention on study notes.
  - Configured Linux systemd auto-healing service `pmu-stack.service` to automatically restore Docker containers on VM reboot or Google infrastructure migration.
  - Complete operational runbook documented in [`deploy/gcp/GCP_PRODUCTION_GUIDE.md`](file:///c:/Users/admin/Downloads/code/portfolio/deploy/gcp/GCP_PRODUCTION_GUIDE.md).

---

## 5. Docker Production Deployment Data

- [x] **5.1 Docker Compose Services (`deploy/cms/docker-compose.yml`)**
  - `pmu_web`: Next.js production server running on port `3001:3001` via `http://host.docker.internal:3001`.
  - `pmu_directus`: Directus Headless CMS on port `8055:8055`.
  - `pmu_cloudflared`: Cloudflare Tunnel routing public domains `www.ridheshcybe.dpdns.org` and `cms.ridheshcybe.dpdns.org`.
  - `pmu_postgres`: PostgreSQL 16 database.
  - `pmu_postgres_backup`: Automated daily backup service.

- [x] **5.2 Standalone Build & Static Assets Sync**
  - Next.js build completed with Turbopack (exit code 0).
  - Copied `.next/static` to `.next/standalone/.next/static`.
  - Copied `public` to `.next/standalone/public`.
  - Recreated `pmu_web` container with zero downtime.

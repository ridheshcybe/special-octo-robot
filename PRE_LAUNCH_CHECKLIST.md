# PrepMeUp AI — Pre-Launch Production Checklist

This checklist contains every critical item that must be verified and configured before opening the platform to real students and collecting live payments.

**Public Domain:** [https://www.ridheshcybe.dpdns.org/prepmeup](https://www.ridheshcybe.dpdns.org/prepmeup)  
**Admin Portal:** [https://www.ridheshcybe.dpdns.org/prepmeup/admin](https://www.ridheshcybe.dpdns.org/prepmeup/admin)  
**Content Studio:** [https://www.ridheshcybe.dpdns.org/prepmeup/admin/content-studio](https://www.ridheshcybe.dpdns.org/prepmeup/admin/content-studio)  
**Directus CMS:** [https://cms.ridheshcybe.dpdns.org](https://cms.ridheshcybe.dpdns.org)  

---

## 1. Credentials & Production API Keys (Security)

- [ ] **1.1 Switch Razorpay Keys from Test to Live Mode**
  - In [Razorpay Dashboard](https://dashboard.razorpay.com), switch to **Live Mode**.
  - Generate a **Live Key ID** (`rzp_live_...`) and **Live Key Secret**.
  - Update `.env`:
    ```env
    NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
    RAZORPAY_KEY_ID=rzp_live_...
    RAZORPAY_KEY_SECRET=your_live_secret
    ```
- [ ] **1.2 Configure Razorpay Webhook in Dashboard**
  - Go to **Razorpay Dashboard $\to$ Settings $\to$ Webhooks $\to$ Add New Webhook**.
  - URL: `https://www.ridheshcybe.dpdns.org/api/prepmeup/payments/webhook`
  - Secret: Set a secure string and add to `.env`: `RAZORPAY_WEBHOOK_SECRET=your_secret`.
  - Events to enable: `payment.captured`, `payment.failed`, `order.paid`.
- [ ] **1.3 AI API Quota Verification**
  - Verify `GROQ_API_KEY` is valid and has active rate limits/credits for `llama-3.3-70b-versatile`.
  - Check that doubts (`/prepmeup/doubts`) and coding debug (`/prepmeup/coding`) respond within 1–2 seconds.
- [ ] **1.4 Admin & Database Credentials**
  - Verify admin password in `.env` (`ADMIN_PASSWORD`, `DIRECTUS_SECRET`, `POSTGRES_PASSWORD`) is strong and not using default test passwords.

---

## 2. Payment Flow & Transaction Verification

- [ ] **2.1 Live UPI & QR Code Test**
  - Open `/prepmeup/checkout` on a mobile browser or PC.
  - Test opening the payment modal with a small live transaction (e.g. ₹1 test product or ₹99 tier).
  - Verify popular UPI apps (Google Pay, PhonePe, Paytm, BHIM) appear cleanly in the Razorpay sheet.
  - Verify payment receipt displays real Order ID, Payment ID, and auto-unlocks `/prepmeup/dashboard`.
- [ ] **2.2 Tier 0 Free Beta Claim Verification**
  - Test Tier 0 form on `/prepmeup#pricing`:
    - Enter a 10-digit WhatsApp number.
    - Check seat counter decrements properly (`#1/10` through `#10/10`).
    - Verify submission redirects cleanly to dashboard.
- [ ] **2.3 Payment Policy & Legal Compliance**
  - Check that terms, refund policy, and contact info links work on the checkout page.
  - Support contact email (`walavalkarridhesh@gmail.com`) and WhatsApp link are accurate.
  - Zero redirection: verify `/prepmeup/terms`, `/prepmeup/privacy`, `/prepmeup/refunds`, `/prepmeup/pricing-policy`, and `/prepmeup/contact` load directly with HTTP 200 OK.

---

## 3. Academic Content & Formula Rendering (Zero-Error Check)

- [ ] **3.1 SGPA / CGPA Tool** (`/prepmeup/tools/cgpa`)
  - Verify cumulative fraction formula has no raw HTML tags or unescaped `&lt;span&gt;`.
  - Test adding 3+ semesters and verify calculations match university grade cards.
- [ ] **3.2 Rank & Percentile Predictor** (`/prepmeup/tools/rank-percentile`)
  - Move score slider across low, median, and high values.
  - Verify $Z$-score equation ($Z = \frac{X - \mu}{\sigma}$) and rank formula ($\lceil N \cdot (1 - \Phi(Z)) \rceil$) render cleanly.
- [ ] **3.3 Subject Curriculum & Notes**
  - Open `/prepmeup/subjects/applied-computational-mathematics`:
    - Check Unit 1 to Unit 4 notes.
    - Confirm math matrices, derivatives, and code blocks render without syntax errors.
  - Open `/prepmeup/subjects/python-programming` and verify code block syntax highlighting.
- [ ] **3.4 Interactive Simulations**
  - Open `/prepmeup/simulations/call-stack`:
    - Test stepping through recursion frames ($n = 3$, $n = 4$).
    - Confirm stack pushes and pops reflect accurately in the visual stack tower.
  - Open `/prepmeup/simulations/ohms-law`:
    - Move voltage and resistance sliders; verify current graph recalculates.

---

## 4. Admin Management Hub & Live Controls

- [ ] **4.1 Admin Panel Access** (`/prepmeup/admin`)
  - Verify login with admin email and password works.
  - Check Directus CMS live health widget shows green (`● Live CMS Connected`).
- [ ] **4.2 Content Studio Authoring** (`/prepmeup/admin/content-studio`)
  - Type sample LaTeX note: `$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$`.
  - Verify live preview pane updates immediately.
  - Test saving/publishing and check audit log entry.
- [ ] **4.3 1:1 Mentorship Session Controls**
  - Verify existing student bookings are listed with student name, WhatsApp, and topic.
  - Click **"✓ Mark as Given"** and verify status toggles to green `GIVEN / COMPLETED`.
  - Test **"Launch Google Meet"** and **"WhatsApp Student"** buttons.
- [ ] **4.4 Dynamic Site Customization**
  - Test modifying top announcement ticker in **⚙️ Site Branding & Colors** tab.
  - Verify accent theme color picker updates the site's primary button hue.

---

## 5. Docker Infrastructure & Backup Verification

- [ ] **5.1 Docker Containers Health Check**
  - Run `docker compose ps` in `deploy/cms`:
    - `pmu_postgres` $\to$ `healthy`
    - `pmu_postgres_backup` $\to$ `healthy`
    - `pmu_directus` $\to$ `running`
    - `pmu_cloudflared` $\to$ `running`
    - `pmu_web` $\to$ `running`
- [ ] **5.2 Automated Database Backups**
  - Check `deploy/cms/backups/`:
    - Confirm SQL dump files exist or verify automated daily cron schedule (`@daily`).
- [ ] **5.3 Cloudflare Tunnel Status**
  - Log in to Cloudflare Zero Trust $\to$ Networks $\to$ Tunnels.
  - Confirm tunnel `ridheshcybe.dpdns.org` is in **HEALTHY** status.
  - Verify DNS routes point to `www.ridheshcybe.dpdns.org` and `cms.ridheshcybe.dpdns.org`.

---

## 6. Mobile Responsiveness & Browser Testing

- [ ] **6.1 Mobile Safari (iOS) & Chrome (Android)**
  - Test on real smartphone or Chrome DevTools (375px & 412px widths):
    - Check navbar hamburger menu toggles properly.
    - Check pricing cards stack vertically without horizontal overflow.
    - Verify LaTeX formulas scale horizontally without clipping card borders.
    - Verify checkout modal displays cleanly on mobile screen.
- [ ] **6.2 Offline / Error Resilience**
  - Test submitting doubt or payment when network drops; confirm user-friendly retry message is displayed.

---

## 7. Fast Re-deploy Command (Keep Handy)

Whenever any code, content, or `.env` variable is changed:

```powershell
npm run build
robocopy .next\static .next\standalone\.next\static /E /NFL /NDL /NJH /NJS /nc /ns /np
robocopy public .next\standalone\public /E /NFL /NDL /NJH /NJS /nc /ns /np
cd deploy\cms
docker compose restart web
```

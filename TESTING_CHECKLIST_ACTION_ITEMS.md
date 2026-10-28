# PrepMeUp AI — Manual Tester Verification Checklist

> **Instructions for the Tester:**  
> Each bullet point (`- [ ]`) represents **exactly one isolated test action** to perform.  
> Navigate to the specified URL, perform the action, and check off the item only when the observed behavior matches the expected verification.  
> 
> **Production Base URL:** [https://www.ridheshcybe.dpdns.org](https://www.ridheshcybe.dpdns.org)  
> **Direct Checkout URL:** [https://www.ridheshcybe.dpdns.org/checkout](https://www.ridheshcybe.dpdns.org/checkout)  
> **Directus CMS URL:** [https://cms.ridheshcybe.dpdns.org](https://cms.ridheshcybe.dpdns.org)  
> **Support Phone:** `+91 98207 43178` | **Support Email:** `walavalkarridhesh@gmail.com`

---

## 1. Public Portfolio & Global Routing

- [ ] **1.1 Load Portfolio Home:** Visit `https://www.ridheshcybe.dpdns.org` and verify the preloader smoothly fades into the dark brutalist hero section (`#08080a`).
- [ ] **1.2 Verify Top Navbar Brand Link:** On `https://www.ridheshcybe.dpdns.org`, click the **PrepMeUp AI** link in the top navigation and confirm it navigates directly to `/prepmeup`.
- [ ] **1.3 Legacy /courses 307 Redirect:** Enter `https://www.ridheshcybe.dpdns.org/courses` into the address bar and verify an immediate `307 Temporary Redirect` sends you to `/prepmeup` (no 404).
- [ ] **1.4 Legacy /courses/login Redirect:** Enter `https://www.ridheshcybe.dpdns.org/courses/login` and verify it redirects to `/prepmeup`.
- [ ] **1.5 Case Study Page:** Visit `https://www.ridheshcybe.dpdns.org/projects/prepmeup-ai` and verify architecture breakdown cards and live stats strip load with HTTP 200 OK.
- [ ] **1.6 Contact Section Email Copy:** On `https://www.ridheshcybe.dpdns.org#contact`, click the displayed email address and verify `walavalkarridhesh@gmail.com` is selectable and copyable.

---

## 2. Public Academic Calculators (No Login Required)

- [ ] **2.1 SGPA Calculator Default Load:** Visit `https://www.ridheshcybe.dpdns.org/prepmeup/tools/cgpa`, ensure **Tab 1 — Semester SGPA Calculator** is active, and click **Load Sem 1 Subjects**.
- [ ] **2.2 SGPA 6-Subject Auto-Population:** Verify 6 DYPIU courses populate (ACM, BEEE, COA, FWT, Python, IKS) with realistic credit distributions (3 to 4 credits each).
- [ ] **2.3 SGPA Perfect 10.00 Calculation:** In the SGPA calculator, set every course letter grade dropdown to `O` (Grade Point 10) and confirm the calculated score displays `SGPA: 10.00 / 10.00`.
- [ ] **2.4 SGPA Fail Grade Impact:** In the SGPA calculator, change one 4-credit course from `O` to `F` (Grade Point 0) and confirm the overall SGPA drops according to the formula:
  $$\text{SGPA} = \frac{\sum (C_i \cdot G_i)}{\sum C_i}$$
- [ ] **2.5 SGPA Add Custom Subject Row:** In the SGPA calculator, click **+ Add Subject**, enter "Differential Equations", 3 credits, letter grade `A`, and confirm the total credits and SGPA recalculate.
- [ ] **2.6 SGPA Delete Subject Row:** In the SGPA calculator, click the trash/remove icon on any row and verify that the row disappears and the summary updates immediately.
- [ ] **2.7 SGPA Zero Credit Guard:** In the SGPA calculator, set all course credits to `0` and verify the calculator displays a graceful `0.00` rather than `NaN`.
- [ ] **2.8 CGPA Calculator Tab Switch:** On `https://www.ridheshcybe.dpdns.org/prepmeup/tools/cgpa`, click **Tab 2 — Multi-Semester Cumulative CGPA Calculator**.
- [ ] **2.9 CGPA Weighted Calculation:** Enter Semester 1: `20` credits, `8.50` SGPA; Semester 2: `22` credits, `9.10` SGPA, and verify cumulative score computes to `8.81 CGPA` with `First Class with Distinction` badge.
- [ ] **2.10 CGPA Add & Remove Semester:** In the CGPA calculator, click **+ Add Semester**, input Semester 3 values, verify recalculation, and click **- Remove** to verify deletion.
- [ ] **2.11 Rank Predictor Average Score Test:** Visit `https://www.ridheshcybe.dpdns.org/prepmeup/tools/rank-percentile` and set **Score** to `60`, **Mean** to `60`, **Std Dev** to `10`, **Batch Size** to `120`. Verify $Z$-score displays `0.00`, Percentile displays `50.00%`, and Predicted Rank displays `#60 / 120`.
- [ ] **2.12 Rank Predictor High Achiever Test:** On the Rank Predictor, move **Score** slider to `85` (with Mean `60`, Std Dev `10`, Batch `120`) and verify $Z$-score displays `+2.50`, Percentile displays `~99.38%`, and Rank displays `#1 / 120`.
- [ ] **2.13 Rank Predictor Zero Division Guard:** On the Rank Predictor, attempt to move the Standard Deviation slider to `0` and confirm it is clamped at a minimum of $\sigma \ge 1$ to prevent `NaN`.

---

## 3. Student Authentication, Onboarding & Session Security

- [ ] **3.1 Login Incomplete Phone Validation:** Visit `https://www.ridheshcybe.dpdns.org/prepmeup/login`, type 9 digits (`982074317`), click **Send Verification OTP →**, and verify red error: `Please enter a valid 10-digit Indian mobile number`.
- [ ] **3.2 Login Alphabetic Input Validation:** On the login page, attempt to type letters (`abcdefghij`) in the phone input and verify non-numeric characters are rejected.
- [ ] **3.3 Login Valid Phone OTP Dispatch:** On the login page, enter `9820743178` and click **Send Verification OTP →**. Verify transition to OTP verification screen.
- [ ] **3.4 OTP Invalid Code Rejection:** On `https://www.ridheshcybe.dpdns.org/prepmeup/verify-otp`, enter incorrect code `000000`, click verify, and confirm error alert: `Invalid OTP code`.
- [ ] **3.5 OTP Valid Code Session Provisioning:** Enter valid test OTP, click **Verify & Access Workspace →**, and confirm redirection to `/prepmeup/dashboard` with HTTP 200 OK.
- [ ] **3.6 Cookie Security Flags:** Open DevTools &rarr; Application &rarr; Cookies for `ridheshcybe.dpdns.org` and verify `pmu-session` cookie has `HttpOnly` enabled and `SameSite=Lax`.
- [ ] **3.7 Student Workspace Sign Out:** From `/prepmeup/dashboard`, click **Sign Out** in the sidebar or top header and confirm immediate redirection to `/prepmeup/login`.
- [ ] **3.8 Post-Sign Out Back-Button Guard:** Immediately after signing out, click the browser **Back** button and confirm you are denied access and redirected back to `/prepmeup/login`.

---

## 4. 3-Tier Financial Model & Razorpay Checkout Suite

- [ ] **4.1 Tier 0 Free Beta Form View:** Visit `https://www.ridheshcybe.dpdns.org/prepmeup#pricing` and scroll to the **Tier 0 Free Beta Pass (First 10 Students)** card.
- [ ] **4.2 Tier 0 Empty Phone Submission:** In the Tier 0 form, leave the WhatsApp input empty, click **Claim Tier 0: Free Beta Pass (First 10) →**, and verify error prompt requesting a 10-digit mobile number.
- [ ] **4.3 Tier 0 Unchecked Pledge Submission:** Enter `9820743178`, uncheck the **Beta Tester Pledge** checkbox, click claim, and verify validation prompt requiring pledge consent.
- [ ] **4.4 Tier 0 Successful Claim:** Check the pledge, select struggle dropdown (e.g. `ACM-101`), click claim, and verify seat confirmation screen (e.g. `Seat #1/10 Claimed`).
- [ ] **4.5 Tier 0 Auto-Unlock Dashboard:** Click **Continue to Student Workspace →** on the claim confirmation screen and verify the dashboard opens unlocked.
- [ ] **4.6 Standalone Checkout Default Values:** Visit `https://www.ridheshcybe.dpdns.org/checkout` and verify preselected amount is `₹1.00 (Test Min)` and contact phone is prefilled with `9820743178`.
- [ ] **4.7 Standalone Checkout Amount Switch:** On `/checkout`, click **₹99.00 (Tier 1)** button and confirm total payable updates to `₹99.00`. Click **₹199.00 (Tier 2)** and confirm it updates to `₹199.00`.
- [ ] **4.8 Standalone Checkout Custom Amount Validation:** On `/checkout`, select custom amount, enter `0.50`, click pay, and verify error alert requiring minimum amount of at least ₹1.00 (100 paise).
- [ ] **4.9 Razorpay Modal Launch:** On `/checkout`, select **₹1.00 (Test Min)** and click **Pay ₹1.00 via Razorpay Standard Checkout**. Verify the official Razorpay checkout modal opens displaying active `order_...` ID.
- [ ] **4.10 Razorpay Modal User Cancellation:** In the opened Razorpay payment sheet, click the top-right `✕` dismiss button and confirm the modal closes cleanly with warning message: `Payment cancelled or dismissed. Click the button above to retry.` (zero page crash).
- [ ] **4.11 Real ₹1.00 Live Payment Flow:** On `/checkout`, click pay, select UPI, scan QR code via Google Pay / PhonePe / Paytm, and authorize the ₹1.00 charge on your mobile phone.
- [ ] **4.12 Payment Verified Receipt Screen:** Confirm the browser transitions to green verified receipt screen displaying real Order ID (`order_...`), Payment ID (`pay_...`), and timestamp.
- [ ] **4.13 Post-Payment Dashboard Transition:** Click **Access Student Workspace →** on the payment receipt and confirm `/prepmeup/dashboard` unlocks.
- [ ] **4.14 Cryptographic Signature Tamper Rejection:** Send a POST request to `https://www.ridheshcybe.dpdns.org/api/verify-payment` with a fake signature and confirm response is `HTTP 400 Bad Request` with `Signature mismatch: Invalid Razorpay cryptographic signature.`.
- [ ] **4.15 Razorpay Webhook Health:** Send a GET request or inspect `https://www.ridheshcybe.dpdns.org/api/prepmeup/payments/webhook` and confirm route exists and rejects unsigned payloads with `HTTP 400`.

---

## 5. Daily High-Yield Academic Capsule & Global Notification System

- [ ] **5.1 Notification Banner Top Alignment:** Visit `https://www.ridheshcybe.dpdns.org/prepmeup/dashboard` and confirm the top notification bar appears with pulsing bell icon: `🔔 New Daily Drop: [Topic] • +50 XP`.
- [ ] **5.2 Notification Banner Smooth Scroll:** Click **Study Capsule & Quiz →** on the notification banner and verify the page smoothly scrolls directly down to the `#daily-capsule` section.
- [ ] **5.3 Notification Dismissal Behavior:** Click the `✕` close button on the notification banner and confirm it immediately disappears.
- [ ] **5.4 Notification Dismissal Persistence:** Refresh `/prepmeup/dashboard` after dismissing and confirm the notification banner remains hidden.
- [ ] **5.5 Daily Capsule Header Badges:** Inspect the Daily Academic Capsule card and verify the active subject badge (e.g. `CSE1002 • Basic Electrical & Electronics Engineering`), read time, date, and `⭐ Earn +50 XP` badge display cleanly.
- [ ] **5.6 Daily Capsule Tab 1 (60s Summary):** Click **⚡ 60-Second Exam Summary** tab and verify 4–5 bullet points render with formatted LaTeX formulas (no raw `$` symbols).
- [ ] **5.7 Daily Capsule Tab 2 (Deep Notes):** Click **📖 Deep High-Yield Notes & Derivations** tab and verify display math equations ($$...$$) and step-by-step worked numerical examples render cleanly.
- [ ] **5.8 Daily Capsule Tab 3 (Quiz Question 1 Option Selection):** Click **🎯 Daily Diagnostic Quiz (3 Qs)** tab and click option `A` on Question 1. Confirm option highlights with orange border.
- [ ] **5.9 Daily Capsule Quiz Answer Evaluation:** With an option selected on Question 1, click **Check Answer →**. If correct, confirm green badge `✓ Correct (+15 XP)`; if incorrect, confirm red badge `✕ Incorrect`.
- [ ] **5.10 Daily Capsule Step-by-Step LaTeX Explanation:** On the evaluated question, confirm a card expands below showing: `Step-by-Step LaTeX Explanation:` with complete mathematical justification.
- [ ] **5.11 Daily Capsule Locked After Submit:** Verify that after clicking "Check Answer" on a question, its options are disabled and cannot be changed.
- [ ] **5.12 Daily Capsule Full Quiz Completion Reward:** Complete Questions 2 and 3 and verify the completion alert appears: `🎉 Daily Capsule Completed! Score: X / 3 • You have earned +50 XP and updated your study streak.`.
- [ ] **5.13 Daily Capsule Completion Persistence:** Refresh the page and confirm the capsule status displays `✓ Completed (+50 XP)`.
- [ ] **5.14 Admin Daily Capsule Generator View:** Log in to `https://www.ridheshcybe.dpdns.org/prepmeup/admin/content-studio` and locate the top card: **🔥 Daily High-Yield Capsule & Broadcast Hub**.
- [ ] **5.15 Admin AI Capsule Generation:** Select subject `CSE1003`, type topic `Booth's Multiplication Algorithm with Step-by-Step Register Trace`, and click **⚡ Generate Daily Note, Quiz & Summary with AI →**.
- [ ] **5.16 Admin AI Capsule Preview Tabs:** Verify generated preview card renders within ~3–5 seconds with preview tabs for 60s Summary, Full LaTeX Notes, and Quiz Questions.
- [ ] **5.17 Admin Broadcast to All Students:** Click **🚀 Broadcast to All Students (+50 XP Drop) →** in the admin studio and confirm green alert: `🚀 Capsule published and broadcast to all students!`.
- [ ] **5.18 Student Notification Reappearance on Broadcast:** Visit `/prepmeup/dashboard` in an incognito window and verify the new Booth's Multiplier capsule and notification banner are live.

---

## 6. Academic Curriculum, LaTeX Notes & DRM Protection

- [ ] **6.1 Subject Catalog Overview:** Visit `https://www.ridheshcybe.dpdns.org/prepmeup/subjects` and confirm all 6 Semester 1 subjects render with course codes, credits, and module counts.
- [ ] **6.2 ACM Notes Page:** Open `/prepmeup/subjects/applied-computational-mathematics` and verify matrix brackets ($\begin{bmatrix} ... \end{bmatrix}$) and row operations render without LaTeX syntax errors.
- [ ] **6.3 ACM Fullscreen Note Reader:** Click **Expand Fullscreen →** on any ACM topic and confirm the modal reader expands with clear mathematical typesetting and close button.
- [ ] **6.4 BEEE Notes Experiment 1:** Open `/prepmeup/subjects/basic-electrical-and-electronics-engineering` and verify Experiment 1 (KCL/KVL) displays circuit loop equations and full observation table.
- [ ] **6.5 BEEE Notes Experiment 2:** On BEEE page, check Experiment 2 (Thévenin & Norton) and verify equivalent circuit formulas ($V_{th}, R_{th}, I_N$) and sample calculation tables render.
- [ ] **6.6 BEEE Notes Experiment 3:** Check Experiment 3 (Superposition) and verify dual independent DC source tables render cleanly.
- [ ] **6.7 BEEE Notes Experiment 4:** Check Experiment 4 (Series RLC Resonance) and verify frequency formula $f_0 = \frac{1}{2\pi\sqrt{LC}}$ and observation columns render.
- [ ] **6.8 BEEE Notes Experiment 5:** Check Experiment 5 (Single-Phase Transformer Load Test) and verify efficiency ($\eta\%$) and regulation formulas render.
- [ ] **6.9 COA Booth's Multiplication Table:** Open `/prepmeup/subjects/computer-organization-and-architecture` and verify Booth's multiplication trace table displays register columns ($A, Q, Q_{-1}$, Count) and arithmetic right shift (`ASHR`) steps.
- [ ] **6.10 COA IEEE-754 Conversions:** On COA page, verify IEEE-754 Single Precision (32-bit: 1 sign, 8 exponent, 23 mantissa) and Double Precision (64-bit) conversion steps display cleanly.
- [ ] **6.11 FWT Semantic HTML5 & CSS Notes:** Open `/prepmeup/subjects/fundamental-web-technologies` and verify HTML5 templates and CSS Grid/Flexbox code blocks have syntax highlighting.
- [ ] **6.12 Python OOP & Generators Notes:** Open `/prepmeup/subjects/python-programming` and verify inheritance, magic methods (`__init__`, `__str__`), and generator `yield` examples render.
- [ ] **6.13 IKS Vedic Math & Metallurgy Notes:** Open `/prepmeup/subjects/indian-knowledge-systems` and verify *Nikhilam* sutras, Wootz crucible steel, and Delhi Iron Pillar corrosion resistance explanations render.
- [ ] **6.14 DRM Copy Prevention Test:** On any note page, highlight text and press `Ctrl+C`. Verify that clipboard copy is intercepted and prevented.
- [ ] **6.15 DRM Right-Click Menu Block Test:** On any note card, right-click and verify the default browser context menu is disabled.
- [ ] **6.16 DRM DevTools Shortcut Block Test:** On any note page, press `F12` and `Ctrl+Shift+I` and confirm key events are intercepted.
- [ ] **6.17 Dynamic Canvas Watermark Test:** Observe the semi-transparent diagonal watermark across the notes background and verify it displays your registered name, phone number, and timestamp.

---

## 7. Interactive Engineering Atlas & Simulations Suite

- [ ] **7.1 Dashboard Atlas Spotlight Card:** Visit `/prepmeup/dashboard` and locate the **Visual Engineering Atlas & Laboratory** spotlight banner.
- [ ] **7.2 Dashboard Atlas Quick Launch Buttons:** On the dashboard Atlas card, click **📐 ACM Matrix Vector Field →** and verify it opens `/prepmeup/simulations/atlas-acm` directly.
- [ ] **7.3 Simulations Hub Filter Tabs:** Visit `https://www.ridheshcybe.dpdns.org/prepmeup/simulations` and click the **🌌 Knowledge Atlas (5)** tab. Confirm only Atlas cards are visible.
- [ ] **7.4 Simulations Hub BEE Filter:** On `/prepmeup/simulations`, click **⚡ Basic Electrical (BEE) (5)** and verify 5 BEE circuit simulators filter into view.
- [ ] **7.5 Simulations Hub Python Filter:** On `/prepmeup/simulations`, click **🐍 Python Programming (5)** and verify 5 Python visualizers filter into view.
- [ ] **7.6 Fullscreen Atlas Runner Load:** Open `https://www.ridheshcybe.dpdns.org/prepmeup/simulations/atlas` and verify the embedded Atlas canvas loads inside the student shell with top module tab bar.
- [ ] **7.7 Atlas Tab Switcher in Runner:** In the Atlas runner, click **⚡ BEEE Oscilloscope Lab** and confirm view switches to dual AC waveform canvas without reloading the page.
- [ ] **7.8 Atlas Fullscreen Mode Toggle:** Click **⛶ Fullscreen** button in the Atlas runner and confirm canvas expands to full window. Click **✕ Close Fullscreen** and verify it returns to normal size.
- [ ] **7.9 Atlas Standalone Tab Launch:** Click **Open Standalone ↗** in the Atlas runner and confirm `/atlas.html` opens in a new browser tab.
- [ ] **7.10 Atlas COA Pipeline Hazard Toggle:** Navigate to `/prepmeup/simulations/atlas-coa`, click **Disable Forwarding**, and verify pipeline bubbles (stalls) inject into the clock cycle execution table. Click **Enable Forwarding** and verify stalls eliminate.
- [ ] **7.11 Atlas ACM Matrix Transformation:** Navigate to `/prepmeup/simulations/atlas-acm`, adjust matrix coefficients $a, b, c, d$, and verify the vector field grid and unit circle warp in real time.
- [ ] **7.12 Atlas BEEE Scope Phase Shift:** Navigate to `/prepmeup/simulations/atlas-beee`, adjust the Phase slider, and verify Channel 2 AC sine wave shifts relative to Channel 1.
- [ ] **7.13 Ohm's Law Simulator Sliders:** Open `/prepmeup/simulations/ohms-law`, adjust Voltage to `12V` and Resistance to `4\Omega`, and verify calculated Current displays `3.00A` and Power displays `36.00W`.
- [ ] **7.14 Call Stack Recursion Stepper:** Open `/prepmeup/simulations/call-stack`, select `factorial(4)`, click **Step Next →** 5 times, and verify stack frames push and pop with return values `1 -> 2 -> 6 -> 24`.

---

## 8. Live AI Doubt Solver & In-Browser Python Lab

- [ ] **8.1 Doubt Solver Math Prompt:** Open `https://www.ridheshcybe.dpdns.org/prepmeup/doubts`, select **Applied Computational Mathematics**, click prompt chip: `How do I find eigenvalues of a 2x2 matrix?`, and click **Submit Doubt to AI Tutor →**.
- [ ] **8.2 Wait Mini-Lab Interaction:** While the AI request processes, click the **AND** and **XOR** buttons on the interactive logic gate simulator and confirm gate pulse counter increments.
- [ ] **8.3 AI Math Response Verification:** Confirm within 1–2 seconds that the AI tutor returns formatted KaTeX display equations showing characteristic roots $\det(A - \lambda I) = 0$.
- [ ] **8.4 Doubt Solver Python Traceback Query:** In the doubt solver, paste code with an intentional bug (`print(10 / 0)`), submit, and confirm AI identifies `ZeroDivisionError` and provides corrected code.
- [ ] **8.5 Python Coding Lab WASM Init:** Open `https://www.ridheshcybe.dpdns.org/prepmeup/coding` and confirm toolbar displays green status: `● Python 3.11 WASM Ready`.
- [ ] **8.6 Coding Lab Challenge Execution:** In the coding lab, click **Matrix Trace Challenge** preset and click **Submit & Analyze Code →**.
- [ ] **8.7 Coding Lab Automated Grading:** Confirm the terminal outputs `Trace: 15` and displays green checkmark `[PASS] All Test Cases Passed! (+25 XP)`.

---

## 9. Admin Command Center & Directus Headless CMS

- [ ] **9.1 Admin Login View:** Visit `https://www.ridheshcybe.dpdns.org/prepmeup/admin/login` and verify brutalist dark admin login card loads.
- [ ] **9.2 Admin Invalid Credentials:** Enter wrong password and confirm error alert: `Invalid admin credentials`.
- [ ] **9.3 Admin Valid Authentication:** Enter `walavalkarridhesh@gmail.com` and your admin password from `.env`. Confirm redirect to `/prepmeup/admin`.
- [ ] **9.4 Live CMS Health Status:** In the admin header, verify the green connection pill displays: `● Live CMS Connected`.
- [ ] **9.5 1:1 Mentorship Launch Meet:** On `/prepmeup/admin`, locate a student booking row and click **Launch Google Meet ↗**. Confirm Google Meet tab opens.
- [ ] **9.6 1:1 Mentorship WhatsApp Student:** On the booking row, click **WhatsApp Student ↗** and confirm WhatsApp Web launches prefilled with student's number.
- [ ] **9.7 1:1 Mentorship Mark as Given:** Click **✓ Mark as Given** on a booking row and confirm status toggles to green `COMPLETED / GIVEN`.
- [ ] **9.8 Content Studio Split-Pane Editor:** Visit `/prepmeup/admin/content-studio`, type LaTeX math `$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$` in the editor, and confirm the right-hand live preview pane updates in real time.
- [ ] **9.9 Directus Headless CMS Access:** Open `https://cms.ridheshcybe.dpdns.org` in a new tab and confirm the Directus login screen loads over HTTPS without security warnings.

---

## 10. Legal, Compliance & Support Helpline

- [ ] **10.1 Merchant Contact Phone Verification:** Visit `https://www.ridheshcybe.dpdns.org/prepmeup/contact` and verify WhatsApp Student Helpline displays **`+91 98207 43178`** (no dummy numbers).
- [ ] **10.2 Merchant Contact Email Verification:** On the contact page, verify official email displays **`walavalkarridhesh@gmail.com`**.
- [ ] **10.3 Terms of Service Direct Load:** Visit `https://www.ridheshcybe.dpdns.org/prepmeup/terms` and verify page loads with HTTP 200 OK (no redirects).
- [ ] **10.4 Privacy Policy Direct Load:** Visit `https://www.ridheshcybe.dpdns.org/prepmeup/privacy` and verify page loads with HTTP 200 OK.
- [ ] **10.5 Refund & Cancellation Policy Direct Load:** Visit `https://www.ridheshcybe.dpdns.org/prepmeup/refunds` and verify 7-day money-back guarantee terms load with HTTP 200 OK.
- [ ] **10.6 Pricing & Delivery Policy Direct Load:** Visit `https://www.ridheshcybe.dpdns.org/prepmeup/pricing-policy` and verify instant digital fulfillment terms load with HTTP 200 OK.

---

## 11. Responsive Design, Mobile Viewports & Network Throttling

- [ ] **11.1 Mobile Drawer Navigation:** Open DevTools, emulate iPhone 14 (375px width), click the top-left hamburger button, and confirm mobile navigation drawer opens smoothly.
- [ ] **11.2 Mobile Drawer Route Jump:** In the mobile drawer, tap **Quizzes** and verify the page navigates to `/prepmeup/quizzes` and the drawer auto-closes.
- [ ] **11.3 Mobile Pricing Cards Vertical Stacking:** On mobile viewport, scroll to `/prepmeup#pricing` and verify Tier 0, Tier 1, and Tier 2 cards stack vertically without horizontal overflow.
- [ ] **11.4 Mobile Math Horizontal Scrolling:** On mobile viewport, inspect a wide display math equation or observation table and verify horizontal touch-scrolling is enabled without clipping card borders.
- [ ] **11.5 Mobile Razorpay Modal Presentation:** Click the checkout button on mobile viewport and verify Razorpay's checkout sheet adapts to full mobile screen width.
- [ ] **11.6 Slow 3G Network Resilience:** In DevTools Network tab, select **Slow 3G** throttling, navigate between subjects, and confirm loading skeleton indicators appear without white-screen crashes.

---

## Tester Sign-Off Form

| Field | Value |
| :--- | :--- |
| **Tester Full Name:** | ____________________________________ |
| **Testing Device / OS:** | ____________________________________ |
| **Browser Tested (Chrome / Safari / Firefox):** | ____________________________________ |
| **Total Test Points Passed:** | _____ / 95 |
| **Date of Verification:** | ____________________________________ |
| **Final Sign-Off (Ready for Public):** | `[  ] APPROVED` / `[  ] DEFECTS FOUND` |

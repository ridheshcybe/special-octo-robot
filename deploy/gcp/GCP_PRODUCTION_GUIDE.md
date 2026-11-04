# GCP Strategy C — Autonomous Production Deployment & Hardening Guide

This guide details how to launch **PrepMeUp AI** on **Google Cloud Platform (GCP)** so that it operates **cheap ($0–$3/mo)**, **fast (Cloudflare Edge CDN)**, and **fully autonomous** with maximum protection against **hackers** and **copycats** while you are away.

---

## 1. Create the 100% Free Forever GCP Virtual Machine

Google Cloud's **Always Free Program** includes **1 free `e2-micro` instance** forever (no expiration) in select US regions.

### Steps in Google Cloud Console ([console.cloud.google.com](https://console.cloud.google.com)):
1. Navigate to **Compute Engine** $\to$ **VM Instances** $\to$ Click **Create Instance**.
2. **Name:** `pmu-production-vm`
3. **Region:** Select one of the Always Free eligible regions:
   * `us-central1` (Iowa)
   * `us-east1` (South Carolina)
   * `us-west1` (Oregon)
4. **Machine Configuration:**
   * Series: **E2**
   * Machine type: **`e2-micro` (2 vCPU, 1 GB memory)** *(Free tier eligible)*.
5. **Boot Disk:**
   * Click **Change**.
   * Operating System: **Ubuntu**
   * Version: **Ubuntu 22.04 LTS x86/64**
   * Boot disk type: **Standard persistent disk**
   * Size: **30 GB** *(Free tier covers up to 30 GB standard disk per month)*.
6. **Firewall:**
   * **Uncheck** "Allow HTTP traffic" and **Uncheck** "Allow HTTPS traffic".  
     *(Because we use Cloudflare Tunnel, we do NOT need any open public HTTP/HTTPS ports. The server stays invisible to internet scanners).*
7. Click **Create**.

---

## 2. One-Click VM Provisioning & Hardening Script

1. In the GCP Console, click the **SSH** button next to your new VM instance.
2. Clone your repository (or copy your `deploy/` and standalone build):
   ```bash
   git clone <YOUR_GIT_REPO_URL> portfolio
   cd portfolio/deploy/gcp
   chmod +x setup-gcp-vm.sh
   ./setup-gcp-vm.sh
   ```

### What This Script Does Automatically:
* **Anti-OOM Protection:** Installs a **2 GB Swap file** with `swappiness=10`. This allows Docker to run Next.js, Directus, and PostgreSQL on 1 GB RAM without out-of-memory crashes.
* **Firewall Lockdown (Stealth Mode):** Closes all inbound HTTP/HTTPS ports. Attackers scanning your GCP public IP find **0 open ports**.
* **Autonomous Systemd Watchdog:** Sets up `pmu-stack.service` to auto-restart the entire container stack if GCP migrates the VM or reboots for hardware maintenance.

---

## 3. Anti-Hacker Protection Architecture

```
                  ┌──────────────────────────────────────────────────┐
                  │          Cloudflare Global Edge Network          │
                  │  • DDoS Mitigation (300 Tbps Capacity)           │
                  │  • Web Application Firewall (WAF)                │
                  │  • Bot Fight Mode & Scraping Defense             │
                  │  • Edge SSL / TLS 1.3 & HTTP/3                   │
                  └─────────────────────────┬────────────────────────┘
                                            │ Outbound Encrypted Tunnel
                                            ▼ (Port 443 only - 0 Inbound Ports)
                  ┌──────────────────────────────────────────────────┐
                  │         Google Cloud VM (e2-micro)               │
                  │  • Inbound Firewall: DENY ALL                    │
                  │  • Linux 2GB Swap Anti-OOM Watchdog              │
                  │  • Docker Network: Private pmu_network           │
                  │  • Nightly Automated DB Backups                  │
                  └──────────────────────────────────────────────────┘
```

### 1. Zero Inbound Ports
* By using `cloudflared` (Cloudflare Tunnel), the server initiates an outbound tunnel.
* Port 80 and 443 are **closed** on GCP. Shodan, Censys, and automated bot vulnerability scanners cannot even discover that a server exists at the IP.

### 2. Cloudflare Rate Limiting (Free Tier)
In [Cloudflare Dashboard](https://dash.cloudflare.com) $\to$ **Security** $\to$ **WAF** $\to$ **Rate limiting rules**:
* **Rule 1 — Anti-OTP Abuse:**
  * Path: `URI Path starts with "/api/prepmeup/auth/"`
  * Action: Block if requests exceed `5 requests per 10 seconds per IP`.
* **Rule 2 — Anti-Payment Spooling:**
  * Path: `URI Path starts with "/api/prepmeup/payments/"`
  * Action: Block if requests exceed `10 requests per 1 minute per IP`.

### 3. Edge DDoS & Cloudflare Bot Fight Mode
* Go to **Security** $\to$ **Bots** $\to$ Enable **Bot Fight Mode** (Free).
* Blocks malicious crawlers, headless browser scanners, and automated credential stuffers.

---

## 4. Anti-Copycat & Intellectual Property Protection

To protect your course materials, LaTeX notes, and past paper answers from being stolen or re-uploaded by competitors:

1. **Integrated Dynamic DRM Watermarking:**
   * Embedded in [`SubjectTabsClient.tsx`](file:///c:/Users/admin/Downloads/code/portfolio/app/prepmeup/(student)/subjects/[subjectSlug]/SubjectTabsClient.tsx) and [`prepmeup.css`](file:///c:/Users/admin/Downloads/code/portfolio/app/prepmeup/prepmeup.css).
   * Renders a persistent diagonal watermark (`PREPMEUP AI • VERIFIED STUDENT ACCESS • STRICTLY CONFIDENTIAL`) across the study note reader.
   * If a student takes a screenshot or screen recording, the watermark is visible, preventing distribution on Telegram/WhatsApp.

2. **Right-Click & Text Scraping Prevention:**
   * The reader container enforces `user-select: none` and `onContextMenu={(e) => e.preventDefault()}`.
   * Users cannot right-click to copy proprietary derivations or view rendered DOM strings.

3. **Backend API Gatekeeping:**
   * Full study chapters are generated server-side and authenticated through encrypted JWT session cookies. Unauthenticated visitors only receive public metadata and sample snippets.

---

## 5. Self-Healing & "While You Are Gone" Checklist

Before leaving the platform to run autonomously:

1. **Docker Container Auto-Restart:**
   * Verified in `docker-compose.yml`: All 5 services (`pmu_web`, `pmu_directus`, `pmu_cloudflared`, `pmu_postgres`, `pmu_postgres_backup`) have `restart: unless-stopped`.
   * If any service crashes due to an exception, Docker revives it in **< 2 seconds**.

2. **Automated Daily Backups:**
   * `pmu_postgres_backup` runs daily at midnight (`@daily`).
   * Retains:
     * 7 daily backups
     * 4 weekly backups
     * 6 monthly backups
   * Snapshots are stored persistently in `deploy/cms/backups/`.

3. **Cloudflare Free Downtime Alerts:**
   * Go to **Cloudflare Zero Trust** $\to$ **Settings** $\to$ **Notifications**.
   * Add a notification: **Tunnel Health Alert** $\to$ Enter your email.
   * If your server ever goes down for more than 3 minutes, Cloudflare immediately emails you.

---

## 6. Monthly Cost Ledger (Target: 10 Users / Day)

| Resource | Service | Monthly Cost | Notes |
| :--- | :--- | :---: | :--- |
| **Compute** | GCP `e2-micro` (2 vCPU, 1 GB RAM) | **$0.00** | Covered under GCP Always Free Tier |
| **Storage** | 30 GB Standard Persistent Disk | **$0.00** | Covered under GCP Always Free Tier |
| **Bandwidth** | Cloudflare Edge CDN + GCP Egress | **$0.00** | Cloudflare caches static assets; egress < 5 GB |
| **SSL & DNS** | Cloudflare Universal SSL + Tunnel | **$0.00** | 100% Free |
| **AI Inference** | Groq API (`llama-3.3-70b-versatile`) | **$0.00** | Generous free daily tier for 10 users |
| **Total Monthly Operating Expense** | | **$0.00 / month** | **(Free Forever Tier)** |

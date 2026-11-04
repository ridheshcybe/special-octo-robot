# Cloud Deployment Cost Analysis & Hybrid Architecture Guide

**Target Application:** PrepMeUp AI & Portfolio (`pmu_web`, `pmu_directus`, `pmu_postgres`, `pmu_cloudflared`)  
**Target Traffic:** 10 active persons/day (~300 users/month, ~1,500 requests/day, ~5–10 GB bandwidth/month)  
**Strategy:** Home-Server Primary ($0/req) with Cloud Standby Reverse Proxy Failover  

---

## 1. Cost Summary Matrix (Min, Mean, Max)

| Architecture Strategy | Initial Setup | Min Cost / mo | Mean (Expected) / mo | Max (Upper Bound) / mo | Recommended Scenario |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Strategy A: Home Server Primary + Cloud Proxy** | **$0** | **$0.00** (₹0) | **$1.00 – $3.50** (~₹80 – ₹290) | **$5.00** (~₹415) | **Best ROI (Recommended)** |
| **Strategy B: AWS Lightsail VPS (24/7 Dedicated)** | **$0** (90d free) | **$0.00** (Trial) | **$3.50 – $5.00** (~₹290 – ₹415) | **$8.50** (~₹700) | Simplest 24/7 Dedicated Cloud |
| **Strategy C: GCP Always Free / Cloud Run** | **$0** ($300 credit) | **$0.00** (Free Tier) | **$4.00 – $10.00** (~₹330 – ₹830) | **$20.00** (~₹1,660) | Scale-to-Zero Serverless |

---

## 2. Strategy A Breakdown: Home Server Primary ($0/req) + Cloud Failover

In this model, your home machine acts as the primary compute engine. Traffic routes to the cloud standby only during home power outages, reboots, or network disconnects.

```
                  ┌──────────────────────────────────────────────┐
                  │   Cloudflare Edge (DNS + Health Monitor)     │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
        [Home PC Online: 90%+]                         [Home PC Offline: 10%]
                 │                                               │
                 ▼                                               ▼
     ┌───────────────────────┐                       ┌───────────────────────┐
     │  Home Server Tunnel   │                       │  Cloud Standby VPS    │
     │  $0.00 / request      │                       │  AWS Lightsail / GCP  │
     │  (Zero Compute Cost)  │                       │  $0 – $3.50 / month   │
     └───────────────────────┘                       └───────────────────────┘
```

* **Home PC Online Cost:** **$0.00** (Zero extra cloud compute or bandwidth bills).
* **Cloud Standby Cost:** $0.00 (using GCP Always Free `e2-micro`) or $3.50/mo (AWS Lightsail).
* **Expected Monthly Average:** **$1.00 – $3.50 / month**.

---

## 3. Cloud Provider Comparison for 10 Users/Day

### A. Google Cloud Platform (GCP)
* **Starting Cost:** $0.00 ($300 free trial credits for 90 days).
* **Free Tier Option (`e2-micro` VM):**
  * 1 `e2-micro` instance (2 vCPU, 1 GB RAM, 30 GB standard persistent disk) is **100% Free Forever** in US regions (`us-central1`, `us-east1`, `us-west1`).
  * *Requirement:* Configure a 2 GB Linux swap file to accommodate Directus + Next.js inside 1 GB RAM.
  * Cost: **$0.00 / month**.
* **Paid Managed Option (Cloud Run + Neon/Supabase DB):**
  * Cloud Run: Free tier includes 2,000,000 requests and 360,000 vCPU-seconds/mo (10 users/day consumes < 0.1% of quota).
  * External Postgres: Free tier on Supabase / Neon ($0).
  * Cost: **$0.00 – $2.00 / month**.

### B. Amazon Web Services (AWS)
* **Starting Cost:** $0.00 (3 months free on Lightsail plans).
* **AWS Lightsail (All-Inclusive Bundle — Highly Recommended over EC2):**
  * Unlike standard EC2, Lightsail does **not** charge extra for public IPv4 addresses ($3.65/mo on EC2) or egress bandwidth.
  * **Plan 1 (1 GB RAM, 1 vCPU, 40 GB SSD, 1 TB Data Transfer):** **$3.50 / month** (₹290).
  * **Plan 2 (2 GB RAM, 1 vCPU, 60 GB SSD, 3 TB Data Transfer):** **$5.00 / month** (₹415).
  * Runs the existing `deploy/cms/docker-compose.yml` stack with zero configuration changes.
* **Standard AWS EC2 (`t4g.small` + EBS + IPv4):**
  * EC2 Compute: ~$6.00/mo.
  * Public IPv4 Address: ~$3.65/mo ($0.005/hr).
  * EBS Storage (30 GB gp3): ~$2.40/mo.
  * Total: **$12.00 – $15.00 / month**.

---

## 4. Workload Profile Details (10 Persons / Day)

* **Daily Page Views / API Calls:** ~1,000 – 2,500 requests/day.
* **Monthly Requests:** ~30,000 – 75,000 requests/month.
* **Monthly Egress Bandwidth:** ~3 GB – 8 GB/month.
* **Database IOPS:** < 50 queries/minute (negligible).
* **AI Doubt Solver:** Processed via Groq API (`llama-3.3-70b-versatile`), requiring minimal local server CPU.

---

## 5. Summary Recommendation

1. **Keep Home Server + Cloudflare Tunnel as Primary:**
   * Delivers ultra-low latency, zero compute costs, and runs your local Docker configuration seamlessly.
2. **Setup AWS Lightsail ($3.50 or $5.00/mo) as Cloud Fallback:**
   * 3 months free trial.
   * Flat, predictable pricing without surprise bandwidth or IPv4 surcharges.
   * Capable of running all 5 Docker containers (`pmu_web`, `pmu_directus`, `pmu_postgres`, `pmu_postgres_backup`, `pmu_cloudflared`) reliably.

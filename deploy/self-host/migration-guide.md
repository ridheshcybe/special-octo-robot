# Self-Hosting Migration & Runbook: Local Server / PC

This runbook guides migrating PrepMeUp AI from cloud managed services (Vercel + Supabase) to a self-hosted physical server or high-performance workstation using Docker Compose and Cloudflare Tunnels.

---

## 1. Architecture Overview
- **Next.js Standalone Container**: Node.js 20 multi-stage build running the serverless-free standalone HTTP server.
- **Postgres 16 Container**: Dedicated relational engine mounting all `backend/prepmeup/migration-phase*.sql` scripts at init.
- **Redis 7 Container**: Ultra-fast caching and distributed sliding-window rate limiting.
- **NGINX Reverse Proxy**: Manages static asset caching and passes raw unbuffered webhook payloads to maintain cryptographic signature validity.
- **Cloudflare Tunnel (`cloudflared`)**: Establishes an outbound TLS tunnel to Cloudflare Edge. **No public IP, port forwarding, or firewall alterations required on your local network/PC.**

---

## 2. Prerequisites
1. **Docker Engine & Docker Compose**:
   ```bash
   docker --version
   docker compose version
   ```
2. **Cloudflare Account**:
   - Create a free Cloudflare Tunnel under **Zero Trust Dashboard → Networks → Tunnels**.
   - Create a public hostname entry: e.g. `prepmeup.yourdomain.com` pointing to `http://nginx:80`.
   - Copy the Tunnel token (`eyJh...`).

---

## 3. Database Migration from Supabase to Self-Hosted Postgres
To extract existing data from Supabase:

1. **Export existing schema and tables**:
   ```bash
   pg_dump -h db.<ref>.supabase.co -U postgres -d postgres \
     -t "pmu_*" \
     --data-only \
     --no-owner \
     --no-acl > prepmeup_supabase_backup.sql
   ```

2. **Start the local Docker Compose cluster**:
   ```bash
   cd deploy/self-host
   docker compose up -d postgres redis
   ```

3. **Restore the data into the local container**:
   ```bash
   cat prepmeup_supabase_backup.sql | docker compose exec -T postgres psql -U prepmeup -d prepmeup
   ```

---

## 4. Enabling Next.js Standalone Mode
Ensure `next.config.mjs` has `output: 'standalone'` enabled when building container images:
```javascript
const nextConfig = {
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  // ...
};
```

---

## 5. Launching the Full Stack
1. Create a `.env` file inside `deploy/self-host/.env`:
   ```env
   CLOUDFLARE_TUNNEL_TOKEN=eyJh...
   POSTGRES_USER=prepmeup
   POSTGRES_PASSWORD=your_strong_password_here
   POSTGRES_DB=prepmeup
   NEXT_PUBLIC_PMU_SUPABASE_URL=http://web:3000
   NEXT_PUBLIC_PMU_SUPABASE_ANON_KEY=local_anon_key
   PMU_SUPABASE_SERVICE_ROLE_KEY=local_service_role_key
   GEMINI_API_KEY=AIzaSy...
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
   RAZORPAY_KEY_SECRET=...
   RAZORPAY_WEBHOOK_SECRET=...
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_VERIFY_SERVICE_SID=VA...
   ```

2. Build and run:
   ```bash
   docker compose up -d --build
   ```

3. Check logs:
   ```bash
   docker compose logs -f web
   docker compose logs -f cloudflared
   ```

---

## 6. Updating Razorpay Webhook Destination
Once your tunnel is live at `https://prepmeup.yourdomain.com`:
1. Navigate to [Razorpay Dashboard → Settings → Webhooks](https://dashboard.razorpay.com/).
2. Edit or add the webhook URL:
   ```
   https://prepmeup.yourdomain.com/api/prepmeup/payments/webhook
   ```
3. Test a payment using test credentials and confirm `200 OK` in `docker compose logs -f web`.

---

## 7. Rollback & Disaster Recovery
If you need to revert to cloud hosting:
1. Re-point Cloudflare DNS back to Vercel CNAME (`cname.vercel-dns.com`).
2. Update the Razorpay Webhook endpoint to the Vercel domain.
3. Stop the local Docker stack:
   ```bash
   docker compose down
   ```

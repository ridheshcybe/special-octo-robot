# Self-Hosted Directus CMS & Cloudflare Tunnel Deployment Package

This package manages the local deployment of **Directus Headless CMS**, **PostgreSQL 16**, an automated **PostgreSQL Backup** daemon, and a zero-trust **Cloudflare Tunnel (`cloudflared`)** for public routing via `https://cms.yourdomain.com`.

---

## 1. Directory Structure

```text
deploy/cms/
├── docker-compose.yml       # Production multi-container orchestration
├── .env.example             # Clean configuration template
├── backups/                 # Automated daily Postgres dumps (7-day retention)
├── setup.sh                 # Linux / macOS / WSL automated setup script
└── setup.ps1                # Windows PowerShell automated setup script
```

---

## 2. Quickstart Automated Setup

### On Windows PowerShell:
```powershell
cd deploy\cms
.\setup.ps1
```

### On macOS / Linux / WSL:
```bash
cd deploy/cms
chmod +x setup.sh
./setup.sh
```

The script automatically:
1. Verifies Docker CLI & daemon are running.
2. Ensures the `./backups` directory exists with correct permissions.
3. Generates `.env` from `.env.example` if absent.
4. Pulls images and spins up containers in detached mode (`docker compose up -d`).
5. Polls Directus health until `http://localhost:8055/server/ping` returns `200 OK`.

---

## 3. Cloudflare Tunnel Configuration

To route traffic from `cms.yourdomain.com` directly to `http://directus:8055` inside the Docker bridge network:

1. **Create the Tunnel**:
   - Open **Cloudflare Dashboard → Zero Trust → Networks → Tunnels**.
   - Click **Create a Tunnel** → Select **Cloudflared**.
   - Name the tunnel (e.g. `pmu-directus-cms`).
   - Copy the Tunnel token (`eyJh...`) and set it as `CLOUDFLARE_TUNNEL_TOKEN` in your `.env`.

2. **Add the Public Hostname**:
   - In the Tunnel settings, open the **Public Hostnames** tab.
   - Click **Add a public hostname**:
     - **Subdomain**: `cms`
     - **Domain**: `yourdomain.com`
     - **Path**: *(leave empty)*
     - **Service Type**: `HTTP`
     - **URL**: `directus:8055`
       *(Cloudflare will resolve the internal container name `directus` over `pmu_network`)*.
   - Save the hostname.

---

## 4. Verification Runbook & Terminal Commands

### 1. Check Container Health
```bash
docker compose ps
```
Expected output:
- `pmu_postgres` — `Up (healthy)`
- `pmu_postgres_backup` — `Up`
- `pmu_directus` — `Up`
- `pmu_cloudflared` — `Up`

### 2. Check Cloudflare Tunnel Connection
```bash
docker compose logs -f cloudflared
```
Confirm the log output contains:
`INF Connection registered with Cloudflare edge`

### 3. Verify Local Directus Ping
```bash
# Windows PowerShell
(Invoke-WebRequest -Uri "http://localhost:8055/server/ping").Content
# Linux / macOS
curl -I http://localhost:8055/server/ping
```
Expected: `200 OK` (Body: `"pong"`).

### 4. Verify Public HTTPS Tunnel Route
```bash
curl -I https://cms.yourdomain.com/server/ping
```
Expected: `HTTP/2 200` with Cloudflare headers (`cf-ray`).

### 5. Inspect Backups
Daily dumps are stored in `./backups`:
```bash
ls -lh backups/
```

### 6. Managing the Stack
- **Stop services**: `docker compose down`
- **Restart services**: `docker compose restart`
- **View CMS logs**: `docker compose logs -f directus`
- **Manual Database Backup**:
  ```bash
  docker compose exec postgres pg_dump -U directus_admin -d directus > backups/manual_backup.sql
  ```

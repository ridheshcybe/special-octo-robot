# =============================================================================
# Automated Bootstrap Script for Directus CMS + Cloudflare Tunnel (Windows PowerShell)
# =============================================================================

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Starting Self-Hosted Directus CMS Setup (Windows)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Verify Docker CLI is available
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "[!] Error: Docker is not installed or not in system PATH." -ForegroundColor Red
    exit 1
}

# 2. Verify Docker daemon is running
try {
    docker info | Out-Null
} catch {
    Write-Host "[!] Error: Docker daemon is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# 3. Create backups folder if missing
if (-not (Test-Path "backups")) {
    Write-Host "[+] Creating .\backups directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "backups" | Out-Null
}

# 4. Check for .env file
if (-not (Test-Path ".env")) {
    Write-Host "[!] No .env file found. Creating one from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "[*] IMPORTANT: Please edit deploy\cms\.env with your real CLOUDFLARE_TUNNEL_TOKEN, DIRECTUS_KEY, and passwords." -ForegroundColor Yellow
    Write-Host "Exiting so you can configure .env." -ForegroundColor Yellow
    exit 0
}

# 5. Check if CLOUDFLARE_TUNNEL_TOKEN is set
$envContent = Get-Content ".env" -Raw
if ($envContent -match "CLOUDFLARE_TUNNEL_TOKEN=eyJh\.\.\.") {
    Write-Host "[!] Warning: CLOUDFLARE_TUNNEL_TOKEN is still set to placeholder in .env." -ForegroundColor Yellow
    $prompt = Read-Host "Do you want to proceed anyway for local testing? (Y/N)"
    if ($prompt -notmatch "^[Yy]$") {
        exit 1
    }
}

# 6. Pull images & launch services
Write-Host "[*] Pulling latest container images..." -ForegroundColor Cyan
docker compose pull

Write-Host "[*] Starting multi-container stack in detached mode..." -ForegroundColor Cyan
docker compose up -d

# 7. Health polling
Write-Host "[*] Waiting for PostgreSQL and Directus to initialize..." -ForegroundColor Yellow
$attempts = 0
$maxAttempts = 30
$ready = $false

while ($attempts -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8055/server/ping" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch {
        # Waiting for container boot
    }
    $attempts++
    Write-Host -NoNewline "."
    Start-Sleep -Seconds 2
}

Write-Host ""
if ($ready) {
    Write-Host "[OK] Directus CMS is healthy at http://localhost:8055" -ForegroundColor Green
    Write-Host "[OK] Cloudflare Tunnel is running and forwarding to http://directus:8055" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host " Local Admin:   http://localhost:8055/admin" -ForegroundColor White
    Write-Host " Public Portal: https://cms.yourdomain.com/admin" -ForegroundColor White
    Write-Host "==================================================" -ForegroundColor Cyan
} else {
    Write-Host "[!] Directus startup is taking longer than expected. Check logs with:" -ForegroundColor Yellow
    Write-Host "    docker compose logs -f directus" -ForegroundColor White
}

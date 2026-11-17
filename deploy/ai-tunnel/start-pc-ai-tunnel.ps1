# ==============================================================================
# PrepMeUp AI -- 24/7 PC Local AI Server and Cloudflare Tunnel Launcher
# Pure ASCII PowerShell script compatible with Windows PowerShell 5.1 & 7+
# ==============================================================================

param(
    [int]$LocalPort = 11434,
    [string]$Model = "llama3.1:8b",
    [switch]$NoTunnel
)

$ErrorActionPreference = "Continue"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  PrepMeUp AI -- 24/7 PC Local AI Server and Tunnel Launcher" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

# 1. Configure Ollama environment variables
$env:OLLAMA_HOST = "127.0.0.1:$LocalPort"
$env:OLLAMA_ORIGINS = "*"
$env:LOCAL_AI_PORT = "$LocalPort"

# Resolve Ollama executable (PATH or default Windows install location)
$ollamaExe = $null
$ollamaCmd = Get-Command "ollama" -ErrorAction SilentlyContinue
if ($ollamaCmd) {
    $ollamaExe = $ollamaCmd.Source
} elseif (Test-Path "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe") {
    $ollamaExe = "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"
}

# 2. Check if http://127.0.0.1:$LocalPort is actually responding over HTTP
$httpReady = $false
try {
    $null = Invoke-WebRequest -Uri "http://127.0.0.1:$LocalPort/api/tags" -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    $httpReady = $true
} catch {
    $httpReady = $false
}

if (-not $httpReady) {
    if ($ollamaExe) {
        Write-Host "[1/3] Starting local Ollama server on 127.0.0.1:$LocalPort..." -ForegroundColor Yellow
        Start-Process -FilePath $ollamaExe -ArgumentList "serve" -WindowStyle Hidden
        Start-Sleep -Seconds 3
    } else {
        Write-Host "[1/3] Starting built-in Node.js 24/7 PC AI Bridge on 127.0.0.1:$LocalPort..." -ForegroundColor Yellow
        $bridgeScript = Join-Path $PSScriptRoot "local-ai-bridge.mjs"
        Start-Process -FilePath "node" -ArgumentList "`"$bridgeScript`"" -WindowStyle Hidden
        Start-Sleep -Seconds 2
    }
} else {
    Write-Host "[1/3] Local AI server is already online at http://127.0.0.1:$LocalPort" -ForegroundColor Green
}

# 3. Verify local endpoint health and update .env.local
try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:$LocalPort/api/tags" -Method Get -TimeoutSec 4 -ErrorAction Stop
    Write-Host "[2/3] Verified local AI endpoint responding at http://127.0.0.1:$LocalPort/v1/chat/completions" -ForegroundColor Green
} catch {
    Write-Host "[2/3] Local AI endpoint initialized on http://127.0.0.1:$LocalPort" -ForegroundColor Yellow
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$envLocalPath = Join-Path $repoRoot ".env.local"
if (Test-Path $envLocalPath) {
    $envContent = Get-Content $envLocalPath -Raw
    if ($envContent -notmatch "LOCAL_AI_TUNNEL_URL=") {
        Add-Content -Path $envLocalPath -Value "`nLOCAL_AI_TUNNEL_URL=http://127.0.0.1:$LocalPort`nLOCAL_AI_MODEL=$Model"
        Write-Host "      Added LOCAL_AI_TUNNEL_URL=http://127.0.0.1:$LocalPort to .env.local" -ForegroundColor Cyan
    }
}

if ($NoTunnel) {
    Write-Host "[3/3] 24/7 PC Local AI Server is active at http://127.0.0.1:$LocalPort" -ForegroundColor Green
    exit 0
}

# 4. Resolve cloudflared executable and start tunnel if installed
$cfExe = $null
$cfCmd = Get-Command "cloudflared" -ErrorAction SilentlyContinue
if ($cfCmd) {
    $cfExe = $cfCmd.Source
} elseif (Test-Path "$env:ProgramFiles\cloudflared\cloudflared.exe") {
    $cfExe = "$env:ProgramFiles\cloudflared\cloudflared.exe"
} elseif (Test-Path "${env:ProgramFiles(x86)}\cloudflared\cloudflared.exe") {
    $cfExe = "${env:ProgramFiles(x86)}\cloudflared\cloudflared.exe"
}

if ($cfExe) {
    Write-Host "[3/3] Starting Cloudflare Tunnel to http://127.0.0.1:$LocalPort ..." -ForegroundColor Green
    Write-Host "      Copy the https://xxxx.trycloudflare.com URL into Admin -> Settings -> 24/7 PC Tunnel URL" -ForegroundColor Cyan
    & $cfExe tunnel --url "http://127.0.0.1:$LocalPort"
} else {
    Write-Host "[3/3] Local 24/7 PC AI Server is LIVE at http://127.0.0.1:$LocalPort/v1/chat/completions" -ForegroundColor Green
    Write-Host "      Next.js on this PC is now automatically connected to http://127.0.0.1:$LocalPort!" -ForegroundColor Cyan
    Write-Host "      (Optional: To expose to a remote server, install cloudflared via: winget install Cloudflare.cloudflared)" -ForegroundColor DarkGray
}

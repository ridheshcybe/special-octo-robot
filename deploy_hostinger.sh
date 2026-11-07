#!/usr/bin/env bash
# =============================================================================
# PrepMeUp AI — Hostinger Node.js Web App Deployment Script
# =============================================================================
# Hostinger Node.js Web Apps use this workflow by default:
#
#   Install:  npm ci
#   Build:    npm run build       (runs `next build`; host config = npm run build)
#   Start:    npm run start -- -p $PORT
#   Output:   .next (default Hostinger directory)
#   Runtime:  Node.js 20 LTS or higher
#
# Next.js 16 requires a persistent or serverless Node runtime. Do NOT use
# `output: 'export'` — the app relies on server-only API routes, signed session
# cookies, and Razorpay webhook HMAC body verification.
#
# Run this locally to produce the artifacts that the Hostinger deploy pipeline
# consumes, then archive the contents of .next and the repo root as a tar.gz for
# one-click import into Hostinger.
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "=== PrepMeUp AI — Hostinger Deployment ==="

NODE_MAJOR="$(node -v | cut -d. -f1 | tr -d 'v')"
echo "[1/6] Node.js version: ${NODE_MAJOR}.x (Hostinger Node.js Web Apps require Node 20 LTS+)"
if (( NODE_MAJOR < 20 )); then
  echo "Aborting: Node.js >= 20 required (Hostinger currently ships Node 20+)." >&2
  exit 1
fi

# Clean any existing node_modules to avoid ENOTEMPTY errors
rm -rf node_modules
npm ci

echo "[3/6] Running production build (next build)..."
npm run build

echo "[4/6] Verifying server-only secrets are not in the client bundle..."
if grep -R "PMU_SUPABASE_SERVICE_ROLE_KEY" .next 2>/dev/null | grep -q .; then
  echo "ERROR: PMU_SUPABASE_SERVICE_ROLE_KEY leaked into .next. Fix before deploying." >&2
  exit 1
fi
if grep -R "RAZORPAY_KEY_SECRET" .next 2>/dev/null | grep -q .; then
  echo "ERROR: RAZORPAY_KEY_SECRET leaked into .next. Fix before deploying." >&2
  exit 1
fi
echo "[+] Client bundle is clean."

echo "[5/6] Preprocessing Hostinger environment template..."
GENERATED=".env.hostinger"
if [[ -f .env.hostinger ]]; then
  rm -f "$GENERATED"
fi
if [[ -f '.env.example' ]] && ! diff -q '.env.example' '.env.hostinger' >/dev/null 2>&1; then
  cp '.env.example' "$GENERATED"
fi
# Harden the template for Hostinger clients: remove placeholder secrets that are
# meaningless to a browser/runtime consumer and leave real template URLs in place.
sed -i.bak -E \
  -e 's|^PMU_SUPABASE_SERVICE_ROLE_KEY=.*|PMU_SUPABASE_SERVICE_ROLE_KEY=<HOSTINGER_SUPABASE_SERVICE_ROLE_KEY>|' \
  -e 's|^RAZORPAY_KEY_SECRET=.*|RAZORPAY_KEY_SECRET=<HOSTINGER_RAZORPAY_KEY_SECRET>|' \
  -e 's|^RAZORPAY_WEBHOOK_SECRET=.*|RAZORPAY_WEBHOOK_SECRET=<HOSTINGER_RAZORPAY_WEBHOOK_SECRET>|' \
  -e 's|^NEXT_PUBLIC_PMU_SUPABASE_URL=https://<prepmeup-project>.supabase.co|NEXT_PUBLIC_PMU_SUPABASE_URL=https://<YOUR_PMU_SUPABASE_PROJECT>.supabase.co|' \
  -e 's|^NEXT_PUBLIC_PMU_SUPABASE_ANON_KEY=<prepmeup-anon-key>|NEXT_PUBLIC_PMU_SUPABASE_ANON_KEY=<YOUR_PMU_ANON_KEY>|' \
  -e 's|^PMU_APP_URL=http://localhost:3000|PMU_APP_URL=https://<YOUR_HOSTINGER_DOMAIN>|' \
  "$GENERATED" || true
rm -f "$GENERATED.bak"
echo "[+] Hostinger env template written to .env.hostinger"

echo "[6/6] Archiving deployable artifacts..."
TARBALL="prep-me-up-hostinger-$(date +%Y%m%dT%H%M%SZ).tar.gz"
if command -v tar >/dev/null 2>&1; then
  tar -czf "$TARBALL" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='*.log' \
    --exclude='.env*' \
    --exclude='.git' \
    --exclude='deploy/cms/.env' \
    --exclude='deploy_hostinger.js' \
    --exclude='package_for_hostinger.py' \
    --exclude='*.patch' \
    --exclude='gcp*.json' \
    --exclude='service-account*.json' \
    --exclude='*.key.json' \
    --exclude='.secrets' \
    --exclude='.next/types' \
    .
  echo "[+] Created $TARBALL (repositories root)."
  ls -lh "$TARBALL"
else
  echo "[!] tar not found; skipping archive. Hostinger import artifacts into .next + root files." >&2
fi

echo ""
echo "Next steps (Hostinger hPanel → Websites → Add Website → Node.js Apps):"
echo "  Install command : npm ci"
echo "  Build command   : npm run build"
echo "  Start command   : npm run start -- -p \$PORT"
echo "  Output dir      : .next"
echo "  Node version    : 20 LTS"
echo "  Add these to hPanel Environment Variables (Production):"
echo "    NEXT_PUBLIC_PMU_SUPABASE_URL / PMU_SUPABASE_SERVICE_ROLE_KEY"
echo "    GEMINI_API_KEY / GEMINI_TEXT_MODEL / GEMINI_DOCUMENT_MODEL"
echo "    NEXT_PUBLIC_RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET / RAZORPAY_WEBHOOK_SECRET"

echo "    UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN"
echo "    PMU_APP_URL (https:// your Hostinger domain), PMU_SESSION_SECRET (>= 32 chars)"
echo "    CERTIFICATE_SIGNING_SECRET"
echo "  Host the client-side Supabase keys as NEXT_PUBLIC_*; keep service-role and"
echo "  Razorpay secret keys out of the client bundle."
echo "  See docs/prepmeup/deployment-hostinger.md for the full runbook."

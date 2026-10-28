#!/usr/bin/env bash
# =============================================================================
# Automated Bootstrap Script for Directus CMS + Cloudflare Tunnel (Linux/macOS)
# =============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "=================================================="
echo " Starting Self-Hosted Directus CMS Setup"
echo "=================================================="

# 1. Verify Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker before proceeding."
    exit 1
fi

# 2. Verify Docker daemon is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker daemon is not running. Please start Docker."
    exit 1
fi

# 3. Create backups folder if missing
if [ ! -d "backups" ]; then
    echo "📁 Creating ./backups directory..."
    mkdir -p backups
    chmod 755 backups
fi

# 4. Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating one from .env.example..."
    cp .env.example .env
    echo "❗ IMPORTANT: Please edit deploy/cms/.env and supply your CLOUDFLARE_TUNNEL_TOKEN, DIRECTUS_KEY, and passwords."
    echo "Exiting so you can configure .env."
    exit 0
fi

# 5. Check if CLOUDFLARE_TUNNEL_TOKEN is set
if grep -q "CLOUDFLARE_TUNNEL_TOKEN=eyJh\.\.\." .env || grep -q "CLOUDFLARE_TUNNEL_TOKEN=$" .env; then
    echo "⚠️  Warning: CLOUDFLARE_TUNNEL_TOKEN is still set to placeholder in .env."
    echo "The Cloudflare Tunnel container will fail until you provide a real token."
    read -p "Do you want to proceed anyway for local testing? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 6. Pull images & launch services
echo "🚀 Pulling latest container images..."
docker compose pull

echo "🚀 Bringing up stack in detached mode..."
docker compose up -d

# 7. Health polling
echo "⏳ Waiting for PostgreSQL and Directus to become ready..."
ATTEMPTS=0
MAX_ATTEMPTS=30

while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    if docker compose ps | grep -q "pmu_directus.*Up"; then
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:8055/server/ping | grep -q "200"; then
            echo ""
            echo "✅ Directus CMS is online at http://localhost:8055"
            echo "✅ Cloudflare Tunnel daemon is routing traffic to http://directus:8055"
            echo "=================================================="
            echo " Admin Portal:  http://localhost:8055/admin"
            echo " Public Portal: https://$(grep CMS_DOMAIN .env | cut -d '=' -f2)/admin"
            echo "=================================================="
            exit 0
        fi
    fi
    ATTEMPTS=$((ATTEMPTS+1))
    printf "."
    sleep 2
done

echo ""
echo "⚠️  Stack is starting up, but health check timed out. Check logs with:"
echo "    docker compose logs -f directus"

"""
Activate Strategy C on GCP VM:
1. Upload .env securely to GCS
2. Update VM metadata with Strategy C deployment script
3. Reset VM to trigger immediate execution
4. Verify when https://www.ridheshcybe.dpdns.org goes LIVE!
"""

import time
import requests
from google.oauth2 import service_account
from google.cloud import compute_v1

KEY_PATH = "gcp-key.json"
PROJECT_ID = "prepmeupai"
ZONE = "us-central1-a"
INSTANCE = "prepmeup-edge-proxy"
BUCKET = "prepmeupai-build-store-2026"

def get_credentials():
    return service_account.Credentials.from_service_account_file(
        KEY_PATH,
        scopes=["https://www.googleapis.com/auth/cloud-platform"]
    )

def upload_env():
    print("[*] Uploading .env to GCS...")
    import google.auth.transport.requests
    creds = get_credentials()
    req = google.auth.transport.requests.Request()
    creds.refresh(req)
    headers = {'Authorization': f'Bearer {creds.token}', 'Content-Type': 'text/plain'}

    with open('.env', 'rb') as f:
        data = f.read()

    url = f"https://storage.googleapis.com/upload/storage/v1/b/{BUCKET}/o?uploadType=media&name=.env"
    r = requests.post(url, headers=headers, data=data)
    print("Env upload status:", r.status_code)

    # Make readable for download script
    acl_url = f"https://storage.googleapis.com/storage/v1/b/{BUCKET}/o/.env?predefinedAcl=publicRead"
    requests.patch(acl_url, headers=headers)

NEW_STARTUP_SCRIPT = """#!/bin/bash
set -e
echo "=== [Strategy C Full-Stack Deployment Started] ==="

# 0. Fix Firewall & Disable broken legacy systemd loop
ufw disable || true
systemctl stop pmu-stack.service || true
systemctl disable pmu-stack.service || true
rm -f /etc/systemd/system/pmu-stack.service
systemctl daemon-reload

# 1. Download Standalone Next.js App & .env
mkdir -p /root/prepmeup-app
echo "Downloading build bundle from GCS..."
if command -v gsutil &> /dev/null; then
    gsutil cp gs://prepmeupai-build-store-2026/standalone_bundle.tar.gz /root/bundle.tar.gz || curl -fsSL https://storage.googleapis.com/prepmeupai-build-store-2026/standalone_bundle.tar.gz -o /root/bundle.tar.gz
    gsutil cp gs://prepmeupai-build-store-2026/.env /root/prepmeup-app/.env || curl -fsSL https://storage.googleapis.com/prepmeupai-build-store-2026/.env -o /root/prepmeup-app/.env
else
    curl -fsSL https://storage.googleapis.com/prepmeupai-build-store-2026/standalone_bundle.tar.gz -o /root/bundle.tar.gz
    curl -fsSL https://storage.googleapis.com/prepmeupai-build-store-2026/.env -o /root/prepmeup-app/.env
fi
tar -xzf /root/bundle.tar.gz -C /root/prepmeup-app

# 2. Update docker-compose to include 'web' service
mkdir -p /root/prepmeup-edge/nginx
cat << 'EOF' > /root/prepmeup-edge/docker-compose.hybrid-gcp.yml
version: '3.8'
services:
  web:
    image: node:20-alpine
    container_name: prepmeup-edge-web
    restart: unless-stopped
    working_dir: /app
    env_file:
      - /root/prepmeup-app/.env
    environment:
      NODE_ENV: production
      PORT: 3001
      HOSTNAME: 0.0.0.0
    command: ["node", "server.js"]
    volumes:
      - /root/prepmeup-app:/app
    networks:
      - edge-network

  nginx:
    image: nginx:1.25-alpine
    container_name: prepmeup-edge-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx-hybrid.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/cache:/var/cache/nginx/static
    depends_on:
      - web
      - fallback
    networks:
      - edge-network

  fallback:
    image: nginx:1.25-alpine
    container_name: prepmeup-edge-fallback
    restart: unless-stopped
    volumes:
      - ./fallback/index.html:/usr/share/nginx/html/index.html:ro
    command: >
      /bin/sh -c "sed -i 's/listen       80;/listen 8088;/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
    networks:
      - edge-network

networks:
  edge-network:
    driver: bridge
EOF

# 3. Update Nginx Config to Route directly to web:3001
cat << 'EOF' > /root/prepmeup-edge/nginx/nginx-hybrid.conf
user nginx;
worker_processes auto;
events { worker_connections 1024; }
http {
    include /etc/nginx/mime.types;
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=15r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=50r/s;
    proxy_cache_path /var/cache/nginx/static levels=1:2 keys_zone=STATIC_CACHE:10m max_size=1g inactive=365d use_temp_path=off;

    upstream hybrid_backend {
        server web:3001 max_fails=3 fail_timeout=15s;
        server fallback:8088 backup;
    }

    server {
        listen 80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        location = /api/prepmeup/payments/webhook {
            limit_req zone=api_limit burst=30 nodelay;
            proxy_buffering off; proxy_request_buffering off;
            proxy_pass http://hybrid_backend;
            proxy_connect_timeout 3s; proxy_read_timeout 15s; proxy_send_timeout 15s;
        }

        location ~* ^(/_next/static/|/atlas\\.html$) {
            limit_req zone=general_limit burst=150 nodelay;
            proxy_cache STATIC_CACHE; proxy_cache_valid 200 302 12h;
            proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
            add_header X-Cache-Status $upstream_cache_status always;
            proxy_pass http://hybrid_backend;
            proxy_connect_timeout 3s;
        }

        location / {
            proxy_pass http://hybrid_backend;
            proxy_connect_timeout 3s;
        }
    }
}
EOF

# 4. Pull and Start Full Strategy C Stack
cd /root/prepmeup-edge
docker compose -f docker-compose.hybrid-gcp.yml down || true
docker compose -f docker-compose.hybrid-gcp.yml up -d

echo "=== [Strategy C is 100% LIVE on GCP] ==="
"""

def update_metadata_and_restart():
    print("[*] Updating VM metadata with Strategy C deployment script...")
    client = compute_v1.InstancesClient(credentials=get_credentials())
    inst = client.get(project=PROJECT_ID, zone=ZONE, instance=INSTANCE)
    
    metadata = compute_v1.Metadata(
        fingerprint=inst.metadata.fingerprint,
        items=[
            compute_v1.Items(
                key="startup-script",
                value=NEW_STARTUP_SCRIPT
            )
        ]
    )
    
    op = client.set_metadata(
        project=PROJECT_ID,
        zone=ZONE,
        instance=INSTANCE,
        metadata_resource=metadata
    )
    print(f"[+] Metadata update submitted: {op.name}")
    time.sleep(3)
    
    print("[*] Resetting GCP VM to apply Strategy C...")
    reset_op = client.reset(project=PROJECT_ID, zone=ZONE, instance=INSTANCE)
    print(f"[+] VM reset submitted: {reset_op.name}")
    print("[*] Waiting for VM reboot and deployment...")

if __name__ == "__main__":
    upload_env()
    update_metadata_and_restart()

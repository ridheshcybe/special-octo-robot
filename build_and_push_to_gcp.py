import os
import shutil
import tarfile
import time
import requests
import google.auth.transport.requests
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

def prepare_standalone_package():
    print("[1/5] Preparing Next.js standalone assets with persistent data...")
    standalone_dir = os.path.join(".next", "standalone")
    standalone_next_static = os.path.join(standalone_dir, ".next", "static")
    source_static = os.path.join(".next", "static")

    if os.path.exists(source_static):
        print(f"[*] Copying .next/static to {standalone_next_static}...")
        if os.path.exists(standalone_next_static):
            shutil.rmtree(standalone_next_static)
        shutil.copytree(source_static, standalone_next_static)

    standalone_public = os.path.join(standalone_dir, "public")
    source_public = "public"
    if os.path.exists(source_public):
        print(f"[*] Copying public to {standalone_public}...")
        if os.path.exists(standalone_public):
            shutil.rmtree(standalone_public)
        shutil.copytree(source_public, standalone_public)

    # Ensure deploy/cms persistent database templates exist in standalone bundle
    standalone_cms = os.path.join(standalone_dir, "deploy", "cms")
    os.makedirs(standalone_cms, exist_ok=True)
    for f in ["admin_state.json", "registered_users.json"]:
        src = os.path.join("deploy", "cms", f)
        dst = os.path.join(standalone_cms, f)
        if os.path.exists(src):
            shutil.copyfile(src, dst)
            print(f"[*] Packaged {src} -> {dst}")

    tar_path = "standalone_bundle.tar.gz"
    print(f"[*] Packaging {standalone_dir} into {tar_path}...")
    with tarfile.open(tar_path, "w:gz") as tar:
        for item in os.listdir(standalone_dir):
            item_path = os.path.join(standalone_dir, item)
            tar.add(item_path, arcname=item)
    
    size_mb = os.path.getsize(tar_path) / (1024 * 1024)
    print(f"[+] Archive created successfully: {size_mb:.2f} MB")
    return tar_path

def upload_bundle_and_db_to_gcs(tar_path):
    print("[2/5] Uploading standalone_bundle.tar.gz and DB backups to Google Cloud Storage...")
    creds = get_credentials()
    req = google.auth.transport.requests.Request()
    creds.refresh(req)
    headers = {
        'Authorization': f'Bearer {creds.token}',
        'Content-Type': 'application/gzip'
    }

    url = f"https://storage.googleapis.com/upload/storage/v1/b/{BUCKET}/o?uploadType=media&name=standalone_bundle.tar.gz"
    with open(tar_path, 'rb') as f:
        r = requests.post(url, headers=headers, data=f)
    print("Bundle upload HTTP status:", r.status_code)
    if r.status_code not in (200, 201):
        raise RuntimeError(f"GCS upload failed: {r.text}")

    acl_url = f"https://storage.googleapis.com/storage/v1/b/{BUCKET}/o/standalone_bundle.tar.gz?predefinedAcl=publicRead"
    requests.patch(acl_url, headers=headers)

    # Also backup admin_state.json to GCS db/ folder
    for db_file in ["admin_state.json", "registered_users.json"]:
        local_db = os.path.join("deploy", "cms", db_file)
        if os.path.exists(local_db):
            with open(local_db, 'rb') as f:
                db_data = f.read()
            db_headers = {'Authorization': f'Bearer {creds.token}', 'Content-Type': 'application/json'}
            db_url = f"https://storage.googleapis.com/upload/storage/v1/b/{BUCKET}/o?uploadType=media&name=db/{db_file}"
            r_db = requests.post(db_url, headers=db_headers, data=db_data)
            print(f"Uploaded db/{db_file} to GCS: HTTP {r_db.status_code}")
            requests.patch(f"https://storage.googleapis.com/storage/v1/b/{BUCKET}/o/db%2F{db_file}?predefinedAcl=publicRead", headers=db_headers)

    print("[+] GCS assets and DB backups synced.")

STARTUP_SCRIPT_PERSISTENT = """#!/bin/bash
set -e
echo "=== [Strategy C Full-Stack Deployment with Persistent Data Mount] ==="

ufw disable || true
systemctl stop pmu-stack.service || true
systemctl disable pmu-stack.service || true
rm -f /etc/systemd/system/pmu-stack.service
systemctl daemon-reload

mkdir -p /root/prepmeup-app /root/prepmeup-persistent-data /root/prepmeup-edge/nginx

echo "Downloading build bundle from GCS..."
if command -v gsutil &> /dev/null; then
    gsutil cp gs://prepmeupai-build-store-2026/standalone_bundle.tar.gz /root/bundle.tar.gz || curl -fsSL https://storage.googleapis.com/prepmeupai-build-store-2026/standalone_bundle.tar.gz -o /root/bundle.tar.gz
    gsutil cp gs://prepmeupai-build-store-2026/.env /root/prepmeup-app/.env || curl -fsSL https://storage.googleapis.com/prepmeupai-build-store-2026/.env -o /root/prepmeup-app/.env
else
    curl -fsSL https://storage.googleapis.com/prepmeupai-build-store-2026/standalone_bundle.tar.gz -o /root/bundle.tar.gz
    curl -fsSL https://storage.googleapis.com/prepmeupai-build-store-2026/.env -o /root/prepmeup-app/.env
fi
tar -xzf /root/bundle.tar.gz -C /root/prepmeup-app

# Initialize persistent data volume if empty
if [ ! -f /root/prepmeup-persistent-data/admin_state.json ]; then
    if [ -f /root/prepmeup-app/deploy/cms/admin_state.json ]; then
        cp /root/prepmeup-app/deploy/cms/admin_state.json /root/prepmeup-persistent-data/admin_state.json
    else
        curl -fsSL https://storage.googleapis.com/prepmeupai-build-store-2026/db/admin_state.json -o /root/prepmeup-persistent-data/admin_state.json || true
    fi
fi

if [ ! -f /root/prepmeup-persistent-data/registered_users.json ]; then
    if [ -f /root/prepmeup-app/deploy/cms/registered_users.json ]; then
        cp /root/prepmeup-app/deploy/cms/registered_users.json /root/prepmeup-persistent-data/registered_users.json
    else
        curl -fsSL https://storage.googleapis.com/prepmeupai-build-store-2026/db/registered_users.json -o /root/prepmeup-persistent-data/registered_users.json || true
    fi
fi

# Write Docker Compose with host persistent volume mapping
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
      PREPMEUP_DATA_DIR: /app/deploy/cms
    command: ["node", "server.js"]
    volumes:
      - /root/prepmeup-app:/app
      - /root/prepmeup-persistent-data:/app/deploy/cms
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

# Nginx config
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

cd /root/prepmeup-edge
docker compose -f docker-compose.hybrid-gcp.yml down || true
docker compose -f docker-compose.hybrid-gcp.yml up -d

echo "=== [Strategy C is 100% LIVE with Persistent Data] ==="
"""

def update_metadata_and_restart():
    print("[3/5] Updating VM metadata with Persistent Data Mount Startup Script...")
    client = compute_v1.InstancesClient(credentials=get_credentials())
    inst = client.get(project=PROJECT_ID, zone=ZONE, instance=INSTANCE)
    
    metadata = compute_v1.Metadata(
        fingerprint=inst.metadata.fingerprint,
        items=[
            compute_v1.Items(
                key="startup-script",
                value=STARTUP_SCRIPT_PERSISTENT
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

    print("[4/5] Resetting GCP VM prepmeup-edge-proxy to boot with persistent data mount...")
    reset_op = client.reset(project=PROJECT_ID, zone=ZONE, instance=INSTANCE)
    print(f"[+] VM reset submitted: {reset_op.name}")

def verify_live():
    print("[5/5] Polling live endpoint on 34.45.36.206...")
    for i in range(15):
        time.sleep(6)
        try:
            r = requests.get("http://34.45.36.206/prepmeup", timeout=5)
            print(f"Attempt {i+1}: HTTP {r.status_code}")
            if r.status_code == 200:
                print("[SUCCESS] Production site is LIVE on Strategy C with Persistent Storage!")
                return True
        except Exception as e:
            print(f"Attempt {i+1}: Waiting for VM startup... ({e})")
    return False

if __name__ == "__main__":
    tar = prepare_standalone_package()
    upload_bundle_and_db_to_gcs(tar)
    update_metadata_and_restart()
    verify_live()

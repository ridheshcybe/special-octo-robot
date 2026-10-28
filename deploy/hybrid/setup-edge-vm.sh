#!/usr/bin/env bash
# ==============================================================================
# PrepMeUp AI — GCP Edge Reverse Proxy Automated Setup Script (Part 2)
# Run inside the VM (prepmeup-edge-proxy) after SSH connection
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo "  Starting PrepMeUp AI Edge Proxy Setup on GCP VM"
echo "=========================================================="

# 1. Create swap space and enable IP forwarding
echo "[1/6] Configuring 2GB swap space and kernel parameters..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi
sudo sysctl vm.swappiness=10
sudo sysctl -w net.ipv4.ip_forward=1
echo "vm.swappiness = 10" | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.ip_forward = 1" | sudo tee -a /etc/sysctl.conf

# 2. Install Docker
echo "[2/6] Installing Docker & Docker Compose..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker "$USER" || true
    rm -f get-docker.sh
fi

# 3. Create directories
echo "[3/6] Creating deployment directories..."
mkdir -p ~/prepmeup-edge/nginx/cache ~/prepmeup-edge/fallback

# 4. Generate Docker Compose config
echo "[4/6] Writing docker-compose.hybrid-gcp.yml..."
cat << 'EOF' > ~/prepmeup-edge/docker-compose.hybrid-gcp.yml
version: '3.8'
services:
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
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: prepmeup-edge-cloudflared
    restart: unless-stopped
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
    command: tunnel --no-autoupdate run
    networks:
      - edge-network
networks:
  edge-network:
    driver: bridge
EOF

# 5. Generate Nginx config
echo "[5/6] Writing Nginx configuration..."
cat << 'EOF' > ~/prepmeup-edge/nginx/nginx-hybrid.conf
user nginx;
worker_processes auto;
events { worker_connections 1024; }
http {
    include /etc/nginx/mime.types;
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=15r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=50r/s;
    proxy_cache_path /var/cache/nginx/static levels=1:2 keys_zone=STATIC_CACHE:10m max_size=1g inactive=365d use_temp_path=off;
    upstream hybrid_backend {
        server 10.8.0.2:3001 max_fails=3 fail_timeout=15s;
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
        location ~* ^(/_next/static/|/atlas\.html$) {
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

# 6. Generate Fallback index.html (Dark Brutalist styling matching PrepMeUp AI)
echo "[6/6] Generating brutalist fallback page..."
cat << 'EOF' > ~/prepmeup-edge/fallback/index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PrepMeUp AI — System Syncing</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        body { background: #08080a; color: #f3f4f6; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
        .card { max-width: 540px; width: 100%; background: #111114; border: 1px solid #27272a; border-radius: 14px; padding: 36px; border-top: 4px solid #ff3b1d; }
        .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 59, 29, 0.12); color: #ff3b1d; border: 1px solid rgba(255, 59, 29, 0.3); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
        .dot { width: 8px; height: 8px; background: #ff3b1d; border-radius: 50%; box-shadow: 0 0 8px #ff3b1d; }
        h1 { font-size: 24px; font-weight: 800; margin-bottom: 10px; color: #fff; }
        p { color: #9ca3af; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
        .status { background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 14px; font-family: monospace; font-size: 12px; color: #a1a1aa; margin-bottom: 20px; }
        .status .green { color: #10b981; }
        .status .orange { color: #f59e0b; }
        .btn { display: inline-block; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; }
        .btn-primary { background: #ff3b1d; color: #fff; }
        .footer { margin-top: 20px; font-size: 11px; color: #71717a; text-align: center; }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge"><div class="dot"></div> Edge Failover Active</div>
        <h1>Home Server Core Synchronizing</h1>
        <p>The self-hosted primary compute engine is currently synchronizing with the database. The cloud edge proxy has captured your session safely.</p>
        <div class="status">
            [EDGE PROXY] : <span class="green">GCP VM (ONLINE)</span><br>
            [CORE ENGINE]: <span class="orange">STANDBY / CONNECTING</span><br>
            [AUTO RETRY] : <span id="time">15s</span>
        </div>
        <button class="btn btn-primary" onclick="location.reload()">Retry Now</button>
        <div class="footer">PrepMeUp AI Hybrid Architecture &bull; Emergency Contact: +91 98207 43178</div>
    </div>
    <script>
        let s = 15;
        setInterval(() => { s--; if (s <= 0) location.reload(); else document.getElementById('time').textContent = s + 's'; }, 1000);
    </script>
</body>
</html>
EOF

# 7. Configure environment variables and launch Docker container stack
echo "[7/7] Launching Docker container stack..."
cat << 'ENVEOF' > ~/prepmeup-edge/.env
CLOUDFLARE_TUNNEL_TOKEN="eyJhIjoiODJiZDhjOTQ3OTg2MTA4N2NlYjM3ZDFkOGY1YzM3ZDUiLCJ0IjoiNDQwOTIxZGUtYzU1MS00NjMzLWI4NTktNWVhY2I1ZTZmYzM1IiwicyI6Ik1tSXlOMkl4WWpJdE1qSTFZaTAwTVdNM0xXRXdOR0V0TlRjNVpUUm1abVl4TkRNMk0yUmpOV0ppT0RBdE16WTVOeTAwWVRrMExUZ3dNbVV0TVdVeE5XTmlPRE5pWXpCaiJ9"
ENVEOF

sudo docker compose -f ~/prepmeup-edge/docker-compose.hybrid-gcp.yml up -d

echo "=========================================================="
echo "  PrepMeUp AI Edge Proxy Stack is LIVE on GCP VM!  "
echo "=========================================================="
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

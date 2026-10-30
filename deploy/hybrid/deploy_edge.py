"""
Automated GCP Edge Proxy Deployment Script for PrepMeUp AI
Uses Service Account Key (gcp-key.json) to provision:
1. Enable Compute Engine API
2. Create Firewall Rules (allow-prepmeup-http-https, allow-prepmeup-wireguard)
3. Provision e2-micro Always Free VM in us-central1
4. Inject Startup Script with Docker, Nginx Hybrid Proxy, and Cloudflare Tunnel
"""

import sys
import time
import requests
from google.oauth2 import service_account
from google.cloud import compute_v1

import os

KEY_PATH = "gcp-key.json"
PROJECT_ID = "prepmeupai"
ZONE = "us-central1-a"
FALLBACK_ZONES = ["us-central1-b", "us-central1-c", "us-central1-f"]
INSTANCE_NAME = "prepmeup-edge-proxy"
TUNNEL_TOKEN = os.getenv("CLOUDFLARE_TUNNEL_TOKEN", "")

STARTUP_SCRIPT = f"""#!/bin/bash
set -e
echo "Starting PrepMeUp Edge automated bootstrap..."

# 1. Swap & Kernel tuning
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
sysctl vm.swappiness=10
sysctl -w net.ipv4.ip_forward=1
echo "vm.swappiness=10" >> /etc/sysctl.conf
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf

# 2. Docker Installation
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm -f get-docker.sh
fi

# 3. Create Directories
mkdir -p /root/prepmeup-edge/nginx/cache /root/prepmeup-edge/fallback

# 4. Write Nginx Config
cat << 'EOF' > /root/prepmeup-edge/nginx/nginx-hybrid.conf
user nginx;
worker_processes auto;
events {{ worker_connections 1024; }}
http {{
    include /etc/nginx/mime.types;
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=15r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=50r/s;
    proxy_cache_path /var/cache/nginx/static levels=1:2 keys_zone=STATIC_CACHE:10m max_size=1g inactive=365d use_temp_path=off;
    upstream hybrid_backend {{
        server 10.8.0.2:3001 max_fails=3 fail_timeout=15s;
        server fallback:8088 backup;
    }}
    server {{
        listen 80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        location = /api/prepmeup/payments/webhook {{
            limit_req zone=api_limit burst=30 nodelay;
            proxy_buffering off; proxy_request_buffering off;
            proxy_pass http://hybrid_backend;
            proxy_connect_timeout 3s; proxy_read_timeout 15s; proxy_send_timeout 15s;
        }}
        location ~* ^(/_next/static/|/atlas\\.html$) {{
            limit_req zone=general_limit burst=150 nodelay;
            proxy_cache STATIC_CACHE; proxy_cache_valid 200 302 12h;
            proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
            add_header X-Cache-Status $upstream_cache_status always;
            proxy_pass http://hybrid_backend;
            proxy_connect_timeout 3s;
        }}
        location / {{
            proxy_pass http://hybrid_backend;
            proxy_connect_timeout 3s;
        }}
    }}
}}
EOF

# 5. Write Fallback HTML
cat << 'EOF' > /root/prepmeup-edge/fallback/index.html
<!DOCTYPE html>
<html><head><title>PrepMeUp AI — System Syncing</title><style>body{{background:#08080a;color:#fff;font-family:monospace;padding:40px;}}h1{{color:#ff3b1d;}}</style></head>
<body><h1>[ PREPMEUP EDGE FAILOVER ACTIVE ]</h1><p>Home Server Core syncing... Retry shortly.</p></body></html>
EOF

# 6. Write Docker Compose
cat << 'EOF' > /root/prepmeup-edge/docker-compose.hybrid-gcp.yml
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
      - TUNNEL_TOKEN={TUNNEL_TOKEN}
    command: tunnel --no-autoupdate run
    networks:
      - edge-network
networks:
  edge-network:
    driver: bridge
EOF

# 7. Start Stack
cd /root/prepmeup-edge
docker compose -f docker-compose.hybrid-gcp.yml up -d
echo "PrepMeUp Edge Stack is LIVE!"
"""

def get_credentials():
    return service_account.Credentials.from_service_account_file(
        KEY_PATH,
        scopes=["https://www.googleapis.com/auth/cloud-platform"]
    )

def check_billing_and_api():
    print(f"[*] Checking Compute Engine API on project '{PROJECT_ID}'...")
    import google.auth.transport.requests
    creds = get_credentials()
    req = google.auth.transport.requests.Request()
    creds.refresh(req)
    headers = {"Authorization": f"Bearer {creds.token}"}
    
    url = f"https://serviceusage.googleapis.com/v1/projects/{PROJECT_ID}/services/compute.googleapis.com"
    r = requests.get(url, headers=headers)
    if r.status_code == 200 and r.json().get("state") == "ENABLED":
        print("[+] Compute Engine API is already ENABLED!")
        return True
    
    # Try enabling
    enable_url = f"https://serviceusage.googleapis.com/v1/projects/{PROJECT_ID}/services/compute.googleapis.com:enable"
    enable_res = requests.post(enable_url, headers=headers)
    if enable_res.status_code == 200:
        print("[+] Successfully enabled Compute Engine API!")
        return True
    
    err = enable_res.json().get("error", {})
    print(f"[-] Cannot enable Compute Engine API: {err.get('message')}")
    return False

def create_firewall_rules():
    print("[*] Creating Firewall Rules...")
    client = compute_v1.FirewallsClient(credentials=get_credentials())
    
    # HTTP/HTTPS Rule
    try:
        rule_http = compute_v1.Firewall(
            name="allow-prepmeup-http-https",
            direction="INGRESS",
            priority=1000,
            network="global/networks/default",
            allowed=[
                compute_v1.Allowed(I_p_protocol="tcp", ports=["80", "443"])
            ],
            source_ranges=["0.0.0.0/0"],
            target_tags=["prepmeup-edge"]
        )
        op = client.insert(project=PROJECT_ID, firewall_resource=rule_http)
        print("[+] Created firewall rule: allow-prepmeup-http-https")
    except Exception as e:
        if "alreadyExists" in str(e):
            print("[i] Firewall rule allow-prepmeup-http-https already exists.")
        else:
            print(f"[!] Warning on HTTP rule: {e}")

    # WireGuard Rule
    try:
        rule_wg = compute_v1.Firewall(
            name="allow-prepmeup-wireguard",
            direction="INGRESS",
            priority=1000,
            network="global/networks/default",
            allowed=[
                compute_v1.Allowed(I_p_protocol="udp", ports=["51820"])
            ],
            source_ranges=["0.0.0.0/0"],
            target_tags=["prepmeup-edge"]
        )
        op = client.insert(project=PROJECT_ID, firewall_resource=rule_wg)
        print("[+] Created firewall rule: allow-prepmeup-wireguard")
    except Exception as e:
        if "alreadyExists" in str(e):
            print("[i] Firewall rule allow-prepmeup-wireguard already exists.")
        else:
            print(f"[!] Warning on WireGuard rule: {e}")

def create_vm(target_zone):
    print(f"[*] Provisioning VM '{INSTANCE_NAME}' in zone '{target_zone}'...")
    client = compute_v1.InstancesClient(credentials=get_credentials())
    
    instance = compute_v1.Instance(
        name=INSTANCE_NAME,
        machine_type=f"zones/{target_zone}/machineTypes/e2-micro",
        tags=compute_v1.Tags(items=["prepmeup-edge"]),
        network_interfaces=[
            compute_v1.NetworkInterface(
                network="global/networks/default",
                access_configs=[
                    compute_v1.AccessConfig(
                        name="External NAT",
                        type_="ONE_TO_ONE_NAT",
                        network_tier="PREMIUM"
                    )
                ]
            )
        ],
        disks=[
            compute_v1.AttachedDisk(
                boot=True,
                auto_delete=True,
                initialize_params=compute_v1.AttachedDiskInitializeParams(
                    source_image="projects/ubuntu-os-cloud/global/images/family/ubuntu-2204-lts",
                    disk_size_gb=30,
                    disk_type=f"zones/{target_zone}/diskTypes/pd-standard"
                )
            )
        ],
        metadata=compute_v1.Metadata(
            items=[
                compute_v1.Items(
                    key="startup-script",
                    value=STARTUP_SCRIPT
                )
            ]
        )
    )
    
    op = client.insert(project=PROJECT_ID, zone=target_zone, instance_resource=instance)
    print(f"[*] Instance creation request submitted. Operation: {op.name}")
    print("[*] Waiting for VM to spin up...")
    
    # Wait for completion
    for _ in range(60):
        time.sleep(3)
        try:
            inst = client.get(project=PROJECT_ID, zone=target_zone, instance=INSTANCE_NAME)
            if inst.status == "RUNNING":
                ext_ip = inst.network_interfaces[0].access_configs[0].nat_i_p
                print(f"[SUCCESS] VM is RUNNING! External IP: {ext_ip}")
                return ext_ip
        except Exception:
            pass
    print("[-] Timed out waiting for VM.")
    return None

if __name__ == "__main__":
    if not check_billing_and_api():
        print("\n[ACTION REQUIRED]: Link a Billing Account to project 'prepmeupai' in GCP Console.")
        sys.exit(1)
        
    create_firewall_rules()
    
    for z in [ZONE] + FALLBACK_ZONES:
        try:
            ip = create_vm(z)
            if ip:
                print(f"\n=======================================================")
                print(f" PrepMeUp AI GCP Edge Proxy deployed successfully!")
                print(f" Zone: {z}")
                print(f" Public IP: {ip}")
                print(f" Nginx Proxy & Cloudflare Tunnel: Active via Startup Script")
                print(f"=======================================================")
                break
        except Exception as e:
            print(f"[!] Failed in zone {z}: {e}. Retrying next zone...")

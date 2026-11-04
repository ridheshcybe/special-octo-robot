#!/usr/bin/env bash
# =============================================================================
# Google Cloud Platform (GCP) — Autonomous Production Setup Script
# Target: Always Free e2-micro VM (2 vCPU, 1 GB RAM, 30 GB SSD)
# OS: Ubuntu 22.04 / 24.04 LTS
# Security: Zero Inbound Ports (Cloudflare Tunnel), Anti-OOM 2GB Swap, Systemd Auto-Healing
# =============================================================================

set -e

echo "=== [1/6] Updating Ubuntu System Packages ==="
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl wget git jq ufw htop ca-certificates gnupg

# -----------------------------------------------------------------------------
# 2. Configure 2 GB Swap File (Crucial for GCP e2-micro 1GB RAM)
# -----------------------------------------------------------------------------
echo "=== [2/6] Configuring 2 GB Swap Space (Prevents OOM Crashes) ==="
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    # Lower swappiness to prefer RAM, use swap only during memory spikes
    sudo sysctl vm.swappiness=10
    echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
    echo "✓ 2 GB Swap file successfully activated."
else
    echo "✓ Swapfile already exists."
fi

# -----------------------------------------------------------------------------
# 3. Install Docker Engine & Docker Compose Plugin
# -----------------------------------------------------------------------------
echo "=== [3/6] Installing Docker Engine & Compose ==="
if ! command -v docker &> /dev/null; then
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker $USER
    echo "✓ Docker installed successfully."
else
    echo "✓ Docker already installed."
fi

# -----------------------------------------------------------------------------
# 4. Install Cloudflare Tunnel Daemon (cloudflared)
# -----------------------------------------------------------------------------
echo "=== [4/6] Installing Cloudflare Tunnel (Zero Open Inbound Ports) ==="
if ! command -v cloudflared &> /dev/null; then
    curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
    echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' | sudo tee /etc/apt/sources.list.d/cloudflared.list
    sudo apt-get update -y
    sudo apt-get install -y cloudflared
    echo "✓ Cloudflared installed."
else
    echo "✓ Cloudflared already installed."
fi

# -----------------------------------------------------------------------------
# 5. Lock Down Firewall (Zero Inbound Ports on GCP)
# -----------------------------------------------------------------------------
echo "=== [5/6] Hardening Firewall (Stealth Mode) ==="
# Cloudflare Tunnel only requires OUTBOUND traffic on port 443.
# All inbound ports (including 80, 443, 8080) can be completely blocked!
sudo ufw default deny incoming
sudo ufw default allow outgoing
# Allow SSH only for emergency administration (GCP web console uses internal metadata)
sudo ufw allow 22/tcp comment 'SSH Administration'
sudo ufw --force enable
echo "✓ Inbound firewall locked. All HTTP/HTTPS enters strictly via encrypted Cloudflare Tunnel."

# -----------------------------------------------------------------------------
# 6. Autonomous Systemd Watchdog Service
# -----------------------------------------------------------------------------
echo "=== [6/6] Configuring Autonomous Systemd Service ==="
cat << 'EOF' | sudo tee /etc/systemd/system/pmu-stack.service > /dev/null
[Unit]
Description=PrepMeUp AI & Directus Docker Compose Stack
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/admin/portfolio/deploy/cms
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable pmu-stack.service

echo "============================================================================="
echo "✓ GCP Autonomous VM Hardening Complete!"
echo "• Memory: 1 GB RAM + 2 GB Swap (Anti-OOM Protection Active)"
echo "• Security: Stealth Mode (0 Inbound HTTP/HTTPS ports open)"
echo "• Self-Healing: Systemd auto-restarts Docker stack on VM reboot or GCP migration"
echo "============================================================================="

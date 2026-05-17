#!/bin/bash
# Save as: scripts/bootstrap_server.sh
# Run on a fresh Ubuntu 22.04 server as root

set -euo pipefail
echo "=== RegScope Server Bootstrap ==="

# 1. System updates
apt-get update && apt-get upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker ubuntu
systemctl enable docker
systemctl start docker

# 3. Install Docker Compose V2
apt-get install -y docker-compose-plugin

# 4. Install essential tools
apt-get install -y git curl wget htop ufw fail2ban

# 5. Firewall setup
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

# 6. Fail2ban (brute force protection)
systemctl enable fail2ban
systemctl start fail2ban

# 7. Create application directory
mkdir -p /opt/regscope
chown ubuntu:ubuntu /opt/regscope

# 8. Set up log rotation
cat > /etc/logrotate.d/regscope << 'EOF'
/var/log/regscope/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 ubuntu ubuntu
}
EOF

# 9. Swap file (needed for embedding model loading on smaller servers)
if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "=== Bootstrap complete. Reconnect as ubuntu user. ==="

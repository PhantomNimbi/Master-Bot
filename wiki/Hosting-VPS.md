# 🐧 Self-Hosted Linux VPS & Systemd Guide

Deploy Master-Bot directly to an Ubuntu/Debian/RHEL Virtual Private Server using Native Systemd services or Docker.

---

## 1. Install Prerequisites

```bash
sudo apt update
sudo apt install -y nodejs npm openjdk-21-jre postgresql redis-server
sudo npm install -g pnpm
```

---

## 2. Setup Project & Database

```bash
git clone https://github.com/galnir/Master-Bot.git /opt/master-bot
cd /opt/master-bot
cp .env.example .env
nano .env
pnpm install
pnpm db:push
pnpm build
```

---

## 3. Create Systemd Services

### Bot Service (`/etc/systemd/system/master-bot.service`)
```ini
[Unit]
Description=Master-Bot Discord Application
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/master-bot
ExecStart=/usr/bin/pnpm --filter @master-bot/bot start
Restart=always
RestartSec=10
EnvironmentFile=/opt/master-bot/.env

[Install]
WantedBy=multi-user.target
```

### Dashboard Service (`/etc/systemd/system/master-dashboard.service`)
```ini
[Unit]
Description=Master-Bot Next.js Web Dashboard
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/master-bot
ExecStart=/usr/bin/pnpm --filter @master-bot/dashboard start
Restart=always
RestartSec=10
EnvironmentFile=/opt/master-bot/.env

[Install]
WantedBy=multi-user.target
```

---

## 4. Enable & Start Services

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now master-bot master-dashboard
```

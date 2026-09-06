# 🐧 Self-Hosted Linux VPS & Systemd Guide

Deploy Master-Bot directly to an Ubuntu/Debian/RHEL Virtual Private Server using a native Systemd service. The bot and dashboard run as a single process — no PostgreSQL or Redis required (SQLite is embedded).

---

## 1. Install Prerequisites

```bash
sudo apt update
sudo apt install -y nodejs npm openjdk-21-jre
sudo npm install -g pnpm
```

Ensure Node.js is **22 or newer** (`node --version`).

---

## 2. Setup Project & Database

```bash
git clone https://github.com/galnir/Master-Bot.git /opt/master-bot
cd /opt/master-bot
cp .env.example .env
nano .env
pnpm install
pnpm build
```

The SQLite database is auto-created at `/opt/master-bot/data/bot.sqlite` on first start. Set `DISCORD_DB_PATH` if you want it elsewhere.

---

## 3. Create Systemd Service (`/etc/systemd/system/master-bot.service`)

```ini
[Unit]
Description=Master-Bot Discord Application (bot + embedded dashboard)
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/master-bot
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10
EnvironmentFile=/opt/master-bot/.env

[Install]
WantedBy=multi-user.target
```

---

## 4. Enable & Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now master-bot
```

Dashboard: `http://<vps-ip>:3000/dashboard`
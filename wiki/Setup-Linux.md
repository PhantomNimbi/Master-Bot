# 🐧 Linux Setup Guide

Detailed instructions for installing and running Master-Bot on Linux distributions.

---

## 1. Ubuntu / Debian

```bash
# 1. Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pnpm

# 2. Install OpenJDK 21, PostgreSQL, and Redis
sudo apt install -y openjdk-21-jre-headless postgresql postgresql-contrib redis-server

# 3. Enable and start services
sudo systemctl enable --now postgresql
sudo systemctl enable --now redis-server
```

---

## 2. Arch Linux

```bash
sudo pacman -S nodejs npm pnpm jdk21-openjdk postgresql redis
sudo -u postgres initdb -D /var/lib/postgres/data
sudo systemctl enable --now postgresql redis
```

---

## 3. Fedora / RHEL / Rocky Linux

```bash
sudo dnf module install -y nodejs:20
sudo npm install -g pnpm
sudo dnf install -y java-21-openjdk postgresql-server redis
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql redis
```

---

## 4. Run Development Stack

```bash
git clone https://github.com/galnir/Master-Bot.git
cd Master-Bot
pnpm install
cp .env.example .env
nano .env
pnpm dev
```

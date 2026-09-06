# 🐧 Linux Setup Guide

Detailed instructions for installing and running Master-Bot on Linux distributions.

---

## 1. Ubuntu / Debian

```bash
# 1. Install Node.js 20 LTS & pnpm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pnpm

# 2. Install OpenJDK 21 (for Lavalink audio engine)
sudo apt install -y openjdk-21-jre-headless
```

---

## 2. Arch Linux

```bash
sudo pacman -S nodejs npm pnpm jdk21-openjdk
```

---

## 3. Fedora / RHEL / Rocky Linux

```bash
sudo dnf module install -y nodejs:20
sudo npm install -g pnpm
sudo dnf install -y java-21-openjdk
```

---

## 4. Database & Audio Queue

Master-Bot uses **SQLite** (`file:./db.sqlite`) and an **In-Memory Audio Queue** out of the box. No PostgreSQL or Redis setup is required!

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

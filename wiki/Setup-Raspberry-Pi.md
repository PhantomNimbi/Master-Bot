# 🍓 Raspberry Pi (ARM64) Setup Guide

Instructions for running Master-Bot on Raspberry Pi 4 / 5 using Raspberry Pi OS (64-bit) or Debian ARM64.

---

## 1. Install Prerequisites

```bash
# Update package repositories
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS & pnpm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pnpm

# Install Java 21 (for Lavalink audio engine)
sudo apt install -y openjdk-21-jre-headless
```

---

## 2. Performance & Memory Recommendations

- **SWAP Allocation**: Ensure at least 2GB of swap is configured:
  ```bash
  sudo dphys-swapfile swapoff
  sudo sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile
  sudo dphys-swapfile setup
  sudo dphys-swapfile swapon
  ```
- **Node Memory Limits**: If running on 2GB/4GB models, run with `--max-old-space-size=1024`.

---

## 3. Launch Master-Bot

```bash
git clone https://github.com/galnir/Master-Bot.git
cd Master-Bot
pnpm install
cp .env.example .env
nano .env
pnpm dev
```

# 🪟 Windows Setup Guide

Detailed instructions for installing and running Master-Bot locally on Windows 10/11.

---

## 1. Install Prerequisites via `winget`

Open **PowerShell as Administrator**:

```powershell
# 1. Install Node.js LTS
winget install OpenJS.NodeJS.LTS

# 2. Install pnpm
npm install -g pnpm

# 3. Install OpenJDK 21 LTS
winget install Microsoft.OpenJDK.21

# 4. Install PostgreSQL 16
winget install PostgreSQL.PostgreSQL.16
```

---

## 2. Redis on Windows

Choose one of the following methods to run Redis on Windows:

### Option A: Memurai (Native Redis Compatible Daemon)
```powershell
winget install Memurai.MemuraiDeveloper
```

### Option B: Docker Container
```powershell
docker run -d --name master-bot-redis -p 6379:6379 redis:alpine
```

### Option C: WSL 2 (Windows Subsystem for Linux)
```powershell
wsl --install
# Inside Ubuntu terminal:
sudo apt update && sudo apt install -y redis-server
sudo service redis-server start
```

---

## 3. PowerShell Execution Policy

If PowerShell blocks running `pnpm` scripts:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 4. Launch Development Stack

```powershell
git clone https://github.com/galnir/Master-Bot.git
cd Master-Bot
pnpm install
cp .env.example .env
# Edit .env with your credentials
pnpm dev
```

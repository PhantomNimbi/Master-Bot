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

# 3. Install OpenJDK 21 LTS (for Lavalink audio engine)
winget install Microsoft.OpenJDK.21
```

---

## 2. Database & Audio Queue

Master-Bot uses **SQLite** and an **In-Memory Audio Queue** out of the box. No PostgreSQL, Redis, or Memurai installation is required!

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
# Edit .env with your Discord Bot Token and Client ID
pnpm dev
```

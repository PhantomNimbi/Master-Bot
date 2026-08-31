# Setup & Deployment Guide

This guide covers setting up Master-Bot for development or production deployment across **Windows**, **macOS**, and **Linux**.

---

## 📋 System Prerequisites Overview

| Component | Minimum Version | Recommended Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>=20.0.0` | `20.x` or `22.x LTS` | JavaScript/TypeScript runtime |
| **pnpm** | `>=8.0.0` | `9.x` (`npm i -g pnpm`) | Monorepo package manager & workspace orchestrator |
| **Java** | `Java 17+` | `Java 21 LTS` | Lavalink v4 audio engine runtime |
| **PostgreSQL** | `14+` | `16.x` | Primary relational database |
| **Redis** | `6.x+` | `7.x` | Queue management & caching layer |

---

## 🖥️ Operating System Specific Setup

### 🪟 Windows Setup

#### 1. Install Prerequisites via `winget` (Windows Package Manager)

Open **PowerShell (Run as Administrator)** or **Windows Terminal**:

```powershell
# 1. Install Node.js LTS
winget install OpenJS.NodeJS.LTS

# 2. Install pnpm
npm install -g pnpm

# 3. Install Java 21 LTS (Microsoft OpenJDK or Eclipse Temurin)
winget install Microsoft.OpenJDK.21

# 4. Install PostgreSQL
winget install PostgreSQL.PostgreSQL.16

# 5. Verify installations in a new terminal window
node -v
pnpm -v
java -version
```

#### 2. Redis on Windows
Native Redis binaries for Windows are deprecated. You can run Redis on Windows using one of the following methods:
* **Option A: Docker (Recommended)**
  ```powershell
  docker run -d --name master-bot-redis -p 6379:6379 redis:alpine
  ```
* **Option B: WSL 2 (Windows Subsystem for Linux)**
  ```powershell
  wsl --install
  # Inside WSL Ubuntu terminal:
  sudo apt update && sudo apt install -y redis-server
  sudo service redis-server start
  ```
* **Option C: Memurai (Native Windows Redis-compatible daemon)**
  ```powershell
  winget install Memurai.MemuraiDeveloper
  ```

#### 3. Execution Policy (if script execution is disabled)
If PowerShell blocks scripts such as `pnpm`, run:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### 🍎 macOS Setup

#### 1. Install Prerequisites via Homebrew

Ensure [Homebrew](https://brew.sh/) is installed, then run:

```bash
# 1. Install Node.js LTS, pnpm, Java 21, PostgreSQL, and Redis
brew install node@20 pnpm openjdk@21 postgresql@16 redis

# 2. Add Node.js and Java to your system PATH (add to ~/.zshrc or ~/.bash_profile)
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk

# 3. Reload shell profile
source ~/.zshrc

# 4. Verify installations
node -v
pnpm -v
java -version
```

#### 2. Start Background Services

Start PostgreSQL and Redis as background services:

```bash
brew services start postgresql@16
brew services start redis
```

---

### 🐧 Linux Setup (Ubuntu / Debian / Arch / Fedora)

#### 1. Ubuntu / Debian

```bash
# 1. Install Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Install pnpm
sudo npm install -g pnpm

# 3. Install OpenJDK 21 LTS
sudo apt install -y openjdk-21-jre-headless

# 4. Install PostgreSQL & Redis
sudo apt install -y postgresql postgresql-contrib redis-server

# 5. Enable & Start Services
sudo systemctl enable --now postgresql
sudo systemctl enable --now redis-server

# 6. Verify installations
node -v
pnpm -v
java -version
```

#### 2. Arch Linux

```bash
# Install all required packages via pacman
sudo pacman -S nodejs npm pnpm jdk21-openjdk postgresql redis

# Initialize PostgreSQL cluster if new
sudo -u postgres initdb -D /var/lib/postgres/data

# Enable & Start Services
sudo systemctl enable --now postgresql redis
```

#### 3. Fedora / RHEL / Rocky Linux

```bash
# 1. Install packages via dnf
sudo dnf module install -y nodejs:20
sudo npm install -g pnpm
sudo dnf install -y java-21-openjdk postgresql-server redis

# 2. Initialize PostgreSQL database
sudo postgresql-setup --initdb

# 3. Enable & Start Services
sudo systemctl enable --now postgresql redis
```

---

## 💻 Common Monorepo Setup & Workflow

Once your operating system prerequisites are installed:

### 1. Clone the Repository

```bash
git clone https://github.com/galnir/Master-Bot.git
cd Master-Bot
```

### 2. Install Workspace Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Copy `.env.example` to create `.env`:

```bash
cp .env.example .env
```

Configure mandatory environment variables:
- `DISCORD_TOKEN`: Discord Bot Token from [Discord Developer Portal](https://discord.com/developers/applications).
- `DISCORD_CLIENT_ID` & `DISCORD_CLIENT_SECRET`: Application OAuth2 credentials.
- `DATABASE_URL` & `SHADOW_DB_URL`: PostgreSQL connection strings.
- `REDIS_HOST` & `REDIS_PORT`: Redis connection details.
- `LAVA_ENABLED`: Set to `true` when enabling audio features (defaults to `false`).
- `LAVA_HOST`, `LAVA_PORT`, `LAVA_PASS`: Lavalink connection parameters.

### 4. Push Database Schema (Automatic)

Running `pnpm dev` or `pnpm start` automatically executes `prisma db push` before launching services. You can also run it manually if needed:

```bash
pnpm db:push
```

### 5. Download Lavalink v4 Executable

Download the latest `Lavalink.jar` release from [Lavalink Releases](https://github.com/lavalink-devs/Lavalink/releases) and place it directly into the root workspace folder alongside `application.yml`.

A preconfigured template is provided — copy `application.yml.example` to `application.yml`:

```bash
cp application.yml.example application.yml
```

### 6. Run Unified Development Launcher

```bash
pnpm dev
```

The unified cross-platform launcher will:
1. Automatically execute `prisma db push` to ensure database schema synchronization.
2. Automatically free configured ports (`3000` for Dashboard, `6379` for Redis, `2333` for Lavalink).
3. Spawn Lavalink Server, Discord Bot, and Next.js Web Dashboard concurrently.
4. Isolate service log streams with clean overwrite flags (`{ flags: 'w' }`):
   - Bot Logs: `logs/bot.log`
   - Dashboard Logs: `logs/dashboard.log`
   - Lavalink Logs: `logs/lavalink.log`
   - Combined System Logs: `logs/combined.log`
5. Render a unified interactive status console.

---

## 🚀 Production Deployment

### Option A: Node.js Unified Production Launcher

To build and run all services in production mode:

```bash
pnpm build
pnpm start
```

### Option B: Docker Compose (Recommended for Servers)

Deploy the entire stack (Bot, Dashboard, PostgreSQL, Redis, Lavalink v4) via Docker:

```bash
docker compose --env-file docker.env up -d --build
```

To view logs or stop services:

```bash
docker compose logs -f
docker compose down
```

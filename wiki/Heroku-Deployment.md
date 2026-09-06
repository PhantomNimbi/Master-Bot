# ☁️ Cloud & Platform Deployment Guide

This guide provides exhaustive, manual step-by-step instructions for deploying **Master-Bot** and its **Next.js 15 Web Dashboard** across all major cloud hosting platforms and self-hosted environments:

- [Render](#1--render-rendercom)
- [Railway](#2--railway-railwayapp)
- [Fly.io](#3--flyio-flyio)
- [Heroku](#4--heroku-herokucom)
- [Koyeb](#5--koyeb-koyebcom)
- [Northflank](#6--northflank-northflankcom)
- [Self-Hosted Linux VPS (Docker Compose & Systemd)](#7--self-hosted-linux-vps-ubuntu--debian)
- [Pterodactyl Panel](#8--pterodactyl-game--app-panel)

---

## 🏗️ Monorepo Deployment Architecture

Master-Bot is a full-stack monorepo consisting of two active application processes and three backing data services:

```mermaid
flowchart TD
    subgraph Cloud["Production Cloud Environment"]
        Web["Next.js 15 Web Dashboard<br/>(Web Process / Dynamic Port)"]
        Worker["Sapphire Discord Bot<br/>(Background Worker / Gateway WS)"]
        Postgres[("PostgreSQL Database<br/>(Prisma ORM)")]
        Redis[("Redis Cache<br/>(State & Queues)")]
    end

    subgraph Audio["Audio Subsystem"]
        Lavalink["Lavalink v4 Audio Server<br/>(Port 2333 / WebSocket)"]
    end

    subgraph DiscordPlatform["Discord Infrastructure"]
        Gateway["Discord Gateway (WebSocket)"]
        API["Discord REST API v10"]
    end

    Web -->|Prisma Queries| Postgres
    Worker -->|Prisma Queries| Postgres
    Worker -->|Cache & State| Redis
    Worker -->|Audio Streaming| Lavalink
    Worker -->|Heartbeat & Events| Gateway
    Web -->|NextAuth & Webhooks| API
```

### Process Roles

1. **Web Dashboard (`apps/dashboard`)**:
   - **Type**: Web Service (Exposes an HTTP port).
   - **Command**: `pnpm --filter @master-bot/dashboard start` (or `node apps/dashboard/server.js`).
   - **Routes**: Next.js 15 App Router management portal, NextAuth Discord OAuth login, tRPC API procedures.

2. **Discord Bot Client (`apps/bot`)**:
   - **Type**: Background Worker / Service (No incoming HTTP port required).
   - **Command**: `pnpm --filter @master-bot/bot start` (or `node apps/bot/dist/index.js`).
   - **Routes**: Persistent Discord Gateway WebSocket connection, slash commands, music queue, and event listeners.

3. **PostgreSQL & Redis**:
   - Backing databases for persistence and low-latency cache.

4. **Lavalink v4 Audio Server**:
   - Required for music playback (`/play`, `/volume`, audio filters). Can be run alongside the bot via Docker or hosted externally on a dedicated VPS.

---

## 🔑 Master Environment Variables Reference

Configure these variables across your target hosting platform:

| Variable | Description | Required | Example |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | Yes | `production` |
| `DISCORD_TOKEN` | Discord Bot authentication token | Yes | `MTA...` |
| `DISCORD_CLIENT_ID` | Discord Application Client ID | Yes | `123456789012345678` |
| `DISCORD_CLIENT_SECRET` | Discord Application OAuth2 Secret | Yes | `abc123xyz...` |
| `DISCORD_OWNER_ID` | Discord User Snowflake ID of bot owner | Optional | `123456789012345678` |
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:pass@host:5432/master_bot?schema=public` |
| `REDIS_HOST` | Redis server hostname / IP | Yes | `127.0.0.1` or `redis.internal` |
| `REDIS_PORT` | Redis server port | Yes | `6379` |
| `REDIS_PASSWORD` | Redis authentication password | Optional | `your_redis_password` |
| `NEXTAUTH_SECRET` | 32-character secret for session encryption | Yes | `generate_random_32_char_secret` |
| `NEXTAUTH_URL` | Public canonical URL of dashboard | Yes | `https://dashboard.yourdomain.com` |
| `NEXTAUTH_URL_INTERNAL` | Internal loopback URL for local RPC | Optional | `http://localhost:3000` |
| `NEXT_PUBLIC_INVITE_URL` | Bot OAuth2 invite URL | Optional | `https://discord.com/api/oauth2/authorize?client_id=...` |
| `LAVA_ENABLED` | Master toggle for Lavalink audio | Optional | `true` |
| `LAVA_HOST` | Lavalink server hostname / IP | If Lava on | `127.0.0.1` or `lava.example.com` |
| `LAVA_PORT` | Lavalink WebSocket port | If Lava on | `2333` |
| `LAVA_PASS` | Lavalink server password | If Lava on | `youshallnotpass` |
| `LAVA_SECURE` | Use SSL/WSS for Lavalink connection | Optional | `false` |
| `TWITCH_ENABLED` | Enable Twitch streamer live monitor | Optional | `false` |
| `TWITCH_CLIENT_ID` | Twitch Developer Application Client ID | If Twitch on | `twitch_client_id` |
| `TWITCH_CLIENT_SECRET` | Twitch Developer Application Secret | If Twitch on | `twitch_client_secret` |
| `IGDB_ENABLED` | Enable video game search via IGDB | Optional | `false` |
| `IGDB_CLIENT_ID` | IGDB (Twitch) Application Client ID | If IGDB on | `igdb_client_id` |
| `IGDB_CLIENT_SECRET` | IGDB (Twitch) Application Secret | If IGDB on | `igdb_client_secret` |
| `KLIPY_API` | Klipy GIF search API token | Optional | `klipy_api_key` |
| `NEWS_ENABLED` | Enable world news via NewsAPI | Optional | `false` |
| `NEWS_API` | NewsAPI authentication key | If News on | `news_api_key` |
| `GENIUS_API` | Genius lyrics API client token | Optional | `genius_api_key` |

---

## 1. 🚀 Render (render.com)

Render provides managed PostgreSQL, Redis, and native Node.js Web Services and Background Workers.

### Step 1: Create Backing Databases
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **PostgreSQL**.
   - **Name**: `master-bot-db`
   - **Region**: Choose the region closest to your users.
   - Click **Create Database** and copy the **Internal Database URL**.
3. Click **New +** -> **Redis**.
   - **Name**: `master-bot-redis`
   - Click **Create Redis** and copy the **Internal Redis Host** and **Port**.

### Step 2: Deploy the Discord Bot (Background Worker)
1. In Render Dashboard, click **New +** -> **Background Worker**.
2. Connect your GitHub repository.
3. Configure service settings:
   - **Name**: `master-bot-worker`
   - **Language**: `Node`
   - **Branch**: `main`
   - **Build Command**: `pnpm install && pnpm db:generate && pnpm build`
   - **Start Command**: `pnpm --filter @master-bot/bot start`
4. In the **Environment Variables** section, add:
   - `NODE_ENV`: `production`
   - `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_OWNER_ID`
   - `DATABASE_URL`: (Paste Internal PostgreSQL URL from Step 1)
   - `REDIS_HOST`: (Paste Internal Redis Host)
   - `REDIS_PORT`: (Paste Internal Redis Port)
   - `LAVA_ENABLED`: `false` (or configure external Lavalink credentials)
5. Click **Create Background Worker**.

### Step 3: Deploy the Web Dashboard (Web Service)
1. Click **New +** -> **Web Service**.
2. Connect the same repository.
3. Configure service settings:
   - **Name**: `master-bot-dashboard`
   - **Language**: `Node`
   - **Branch**: `main`
   - **Build Command**: `pnpm install && pnpm db:generate && pnpm build`
   - **Start Command**: `pnpm --filter @master-bot/dashboard start`
4. In the **Environment Variables** section, add:
   - `NODE_ENV`: `production`
   - `NEXTAUTH_URL`: `https://master-bot-dashboard.onrender.com` (or your custom domain)
   - `NEXTAUTH_SECRET`: (Generate a random 32-character string)
   - `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_TOKEN`
   - `DATABASE_URL`: (Paste Internal PostgreSQL URL from Step 1)
5. Under your Discord Developer Portal OAuth2 Redirects, add:
   - `https://master-bot-dashboard.onrender.com/api/auth/callback/discord`
6. Click **Create Web Service**.

---

## 2. 🚆 Railway (railway.app)

Railway provides instant environment provisioning with connected services.

### Step 1: Create Project & Add Databases
1. Go to [Railway Dashboard](https://railway.app/dashboard) and click **New Project**.
2. Select **Provision PostgreSQL**.
3. In the same project canvas, click **Create** -> **Database** -> **Add Redis**.

### Step 2: Add Discord Bot Service
1. Click **Create** -> **GitHub Repo** and select your repository.
2. Go to the newly created service -> **Settings**:
   - **Service Name**: `master-bot-worker`
   - **Custom Build Command**: `pnpm install && pnpm db:generate && pnpm build`
   - **Custom Start Command**: `pnpm --filter @master-bot/bot start`
3. Go to **Variables** and add:
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
   - `REDIS_HOST`: `${{Redis.REDISHOST}}`
   - `REDIS_PORT`: `${{Redis.REDISPORT}}`
   - `REDIS_PASSWORD`: `${{Redis.REDISPASSWORD}}`
   - `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`
   - `LAVA_ENABLED`: `false`

### Step 3: Add Web Dashboard Service
1. In the same project canvas, click **Create** -> **GitHub Repo** and select the repository again.
2. Go to service -> **Settings**:
   - **Service Name**: `master-bot-dashboard`
   - **Custom Build Command**: `pnpm install && pnpm db:generate && pnpm build`
   - **Custom Start Command**: `pnpm --filter @master-bot/dashboard start`
3. Under **Networking**, click **Generate Domain**.
4. Go to **Variables** and add:
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
   - `NEXTAUTH_SECRET`: (Generate a random 32-character secret)
   - `NEXTAUTH_URL`: `https://${{RAILWAY_PUBLIC_DOMAIN}}`
   - `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_TOKEN`
5. Add the generated domain callback URL to your Discord Developer Portal OAuth2 settings.

---

## 3. ✈️ Fly.io (fly.io)

Fly.io runs applications globally close to users using lightweight microVMs.

### Step 1: Install Fly CLI & Authenticate
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Log in
fly auth login
```

### Step 2: Create Managed PostgreSQL & Redis
```bash
# Create PostgreSQL Cluster
fly postgres create --name master-bot-postgres --region ord --initial-cluster-size 1 --vm-size shared-cpu-1x

# Create Upstash Redis
fly redis create --name master-bot-redis --region ord
```

### Step 3: Deploy Application
1. In the project root, launch the app:
   ```bash
   fly launch --no-deploy
   ```
2. Attach PostgreSQL and Redis to the application:
   ```bash
   fly postgres attach master-bot-postgres --app master-bot
   ```
3. Set secrets:
   ```bash
   fly secrets set \
     DISCORD_TOKEN="your_bot_token" \
     DISCORD_CLIENT_ID="your_client_id" \
     DISCORD_CLIENT_SECRET="your_client_secret" \
     NEXTAUTH_SECRET="your_32_char_secret" \
     NEXTAUTH_URL="https://master-bot.fly.dev" \
     LAVA_ENABLED=false
   ```
4. Deploy the application:
   ```bash
   fly deploy
   ```

---

## 4. 🟣 Heroku (heroku.com)

### Step 1: Create Application & Add-ons
```bash
# Create Heroku Application
heroku create master-bot-prod

# Add official Node.js buildpack
heroku buildpacks:add heroku/nodejs -a master-bot-prod

# Attach Heroku Postgres (Essential Tier)
heroku addons:create heroku-postgresql:essential-0 -a master-bot-prod

# Attach Heroku Data for Redis (Mini Tier)
heroku addons:create heroku-redis:mini -a master-bot-prod
```

### Step 2: Configure `Procfile`
Ensure a `Procfile` exists at the root of your repository:
```text
web: pnpm --filter @master-bot/dashboard start
worker: pnpm --filter @master-bot/bot start
```

### Step 3: Set Config Vars & Deploy
```bash
# Set environment variables
heroku config:set \
  NODE_ENV=production \
  NPM_CONFIG_PRODUCTION=false \
  DISCORD_TOKEN="your_bot_token" \
  DISCORD_CLIENT_ID="your_client_id" \
  DISCORD_CLIENT_SECRET="your_client_secret" \
  NEXTAUTH_SECRET="generate_random_32_char_secret" \
  NEXTAUTH_URL="https://master-bot-prod.herokuapp.com" \
  LAVA_ENABLED=false \
  -a master-bot-prod

# Deploy code
git push heroku main

# Scale dynos (1 Web Dashboard dyno, 1 Bot Worker dyno)
heroku ps:scale web=1 worker=1 -a master-bot-prod

# Sync Prisma Schema
heroku run pnpm --filter @master-bot/db prisma db push -a master-bot-prod
```

---

## 5. 🟢 Koyeb (koyeb.com)

Koyeb offers high-performance serverless deployment with built-in global edge routing.

### Step 1: Deploy PostgreSQL
1. Log in to [Koyeb Console](https://app.koyeb.com/).
2. Create a new **PostgreSQL Database** service and copy the connection string.

### Step 2: Deploy Web Dashboard
1. Click **Create Service** -> **GitHub**.
2. Select repository and set:
   - **Type**: Web Service
   - **Build Command**: `pnpm install && pnpm db:generate && pnpm build`
   - **Run Command**: `pnpm --filter @master-bot/dashboard start`
   - **Port**: `3000`
3. Add Environment Variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`).

### Step 3: Deploy Discord Bot
1. In the same App, click **Add Service** -> **GitHub**.
2. Select repository and set:
   - **Type**: Worker Service
   - **Build Command**: `pnpm install && pnpm db:generate && pnpm build`
   - **Run Command**: `pnpm --filter @master-bot/bot start`
3. Add Environment Variables (`DATABASE_URL`, `DISCORD_TOKEN`, `REDIS_HOST`, `REDIS_PORT`, `LAVA_ENABLED`).

---

## 6. 🔷 Northflank (northflank.com)

Northflank allows running microservices, stateful databases, and cron jobs in unified projects.

1. **Create Project**: Create a new Northflank project.
2. **Add Add-ons**: Provision a managed **PostgreSQL** and **Redis** add-on.
3. **Deploy Bot Deployment**:
   - **Deployment Type**: Background Worker / Deployment Service.
   - **Build**: Node.js buildpack or Dockerfile (`apps/bot`).
   - **Environment**: Link PostgreSQL and Redis credentials; provide `DISCORD_TOKEN`.
4. **Deploy Dashboard Web Service**:
   - **Deployment Type**: Combined Service (Port 3000 exposed via HTTPS domain).
   - **Build**: Node.js buildpack (`apps/dashboard`).
   - **Environment**: Link PostgreSQL connection; set `NEXTAUTH_URL` and `NEXTAUTH_SECRET`.

---

## 7. 🐧 Self-Hosted Linux VPS (Ubuntu / Debian)

For complete control and highest audio performance with internal Lavalink v4.

### Option A: Docker Compose (Recommended)

1. **Install Docker & Docker Compose**:
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```

2. **Clone & Configure**:
   ```bash
   git clone https://github.com/galnir/Master-Bot.git
   cd Master-Bot
   cp docker.env.example docker.env
   nano docker.env
   ```

3. **Start All 5 Services**:
   ```bash
   docker compose --env-file docker.env up -d --build
   ```

4. **Verify Container Health**:
   ```bash
   docker compose ps
   docker compose logs -f
   ```

### Option B: Native Systemd Services

1. **Install Prerequisites**:
   ```bash
   sudo apt update
   sudo apt install -y nodejs npm openjdk-21-jre postgresql redis-server
   sudo npm install -g pnpm
   ```

2. **Setup Repository & Database**:
   ```bash
   git clone https://github.com/galnir/Master-Bot.git /opt/master-bot
   cd /opt/master-bot
   cp .env.example .env
   nano .env
   pnpm install
   pnpm db:push
   pnpm build
   ```

3. **Create Systemd Service for Bot (`/etc/systemd/system/master-bot.service`)**:
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

4. **Create Systemd Service for Dashboard (`/etc/systemd/system/master-dashboard.service`)**:
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

5. **Enable & Start Services**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now master-bot master-dashboard
   ```

---

## 8. 🦅 Pterodactyl (Game & App Panel)

If hosting on a Pterodactyl game/bot server panel using a generic Node.js egg:

1. **Egg Selection**: Select a **Node.js 20+** egg.
2. **File Upload**: Upload repository files or clone via Git.
3. **Startup Command**:
   ```bash
   pnpm install && pnpm db:generate && pnpm --filter @master-bot/bot start
   ```
4. **Environment Variables**: Populate all variables in the Pterodactyl **Startup** tab.
5. **Database**: Point `DATABASE_URL` and `REDIS_HOST` to your database server.

---

## 🔄 Post-Deployment Verification Checklist

```text
[ ] Discord Bot is ONLINE in your server and responds to /help and /play
[ ] Next.js Web Dashboard loads over HTTPS at your configured NEXTAUTH_URL
[ ] Discord OAuth Login redirects properly and displays your user profile
[ ] Prisma migrations synced cleanly (no missing table errors in logs)
[ ] Redis connection established for music queue and cache
[ ] Lavalink node connects successfully (if LAVA_ENABLED=true)
```

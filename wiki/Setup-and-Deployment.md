# Setup & Deployment Guide

This guide covers setting up Master-Bot for development or production deployment across **Windows**, **macOS**, and **Linux**.

---

## 📋 System Prerequisites

- **Node.js**: `>=20.0.0`
- **pnpm**: `>=8.0.0` (`npm install -g pnpm`)
- **Java**: Java 17+ required · Java 21 LTS recommended (Required for Lavalink v4 executable)
- **PostgreSQL**: PostgreSQL database server (Local or Cloud instance)
- **Redis Server**: Redis instance for queue management and caching
- **Docker & Docker Compose** (Optional for containerized deployment)

---

## 💻 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/PhantomNimbi/Master-Bot.git
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

---

### Option C: 1-Click Heroku Deployment (Zero Server Management)

Deploy Master-Bot directly to Heroku with pre-configured internal databases and automatic schema migrations:

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/PhantomNimbi/Master-Bot)

1. Click the button above to launch the Heroku App Creator.
2. Supply your Discord Bot credentials (`DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`).
3. Heroku automatically provisions:
   - **Heroku PostgreSQL Addon** (`DATABASE_URL`)
   - **Heroku Redis Addon** (`REDIS_URL`)
   - **Multi-Buildpack JVM & Node.js**
   - **Postdeploy Migration**: Runs `pnpm db:push` automatically.
4. Click **Deploy App**.

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
- `DATABASE_URL`: PostgreSQL connection string.
- `REDIS_HOST` & `REDIS_PORT`: Redis connection details.
- `LAVA_HOST`, `LAVA_PORT`, `LAVA_PASS`: Lavalink connection parameters.

### 4. Push Database Schema

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
1. Automatically free configured ports (`3000` for Dashboard, `6379` for Redis, `2333` for Lavalink).
2. Spawn Lavalink Server, Discord Bot, and Next.js Web Dashboard concurrently.
3. Isolate service log streams:
   - Bot Logs: `logs/bot.log`
   - Dashboard Logs: `logs/dashboard.log`
   - Lavalink Logs: `logs/lavalink.log`
   - Combined System Logs: `logs/combined.log`
4. Render a unified interactive status console.

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

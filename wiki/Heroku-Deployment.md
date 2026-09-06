# 🟣 Heroku Deployment Guide

This guide provides a comprehensive, step-by-step walkthrough for deploying **Master-Bot** and its **Next.js Web Dashboard** to [Heroku](https://www.heroku.com/).

---

## 📑 Table of Contents

1. [Architecture Overview](#-architecture-overview)
2. [Prerequisites](#-prerequisites)
3. [Method A: Git Buildpack Deployment](#-method-a-git-buildpack-deployment)
4. [Method B: Docker Container Deployment (heroku.yml)](#-method-b-docker-container-deployment-herokuxml)
5. [Database & Redis Add-ons](#-database--redis-add-ons)
6. [Environment Variables & Config Vars](#-environment-variables--config-vars)
7. [Scaling Dynos](#-scaling-dynos)
8. [Database Synchronization](#-database-synchronization)
9. [Lavalink & Audio Hosting on Heroku](#-lavalink--audio-hosting-on-heroku)
10. [Monitoring & Logs](#-monitoring--logs)

---

## 🏗️ Architecture Overview

On Heroku, Master-Bot runs across dedicated process types:

```mermaid
flowchart TD
    subgraph Heroku Cloud Environment
        WebDyno["web Dyno<br/>(Next.js 15 Web Dashboard on $PORT)"]
        WorkerDyno["worker Dyno<br/>(Sapphire Discord Bot Client)"]
        PostgresAddon[(Heroku Postgres<br/>DATABASE_URL)]
        RedisAddon[(Heroku Redis<br/>REDIS_URL)]
    end

    RemoteLavalink["Remote Lavalink v4 Node<br/>(Dedicated VPS / External Host)"]

    WebDyno -->|Prisma ORM / tRPC| PostgresAddon
    WorkerDyno -->|Prisma ORM| PostgresAddon
    WorkerDyno -->|Queue & Cache| RedisAddon
    WorkerDyno -->|Audio WS (Port 2333)| RemoteLavalink
    WorkerDyno -->|Gateway WS| DiscordGateway[Discord Gateway API]
    WebDyno -->|NextAuth / REST| DiscordGateway
```

- **`web` Dyno**: Hosts the Next.js 15 web dashboard (`apps/dashboard`), bound to Heroku's dynamic `$PORT`.
- **`worker` Dyno**: Runs the Discord bot client (`apps/bot`) as a background worker.
- **`Heroku Postgres`**: Provides managed PostgreSQL storage for Prisma ORM.
- **`Heroku Data for Redis`**: Provides fast caching and queue management.

---

## 🛠️ Prerequisites

1. A [Heroku Account](https://signup.heroku.com/).
2. [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed on your machine:
   - **Windows**: `winget install Heroku.CLI`
   - **macOS**: `brew tap heroku/brew && brew install heroku`
   - **Linux**: `curl https://cli-assets.heroku.com/install.sh | sh`
3. Verified login:
   ```bash
   heroku login
   ```

---

## 📦 Method A: Git Buildpack Deployment

### 1. Create a New Heroku Application

```bash
heroku create master-bot-app
```

### 2. Configure Buildpacks

Master-Bot uses `pnpm` and `Node.js 20+`. Configure the official Node.js buildpack:

```bash
# Add Node.js buildpack
heroku buildpacks:add heroku/nodejs -a master-bot-app

# Ensure devDependencies are installed during the build phase
heroku config:set NPM_CONFIG_PRODUCTION=false -a master-bot-app
```

### 3. Configure Add-ons (PostgreSQL & Redis)

Attach managed database and Redis services:

```bash
# Provision PostgreSQL (Essential Tier)
heroku addons:create heroku-postgresql:essential-0 -a master-bot-app

# Provision Redis (Mini Tier or Redis Cloud)
heroku addons:create heroku-redis:mini -a master-bot-app
```

> [!NOTE]
> Heroku automatically populates `DATABASE_URL` and `REDIS_URL` in your application config vars when add-ons are attached.

### 4. Create `Procfile`

Ensure a `Procfile` exists at the root of your repository with the following process definitions:

```text
web: pnpm --filter @master-bot/dashboard start
worker: pnpm --filter @master-bot/bot start
```

### 5. Set Config Vars

Set all required Discord and dashboard environment variables:

```bash
heroku config:set \
  NODE_ENV=production \
  DISCORD_TOKEN="your_bot_token" \
  DISCORD_CLIENT_ID="your_client_id" \
  DISCORD_CLIENT_SECRET="your_client_secret" \
  NEXTAUTH_SECRET="generate_random_32_char_secret" \
  NEXTAUTH_URL="https://master-bot-app.herokuapp.com" \
  LAVA_ENABLED=true \
  LAVA_EXTERNAL=true \
  LAVA_HOST="your-external-lavalink-node.com" \
  LAVA_PORT=2333 \
  LAVA_PASS="your_lavalink_password" \
  -a master-bot-app
```

### 6. Deploy Code to Heroku

```bash
git push heroku main
```

---

## 🐳 Method B: Docker Container Deployment (`heroku.yml`)

For exact environment parity without buildpack caching issues, you can deploy using Heroku's container runtime.

### 1. Set App Stack to Container

```bash
heroku stack:set container -a master-bot-app
```

### 2. Configure `heroku.yml`

Create `heroku.yml` in the root workspace directory:

```yaml
setup:
  addons:
    - plan: heroku-postgresql:essential-0
      as: DATABASE
    - plan: heroku-redis:mini
      as: REDIS
build:
  docker:
    web:
      dockerfile: Dockerfile
      target: dashboard
    worker:
      dockerfile: Dockerfile
      target: bot
release:
  command:
    - pnpm --filter @master-bot/db prisma db push
```

### 3. Deploy via Git

```bash
git push heroku main
```

---

## ⚙️ Environment Variables & Config Vars Reference

| Variable                | Description                               | Required   | Example                        |
| :---------------------- | :---------------------------------------- | :--------- | :----------------------------- |
| `DISCORD_TOKEN`         | Discord Bot authentication token          | Yes        | `MTA...`                       |
| `DISCORD_CLIENT_ID`     | Discord Application ID                    | Yes        | `123456789012345678`           |
| `DISCORD_CLIENT_SECRET` | Discord OAuth2 Client Secret              | Yes        | `abc123xyz...`                 |
| `NEXTAUTH_SECRET`       | NextAuth cryptographic session secret     | Yes        | `openssl rand -base64 32`      |
| `NEXTAUTH_URL`          | Canonical URL of the Heroku web dashboard | Yes        | `https://my-app.herokuapp.com` |
| `DATABASE_URL`          | Primary PostgreSQL connection string      | Yes        | Managed by Heroku Postgres     |
| `REDIS_URL`             | Redis connection URL                      | Yes        | Managed by Heroku Redis        |
| `LAVA_ENABLED`          | Enables audio playback subsystem          | Optional   | `true`                         |
| `LAVA_EXTERNAL`         | Declares external Lavalink host           | Optional   | `true`                         |
| `LAVA_HOST`             | External Lavalink hostname / IP           | If Lava on | `lava.example.com`             |
| `LAVA_PORT`             | Lavalink WebSocket port                   | If Lava on | `2333`                         |
| `LAVA_PASS`             | Lavalink authentication password          | If Lava on | `youshallnotpass`              |

---

## 📈 Scaling Dynos

After deploying, scale up the `web` and `worker` dynos:

```bash
# Enable 1 web dyno (Dashboard) and 1 worker dyno (Discord Bot)
heroku ps:scale web=1 worker=1 -a master-bot-app
```

To verify running dynos:

```bash
heroku ps -a master-bot-app
```

---

## 🗄️ Database Synchronization

To push your Prisma schema changes directly to Heroku Postgres:

```bash
heroku run pnpm --filter @master-bot/db prisma db push -a master-bot-app
```

---

## 🎵 Lavalink & Audio Hosting Considerations

> [!IMPORTANT]
> **Recommended Audio Architecture:**  
> Heroku dynos restart at least once every 24 hours (dyno cycling) and do not support raw UDP voice traffic routing on standard web ports. For optimal, uninterrupted 24/7 music playback:
>
> 1. Set `LAVA_EXTERNAL=true` on Heroku.
> 2. Host `Lavalink.jar` on a cheap standalone VPS (e.g., Hetzner, DigitalOcean, Oracle Cloud) or use a managed Lavalink provider.
> 3. Point `LAVA_HOST`, `LAVA_PORT`, and `LAVA_PASS` on Heroku to your external Lavalink instance.

---

## 📜 Monitoring & Logs

Stream live logs from all dynos in real time:

```bash
# Stream combined logs
heroku logs --tail -a master-bot-app

# Filter logs for the Discord bot worker only
heroku logs --tail --ps worker -a master-bot-app

# Filter logs for the Next.js Dashboard web server only
heroku logs --tail --ps web -a master-bot-app
```

---

## 🔄 Restarting & Troubleshooting

- **Restart App**: `heroku restart -a master-bot-app`
- **Run Interactive Shell**: `heroku run bash -a master-bot-app`
- **Check Dyno Status**: `heroku ps -a master-bot-app`

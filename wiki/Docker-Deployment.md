# 🐳 Docker Compose Deployment Guide

Deploy the entire 5-container Master-Bot ecosystem (Bot, Dashboard, PostgreSQL, Redis, Lavalink v4) locally or on a server using Docker.

---

## 🏗️ Docker Ecosystem Architecture

```mermaid
flowchart TD
    subgraph DockerNetwork["Docker Bridge Network (master-bot-net)"]
        BotContainer["master-bot-app<br/>(Sapphire Discord Bot)"]
        DashContainer["master-bot-dashboard<br/>(Next.js 15 App Router / Port 3000)"]
        LavaContainer["master-bot-lavalink<br/>(Lavalink v4 Java 21 / Port 2333)"]
        PostgresContainer[("master-bot-postgres<br/>(PostgreSQL 16 / Port 5432)")]
        RedisContainer[("master-bot-redis<br/>(Redis 7 / Port 6379)")]
    end

    DashContainer --> PostgresContainer
    BotContainer --> PostgresContainer
    BotContainer --> RedisContainer
    BotContainer --> LavaContainer
```

---

## 🚀 Quick Launch Steps

1. **Clone Repository & Prepare Environment**:
   ```bash
   git clone https://github.com/galnir/Master-Bot.git
   cd Master-Bot
   cp docker.env.example docker.env
   nano docker.env
   ```

2. **Launch All 5 Containers**:
   ```bash
   docker compose --env-file docker.env up -d --build
   ```

3. **Check Container Status**:
   ```bash
   docker compose ps
   ```

4. **View Live Logs**:
   ```bash
   # All containers
   docker compose logs -f

   # Discord Bot only
   docker compose logs -f bot

   # Dashboard only
   docker compose logs -f dashboard
   ```

5. **Stop Stack**:
   ```bash
   docker compose down
   ```

# 📖 Master-Bot Wiki

Welcome to the official **Master-Bot** documentation wiki. Master-Bot is a full-stack, production-grade Discord Bot and Next.js Web Dashboard built with **TypeScript**, **Sapphire Framework**, **discord.js v14**, **Next.js 15**, **React 19**, **tRPC v11**, **Prisma ORM**, **Redis**, and **Lavalink v4**.

---

## 🗺️ System Architecture

```mermaid
flowchart TD
    subgraph Apps["Applications (apps/)"]
        Bot["apps/bot<br/>(Sapphire Framework & discord.js v14)"]
        Dash["apps/dashboard<br/>(Next.js 15 App Router)"]
    end

    subgraph Packages["Shared Packages (packages/)"]
        API["packages/api<br/>(tRPC v11 Routers)"]
        Auth["packages/auth<br/>(NextAuth.js v5)"]
        DB["packages/db<br/>(Prisma ORM Client)"]
        Config["packages/config<br/>(ESLint & Tailwind)"]
    end

    subgraph Services["External & Backing Services"]
        PG[("PostgreSQL Database")]
        Redis[("Redis Cache")]
        Lava["Lavalink v4 Audio Server"]
        Discord["Discord Gateway & REST API v10"]
    end

    Dash --> API
    Dash --> Auth
    Bot --> API
    API --> DB
    Auth --> DB
    DB --> PG
    Bot --> Lava
    Bot --> Redis
    Bot --> Discord
    API --> Discord
```

---

## 📚 Wiki Sections Hub

| Section | Description | Top-Level Guide |
| :--- | :--- | :--- |
| **⚙️ Getting Started** | Local setup for Windows, macOS, Linux, Raspberry Pi, and Docker | [Setup Guide](Setup) |
| **☁️ Cloud Hosting** | Manual production deployment across Render, Railway, Fly.io, Heroku, Koyeb, VPS | [Hosting Guide](Hosting) |
| **🎵 Lavalink & Audio** | Lavalink v4 setup, YouTube OAuth device flow, cipher deciphering, audio filters | [Lavalink Guide](Lavalink) |
| **🌐 Web Dashboard** | Next.js 15 App Router architecture, tRPC v11 procedures, and 9 Feature Studios | [Dashboard Guide](Dashboard) |
| **🔑 Configuration** | Master environment variables, API keys (Twitch, IGDB, Klipy, NewsAPI), feature flags | [Configuration Guide](Configuration) |
| **📜 Commands** | Complete 74 slash command catalog and server configuration (`/set`) manual | [Commands Reference](Commands) |
| **🧪 Testing** | Vitest unit and integration test harness, coverage, and validation workflows | [Testing Guide](Testing) |

---

## ⚡ Quick Start (Local Development)

```bash
# 1. Clone repository
git clone https://github.com/galnir/Master-Bot.git
cd Master-Bot

# 2. Install dependencies & generate database client
pnpm install

# 3. Configure environment
cp .env.example .env
nano .env

# 4. Launch unified dev stack (Bot, Dashboard, Lavalink)
pnpm dev
```

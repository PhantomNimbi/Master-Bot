# 🤖 Master-Bot

[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/Package_Manager-pnpm-orange.svg)](https://pnpm.io/)
[![Lavalink](https://img.shields.io/badge/Lavalink-v4.x-purple.svg)](https://github.com/lavalink-devs/Lavalink)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/galnir/Master-Bot/pulls)

**Master-Bot** is a production-ready, high-performance Discord Music and Utility Bot with a full-featured **Next.js Web Dashboard**. Built with **TypeScript**, **Sapphire Framework**, **discord.js v14**, **Next.js 15**, **tRPC v11**, **Prisma ORM** (SQLite), **ioredis-mock** (zero external Redis binaries needed), and **Lavalink v4**.

---

## 🚀 Deployment

Master-Bot runs as a single Node.js process hosting the **Discord bot** and the **Next.js dashboard** — locally, on a VPS, or via Docker. Music requires a **Lavalink v4 server running externally** on a Lavalink server you host yourself (Docker/VPS/Local). See the [Deployment Wiki](wiki/Deployment.md).

> 🏠 **Self-host only:** managed cloud platforms are intentionally not supported. Their OAuth/domain allowlists block fresh cloud subdomains (breaking dashboard login), and their paid tiers are a poor fit for an open-source bot. See the [Deployment Wiki](wiki/Deployment.md) for the rationale.

| Platform | Notes |
| :--- | :--- |
| **Docker / VPS** | Recommended. `Dockerfile` + `docker-compose.yml` run bot + dashboard and Lavalink in separate containers with persistent storage. Full guide in the [Deployment Wiki](wiki/Deployment.md). |
| **Local** | `pnpm install && pnpm build && pnpm start` on any Node.js 20+ machine — see [Quick Start](#-quick-start-guide). |

> 💡 **Audio Engine:** Master-Bot runs its bot + dashboard in a single Node process and connects to a **separate Lavalink v4 server** (self-hosted via Docker or dedicated VPS). Set `LAVA_ENABLED=true` to enable music; set it to `false` to run without music while your Lavalink is offline.

### 🌐 Recommended Low-Cost Compatible VPS Providers

| Provider | Starting Price | Key Benefits | Recommended Plan |
| :--- | :--- | :--- | :--- |
| [**Hetzner Cloud**](https://www.hetzner.com/cloud) | ~€3.79 / mo | High performance, fast NVMe, EU/US locations | CX22 (2 vCPU, 4 GB RAM) / CAX11 |
| [**OVHcloud**](https://www.ovhcloud.com/en/vps/) | ~$4.20 / mo | Unmetered bandwidth, strong anti-DDoS protection | Starter / Value VPS |
| [**DigitalOcean**](https://www.digitalocean.com/) | ~$4.00 - $6.00 / mo | 1-Click Docker droplets, low network latency | Basic Droplet (1-2 GB RAM) |
| [**Linode (Akamai)**](https://www.linode.com/) | ~$5.00 / mo | High network reliability, 24/7 support | Nanode 1GB / Shared 2GB |
| [**Vultr**](https://www.vultr.com/) | ~$3.50 - $5.00 / mo | 30+ worldwide datacenters, fast provisioning | Cloud Compute (1-2 GB RAM) |

---

## 🏗️ Project Architecture & Structure

Master-Bot is organized as a unified Turborepo workspace managed with `pnpm`:

```text
Master-Bot/
├── apps/
│   ├── bot/                 # Sapphire & Discord.js v14 Bot Application + Internal Web Server
│   └── dashboard/           # Next.js 15 Web Dashboard (Tailwind CSS, NextAuth, tRPC)
├── packages/
│   ├── auth/                # Shared NextAuth.js (Discord OAuth) Configuration
│   ├── config/              # Shared Tooling Config (eslint/, tailwind/)
│   └── db/                  # Shared Prisma ORM Client (SQLite) & In-Memory Redis (ioredis-mock)
├── wiki/                    # Complete Project Documentation & Deployment Guides
├── packages/db/prisma/       # Prisma schema + db.sqlite (auto-created on install)
├── application.yml.example  # Lavalink v4 Configuration Template (copy to application.yml)
├── Dockerfile               # Containerized single-service deployment
└── docker-compose.yml       # Bot + Lavalink containers for VPS self-hosting
```

> 🔄 **Consolidated Runtime:** Master-Bot runs both the Discord bot gateway and the Next.js web dashboard inside a single Node.js process on port `PORT` (`/dashboard`), with a single console window and zero external Redis dependencies. For full deployment details, follow the [Deployment Wiki](wiki/Deployment.md).

---

## ⚡ Key Features

- **🎵 High-Performance Audio Engine:** Powered by **Lavalink v4** with support for YouTube (multi-client + OAuth), Spotify metadata resolution (`lavasrc-plugin`), free built-in SoundCloud, Twitch, Vimeo, and direct audio streams. Includes interactive channel player embeds with real-time progress bars and audio filters (`/bassboost`, `/karaoke`, `/nightcore`, `/vaporwave`).
- **📚 Custom Playlists:** Per-user, per-server playlists via `/create-playlist`, `/save-to-playlist`, `/my-playlists`, `/display-playlist`, `/delete-playlist`, and `/remove-from-playlist`.
- **🔨 Full Moderation Suite:** Dedicated slash commands (`/ban`, `/kick`, `/slowmode`, `/timeout`, `/purge`) with permission hierarchy validation and safety checks.
- **🎫 Thread-Based Support Ticket System:** Interactive ticket panel, thread management, a configurable manager role, and `.txt` transcript archiving.
- **📜 Granular Audit Logging:** 20 event triggers across members, messages, channels, roles, voice, and moderation — tuned per server via `/set` or the dashboard.
- **🗄️ Zero-Ops Database:** SQLite via Prisma. The schema is generated and pushed automatically on `pnpm install`; no database server to install or manage.
- **🔑 Native YouTube Device-Flow OAuth:** `/youtube-auth` authorizes a streaming account; the refresh token persists to `.youtube-oauth.json` without rewriting `.env`.
- **🌐 Interactive Web Dashboard:** Next.js 15 App Router command center — per-server studios for welcome messages, audit logs, tickets, reminders, per-command toggles, music, broadcasts, integrations, and system telemetry.
- **🎯 Feature Flags:** Individual bot modules (Lavalink audio, GIFs, Twitch, News, IGDB) can be enabled or disabled via environment variables.
- **🚀 Cross-Platform Unified Launchers:** `pnpm dev` and `pnpm start` manage ports, route output to isolated log files (`logs/`), and present a clean console status UI.
- **🖼️ Reaction GIFs & Media:** Powered by Klipy API and Waifu.im (`/gif`, `/hug`, `/waifu`, `/cat`, `/doggo`, and more).
- **🎮 Gaming & Info:** Live Twitch channel alerts, IGDB game search, TVMaze TV show info, and a suite of fun utilities (`/8ball`, `/urban`, `/trump`, `/kanye`, `/translate`, and more).

---

## 📋 System Requirements

- **Node.js**: `24.x` LTS recommended (`>=20.0.0` supported)
- **pnpm**: `>=8.0.0` (`npm install -g pnpm`)
- **Java**: Java 17+ (21 LTS recommended) — required only to self-host a Lavalink server (locally or via Docker/VPS).
- **Database**: None — SQLite file (`db.sqlite`) is created automatically

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/galnir/Master-Bot.git
cd Master-Bot
pnpm install
```

`pnpm install` generates the Prisma client and creates the SQLite database (`db.sqlite`).

### 2. Configure Environment Variables

Create `.env` in the workspace root from `.env.example`:

```bash
cp .env.example .env
```

Fill in your mandatory credentials:

- `DATABASE_URL`: SQLite database file path (`file:./db.sqlite`)
- `INTERNAL_URL`: Internal SSR dashboard URL (`http://localhost:3000`)
- `PUBLIC_URL`: Public HTTPS dashboard URL (`https://your-domain.com`)
- `DISCORD_CALLBACK_URL`: Public OAuth2 bot invite URL
- `DISCORD_TOKEN`: Bot token from the Discord Developer Portal
- `DISCORD_CLIENT_ID` & `DISCORD_CLIENT_SECRET`: Application OAuth2 credentials

Optional audio/feature keys (Spotify, YouTube, Twitch, News, Genius, Klipy) and the `LAVA_*` + feature-flag variables are documented in the [Configuration Wiki](wiki/Configuration.md).

### 3. Run the Stack

```bash
pnpm dev
```

Starts the bot, dashboard, and (when `LAVA_ENABLED=true` and Java is present) a local Lavalink server with a unified status console and `logs/`. For production: `pnpm build && pnpm start`.

---

## 🎵 YouTube OAuth Setup

1. Run `/youtube-auth` in Discord (or the terminal device-flow prompt at first launch).
2. Open the returned URL, log in with the YouTube account you want to stream through, and approve the scopes.
3. The bot stores the refresh token atomically in `.youtube-oauth.json` and keeps a `YOUTUBE_REFRESH_TOKEN` binding for Lavalink.

Authorized playback defeats YouTube throttling/blocking. See [Music & Lavalink](wiki/Music.md#youtube-oauth).

---

## 📖 Available Commands

> Master-Bot ships with **74 slash commands** across Music, Moderation, GIFs, Games, Utilities, News, and Reminders. For the complete, up-to-date list and the `/set` subcommands, see the [Commands Reference](wiki/Commands.md).

| Category | Highlights |
| --- | --- |
| 🎵 **Music** | `/play`, `/queue`, `/shuffle`, `/jump`, `/seek`, `/volume`, `/lyrics`, `/bassboost`, `/music-trivia`, playlists, `/youtube-auth` |
| 🔨 **Moderation** | `/ban`, `/kick`, `/timeout`, `/slowmode`, `/purge` |
| ⚙️ **Utility** | `/set`, `/help`, `/reminder`, `/poll`, `/weather`, `/translate`, `/world-news`, `/8ball`, `/reddit`, `/urban` |
| 🎮 **Games** | `/connect-four`, `/tic-tac-toe`, `/rockpaperscissors`, `/game-search` |
| 😂 **GIFs** | `/gif`, `/hug`, `/waifu`, `/cat`, `/doggo`, `/slap`, and more |
| 🟣 **Twitch** | `/twitch-status` + live stream alerts via `/set twitch` |

---

## 🐳 Docker Deployment

A portable **Dockerfile** (`node:20-slim`, port `3000`) is included. For single-service container deployment and persistence guidance, see [Deployment Wiki](wiki/Deployment.md).

---

## 📚 Documentation & Wiki

Visit the [Wiki](wiki/Home.md) for full documentation:

- 🚀 [Getting Started](wiki/Getting-Started.md)
- ⚙️ [Configuration & API Keys](wiki/Configuration.md)
- 🏗️ [Architecture & Database](wiki/Architecture.md)
- ⌨️ [Commands Reference](wiki/Commands.md)
- 🎵 [Music & Lavalink](wiki/Music.md)
- 🌐 [Web Dashboard](wiki/Dashboard.md)
- 🚀 [Deployment](wiki/Deployment.md)
- ❓ [FAQ & Troubleshooting](wiki/FAQ.md)

---

## 👥 Contributors ❤️

> ⭐ **Bacon Fixation** — countless contributions across the project.

| Contributor | Contributions |
| --- | --- |
| [ModoSN](https://github.com/ModoSN) | `resolve-ip`, `rps`, `8ball`, `bored`, `trump`, `advice`, `kanye`, `urban dictionary` commands and visual updates |
| [PhantomNimbi](https://github.com/PhantomNimbi) | GIF commands, Lavalink v4 engine, Next.js 15 migration, moderation suite, support ticket system, live ASCII progress bar & auto-updater |
| [rafaeldamasceno](https://github.com/rafaeldamasceno) | `music-trivia` and Dockerfile improvements |
| [navidmafi](https://github.com/navidmafi) | `LeaveTimeOut` and `MaxResponseTime` options, update issue template, fix leave command |
| [Kyoyo](https://github.com/NotKyoyo) | brought back `now-playing` |
| [MontejoJorge](https://github.com/MontejoJorge) | brought back `remind` |
| [malokdev](https://github.com/malokdev) | `uptime` command |
| [chimaerra](https://github.com/chimaerra) | minor command tweaks |

---

## 🤝 Contributing

We welcome contributions of all kinds! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started with local setup, coding standards, and pull request workflows.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE.md`](LICENSE.md) for more information.
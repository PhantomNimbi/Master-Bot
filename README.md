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
 
Master-Bot runs as a single Node.js process hosting the **Discord bot** and the **Next.js dashboard** — locally, on a VPS, or via Docker. For persistent SQLite storage, unthrottled networking, and dedicated resources, self-hosting on a low-cost VPS is recommended. Heroku is also supported as an optional cloud hosting choice. See the [Deployment Wiki](../../wiki/Deployment).

| Platform | Notes |
| :--- | :--- |
| **Docker / VPS** | **Recommended.** `Dockerfile` + `docker-compose.yml` run bot + dashboard and Lavalink in separate containers with persistent storage. Full guide in the [Deployment Wiki](../../wiki/Deployment). |
| **Node.js / PM2 VPS** | Run natively on Ubuntu/Debian with PM2 process supervision and Caddy reverse proxy for automatic HTTPS. |
| **Local** | `pnpm install && pnpm build && pnpm start` on any Node.js 20+ machine — see [Quick Start](#-quick-start-guide). |
| **Heroku (Optional Cloud)** | Available for users who specifically prefer cloud hosting. Requires external PostgreSQL (`DB_URI`) due to ephemeral storage, and external Lavalink (`LAVA_EXTERNAL=true`). |

### 🌐 Recommended Low-Cost Compatible VPS Providers

| Provider | Starting Price | Specs / Recommended Plan | Key Benefits |
| :--- | :--- | :--- | :--- |
| [**Hetzner Cloud**](https://www.hetzner.com/cloud) | ~€3.79 / mo | CX22 (2 vCPU, 4 GB RAM) | **Top value:** High NVMe speeds, 20 TB traffic, EU/US |
| [**OVHcloud**](https://www.ovhcloud.com/en/vps/) | ~$4.20 / mo | Starter VPS (1 vCPU, 2 GB RAM) | Unmetered bandwidth, strong anti-DDoS protection |
| [**DigitalOcean**](https://www.digitalocean.com/) | ~$4.00 - $6.00 / mo | Basic Droplet (1-2 GB RAM) | 1-Click Docker droplets, low network latency |
| [**Linode (Akamai)**](https://www.linode.com/) | ~$5.00 / mo | Nanode 1GB / Shared 2GB | High network reliability, 24/7 technical support |
| [**Vultr**](https://www.vultr.com/) | ~$3.50 - $5.00 / mo | Cloud Compute (1-2 GB RAM) | 32+ worldwide datacenters, fast provisioning |
| [**Contabo**](https://contabo.com/) | ~$5.50 / mo | Cloud VPS S (4 vCPU, 8 GB RAM) | Maximum RAM per dollar; hosts bot + dashboard + audio all-in-one |

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

> 🔄 **Consolidated Runtime:** Master-Bot runs both the Discord bot gateway and the Next.js web dashboard inside a single Node.js process on port `PORT` (`/dashboard`), with a single console window and zero external Redis dependencies. For full deployment details, follow the [Deployment Wiki](../../wiki/Deployment).

---

## ⚡ Key Features

- **🎵 High-Performance Audio Engine:** Powered by **Lavalink v4** with support for YouTube (multi-client + OAuth), Spotify metadata resolution (`lavasrc-plugin`), free built-in SoundCloud, Twitch, Vimeo, and direct audio streams. Includes interactive channel player embeds with real-time progress bars and audio filters (`/bassboost`, `/karaoke`, `/nightcore`, `/vaporwave`).
- **📚 Custom Playlists:** Per-user, per-server playlists via `/create-playlist`, `/save-to-playlist`, `/my-playlists`, `/display-playlist`, `/delete-playlist`, and `/remove-from-playlist`.
- **🔨 Full Moderation Suite:** Dedicated slash commands (`/ban`, `/kick`, `/slowmode`, `/timeout`, `/purge`) with permission hierarchy validation and safety checks.
- **🎫 Thread-Based Support Ticket System:** Interactive ticket panel, thread management, a configurable manager role, and `.txt` transcript archiving.
- **📜 Granular Audit Logging:** 20 event triggers across members, messages, channels, roles, voice, and moderation — tuned per server via `/set` or the dashboard.
- **🗄️ Zero-Ops Database:** SQLite via Prisma. The schema is generated and pushed automatically on `pnpm install`; no database server to install or manage.
- **🎵 Embedded Lavalink Audio Architecture:** Powered by `@helix-origin/lavalink-server`, Lavalink v4 runs in-process and handles YouTube OAuth refresh token authorization directly during startup before launching the audio engine.
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

- `DB_URI`: SQLite database file path (`file:/data/database.db`) or PostgreSQL URI (`postgresql://...`)
- `INTERNAL_URL`: Internal dashboard host/port format (`0.0.0.0:3000`)
- `PUBLIC_URL`: Public HTTPS dashboard URL (`https://your-domain.com`)
- `DISCORD_CALLBACK_URL`: Public OAuth2 bot invite URL
- `DISCORD_TOKEN`: Bot token from the Discord Developer Portal
- `DISCORD_CLIENT_ID` & `DISCORD_CLIENT_SECRET`: Application OAuth2 credentials

Optional audio/feature keys (Spotify, YouTube, Twitch, News, Genius, Klipy) and the `LAVA_*` + feature-flag variables are documented in the [Configuration Wiki](../../wiki/Configuration).

### 3. Run the Stack

```bash
pnpm dev
```

Starts the bot, dashboard, and (when `LAVA_ENABLED=true` and Java is present) a local Lavalink server with a unified status console and `logs/`. For production: `pnpm build && pnpm start`.

---

## 🎵 YouTube OAuth & Audio Streaming

1. At startup, the embedded Lavalink audio server checks for an existing `YOUTUBE_REFRESH_TOKEN` (or `.youtube-oauth.json`).
2. If OAuth is configured (`YOUTUBE_CLIENT_ID`) and no refresh token exists, the embedded server awaits device authorization on the console before starting playback services.
3. Once authorized, the refresh token is persisted for uninterrupted streaming and protection against YouTube rate limits.

Authorized playback defeats YouTube throttling/blocking. See [Music & Lavalink](../../wiki/Music.md#youtube-oauth).

---

## 📖 Available Commands

> Master-Bot ships with **73 slash commands** across Music, Moderation, GIFs, Games, Utilities, News, and Reminders. For the complete, up-to-date list and the `/set` subcommands, see the [Commands Reference](../../wiki/Commands).

| Category | Highlights |
| --- | --- |
| 🎵 **Music** | `/play`, `/queue`, `/shuffle`, `/jump`, `/seek`, `/volume`, `/lyrics`, `/bassboost`, `/music-trivia`, playlists |
| 🔨 **Moderation** | `/ban`, `/kick`, `/timeout`, `/slowmode`, `/purge` |
| ⚙️ **Utility** | `/set`, `/help`, `/reminder`, `/poll`, `/weather`, `/translate`, `/world-news`, `/8ball`, `/reddit`, `/urban` |
| 🎮 **Games** | `/connect-four`, `/tic-tac-toe`, `/rockpaperscissors`, `/game-search` |
| 😂 **GIFs** | `/gif`, `/hug`, `/waifu`, `/cat`, `/doggo`, `/slap`, and more |
| 🟣 **Twitch** | `/twitch-status` + live stream alerts via `/set twitch` |

---

## 🐳 Docker Deployment

A portable **Dockerfile** (`node:20-slim`, port `3000`) is included. For single-service container deployment and persistence guidance, see [Deployment Wiki](../../wiki/Deployment).

---

## 📚 Documentation & Wiki

Visit the [Wiki](../../wiki/Home) for full documentation:

- 🚀 [Getting Started](../../wiki/Getting-Started)
- ⚙️ [Configuration & API Keys](../../wiki/Configuration)
- 🏗️ [Architecture & Database](../../wiki/Architecture)
- ⌨️ [Commands Reference](../../wiki/Commands)
- 🎵 [Music & Lavalink](../../wiki/Music)
- 🌐 [Web Dashboard](../../wiki/Dashboard)
- 🚀 [Deployment](../../wiki/Deployment)
- ❓ [FAQ & Troubleshooting](../../wiki/FAQ)

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

We welcome contributions of all kinds! Please read our [Contributing Guidelines](CONTRIBUTING) to get started with local setup, coding standards, and pull request workflows.

---

## ⚖️ Legal, Privacy & Security

In accordance with Discord Developer Policies and open-source verification standards:
- 🛡️ [**Privacy Policy**](PRIVACY.md) — Details on data collection, local SQLite/PostgreSQL storage, user rights, and automatic deletion on guild leave.
- 📜 [**Terms of Service**](TOS.md) — Permitted usage, community guidelines compliance, disclaimers, and service terms.
- 🔒 [**Security Policy**](SECURITY.md) — Vulnerability disclosure process, supported versions, and operational security guidelines.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE.md`](LICENSE.md) for more information.
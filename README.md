# 🤖 Master-Bot

[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/Package_Manager-pnpm-orange.svg)](https://pnpm.io/)
[![Lavalink](https://img.shields.io/badge/Lavalink-v4.x-purple.svg)](https://github.com/lavalink-devs/Lavalink)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/galnir/Master-Bot/pulls)

**Master-Bot** is a production-ready, high-performance Discord Music and Utility Bot with a full-featured **Next.js Web Dashboard**. Built with **TypeScript**, **Sapphire Framework**, **discord.js v14**, **Next.js 15**, **tRPC v11**, **Prisma ORM** (SQLite), **ioredis-mock** (zero external Redis binaries needed), and **Lavalink v4**.

---

## 🚀 One-Click Cloud Deployment (100% Free Tiers)

Deploy Master-Bot instantly to your preferred cloud hosting platform with zero server setup. Powered by an in-memory `ioredis-mock` cache and zero-ops SQLite persistence, you don't need any external database or Redis instances.

| Platform | Free Tier | Deploy Button |
| :--- | :---: | :--- |
| **Render** | ✅ 100% Free | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/galnir/Master-Bot) |
| **Railway** | ✅ Free Starter | [![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template?template=https%3A%2F%2Fgithub.com%2Fgalnir%2FMaster-Bot) |
| **Heroku** | ✅ Eco Dyno | [![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/galnir/Master-Bot) |
| **Fly.io** | ✅ Free Tier | [![Deploy to Fly.io](https://img.shields.io/badge/Deploy%20to-Fly.io-24185b?style=for-the-badge&logo=flydotio&logoColor=white)](wiki/Deployment.md#3--flyio-flyio) |

> 💡 **Audio Engine Notice:** One-click cloud free tiers do not run an internal Lavalink audio engine due to memory constraints. To enable music commands on cloud platforms, deploy an external Lavalink server using the one-click buttons below or connect to an existing instance. See the [Deployment Wiki](wiki/Deployment.md) for instructions.
>
> ⚠️ **Render Custom Domain Notice:** Render's default `*.onrender.com` URLs get falsely flagged by browser protections and Discord filters. Attach a free custom domain (e.g., from [ifreedomains.com](https://ifreedomains.com)) in Render's dashboard. See the [Render Setup Guide](wiki/Deployment.md#1--render-rendercom).

### 🔊 One-Click External Lavalink Server Deployment

Deploy the standalone [**HELIX-Origin Lavalink v4 Server**](https://github.com/HELIX-Origin/Lavalink-Server) (pre-configured with YouTube, remote cipher, and Spotify plugins) to free cloud hosting with one click:

| Platform | Free Tier | Lavalink Deploy Button |
| :--- | :---: | :--- |
| **Render** | ✅ 100% Free | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/HELIX-Origin/Lavalink-Server) |
| **Railway** | ✅ Free Starter | [![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template?template=https%3A%2F%2Fgithub.com%2FHELIX-Origin%2FLavalink-Server) |
| **Heroku** | ✅ Eco Dyno | [![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/HELIX-Origin/Lavalink-Server) |
| **Fly.io** | ✅ Free MicroVM | [![Deploy to Fly.io](https://img.shields.io/badge/Deploy%20to-Fly.io-24185b?style=for-the-badge&logo=flydotio&logoColor=white)](https://github.com/HELIX-Origin/Lavalink-Server#flyio-deployment) |

Once deployed, simply copy your server domain into Master-Bot's `LAVA_HOST` environment variable with `LAVA_EXTERNAL=true`.

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
├── render.yaml              # Render 1-Click Free Tier Blueprint
├── railway.json             # Railway 1-Click Deployment Specification
├── app.json                 # Heroku 1-Click Deployment Manifest
├── Procfile                 # Process manifest for Heroku and cloud managers
├── fly.toml                 # Fly.io Free-Tier MicroVM Configuration
└── Dockerfile               # Containerized single-service deployment
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

- **Node.js**: `>=20.0.0`
- **pnpm**: `>=8.0.0` (`npm install -g pnpm`)
- **Java**: Java 17+ (21 LTS recommended) — only required for a **local Lavalink** server. If using an external server like [**HELIX-Origin/Lavalink-Server**](https://github.com/HELIX-Origin/Lavalink-Server), Java is not required on your machine.
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

A portable**Dockerfile** (`node:20-slim`, port `3000`) is included. For single-service container deployment, a cloud walkthrough, and persistence guidance, see [Deployment Wiki](wiki/Deployment.md).

---

## 📚 Documentation & Wiki

Visit the [Wiki](wiki/Home.md) for full documentation:

- 🚀 [Getting Started](wiki/Getting-Started.md)
- ⚙️ [Configuration & API Keys](wiki/Configuration.md)
- 🏗️ [Architecture & Database](wiki/Architecture.md)
- ⌨️ [Commands Reference](wiki/Commands.md)
- 🎵 [Music & Lavalink](wiki/Music.md)
- 🌐 [Web Dashboard](wiki/Dashboard.md)
- 🚀 [Deployment & Cloud Hosting](wiki/Deployment.md)
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
# 🤖 Master-Bot

[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/Package_Manager-pnpm-orange)](https://pnpm.io/)
[![Lavalink](https://img.shields.io/badge/Lavalink-v4.x-purple)](https://github.com/lavalink-devs/Lavalink)

**Master-Bot** is a production-ready, high-performance Discord Music and Utility Bot monorepo featuring a full-featured **Next.js Web Dashboard**. Built with **TypeScript**, **Sapphire Framework**, **discord.js v14**, **Next.js 15**, **tRPC v11**, **Prisma ORM**, **Redis**, and **Lavalink v4**.

---

## 🏗️ Architecture & Monorepo Structure

Master-Bot is organized as a Turbo monorepo managed with `pnpm` workspaces:

```text
Master-Bot/
├── apps/
│   ├── bot/           # Sapphire & Discord.js v14 Bot Application
│   └── dashboard/     # Next.js 15 Web Dashboard (Tailwind CSS, NextAuth, tRPC)
├── packages/
│   ├── api/           # Shared tRPC v11 Routers & API Procedures
│   ├── auth/          # Shared NextAuth.js Configuration
│   ├── config/        # Shared Tooling Config (eslint/, tailwind/)
│   └── db/            # Shared Prisma ORM Client & Database Schemas
├── scripts/
│   ├── common.mjs     # Shared cross-platform port management & log writers
│   ├── dev.mjs        # Unified Development Launcher & Service Manager
│   └── start.mjs      # Unified Production Launcher & Service Manager
├── wiki/              # Project documentation (Setup, Lavalink, API keys, Commands)
├── logs/              # Service-specific log files (bot.log, dashboard.log, lavalink.log)
├── application.yml    # Lavalink v4 Audio Engine Configuration
├── docker-compose.yml # Containerized deployment (Bot, Dashboard, PostgreSQL, Redis, Lavalink)
└── Lavalink.jar       # Lavalink v4 Server Executable
```

---

## ⚡ Key Features

- **🎵 High-Performance Audio Engine:** Powered by **Lavalink v4** with support for YouTube (multi-client failover), Spotify metadata resolution (`lavasrc-plugin`), free built-in SoundCloud, Twitch, Vimeo, and direct audio streams. Includes audio filters (`/bassboost`, `/karaoke`, `/nightcore`, `/vaporwave`).
- **📚 Custom Playlists:** Per-user saved playlists via `/create-playlist`, `/save-to-playlist`, `/my-playlists`, `/display-playlist`, and `/delete-playlist`.
- **🔨 Full Moderation Suite:** Dedicated slash commands (`/ban`, `/kick`, `/slowmode`, `/timeout`, `/purge`) with permission hierarchy validation and safety checks.
- **🎫 Thread-Based Support Ticket System:** Interactive ticket panel with auto-posting buttons (`ticket_create`, `ticket_close`), thread management, dynamic greeting templates (`{user}`, `{username}`, `{server}`), and secure `.txt` transcript archiving.
- **📜 Granular Event & Audit Logging:** Multi-category logging system supporting 18 event triggers with customizable channel targets, managed via `/set` or the web dashboard.
- **🗄️ Automatic Database Migrations:** `pnpm dev` and `pnpm start` automatically execute `prisma db push` on launch before the bot process starts.
- **🔑 Native YouTube Device Flow OAuth:**
  - Automated device-code prompt displayed directly in the terminal console, plus the `/youtube-auth` slash command (Owner only).
  - Tokens persist atomically to `.youtube-oauth.json` (via write-to-temp + atomic rename), so no re-authentication is needed after restart.
  - Native Spring environment variable binding (`refreshToken: "${YOUTUBE_REFRESH_TOKEN}"` in `application.yml`) prevents `.env` disk corruption.
- **🌐 Interactive Web Dashboard:** Modern **Next.js 15** App Router dashboard with Discord OAuth login, server settings, custom welcome & ticket message editors with live previews, audit log controls, command panel, and an owner log viewer.
- **🎯 Feature Flags:** Individual bot modules (Lavalink audio, GIFs, Twitch, News, IGDB) can be enabled or disabled dynamically via environment variables.
- **🚀 Cross-Platform Unified Launchers:** `pnpm dev` and `pnpm start` automatically manage ports, clear lingering processes, route output to isolated log files (`logs/`), and present a clean console status UI.
- **🖼️ Reaction GIFs & Media:** Powered by Klipy API and Waifu.im (`/gif`, `/hug`, `/waifu`, `/cat`, `/doggo`, and more).
- **🎮 Gaming & Info:** Live Twitch channel alerts, IGDB game search, TVMaze TV show info, and a suite of fun utilities (`/8ball`, `/urban`, `/trump`, `/kanye`, `/translate`, and more).

---

## 📋 System Requirements

- **Node.js**: `>=20.0.0`
- **pnpm**: `>=8.0.0` (`npm install -g pnpm`)
- **Java**: Java 17+ required · Java 21 LTS recommended (Required for Lavalink v4)
- **PostgreSQL**: PostgreSQL database server
- **Redis**: Redis server for queue state and caching

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/galnir/Master-Bot.git
cd Master-Bot
pnpm install
```

### 2. Configure Environment Variables

Create `.env` in the root workspace directory from `.env.example`:

```bash
cp .env.example .env
```

Fill in your mandatory Discord and database credentials:
- `DISCORD_TOKEN`: Bot token from Discord Developer Portal
- `DISCORD_CLIENT_ID` & `DISCORD_CLIENT_SECRET`: Application OAuth2 credentials
- `DATABASE_URL` & `SHADOW_DB_URL`: PostgreSQL connection strings
- `REDIS_HOST` & `REDIS_PORT`: Redis cache connection details
- `LAVA_ENABLED`: Set to `true` to enable Lavalink audio playback (defaults to `false`)

### 3. Run Development Stack

```bash
pnpm dev
```

The unified launcher will automatically synchronize your Prisma schema (`prisma db push`), clear lingering ports, and start all services concurrently.

---

## 🎵 YouTube OAuth Setup

When launching for the first time without a YouTube refresh token:
1. Lavalink's `youtube-plugin` triggers the OAuth device flow.
2. The launcher displays a prompt in the terminal console containing the link (`https://www.google.com/device`) and user code (`XXXX-XXXX`).
3. Visit the link in your browser and authorize the device code.
4. The launcher automatically captures the issued token, saves it atomically to `.youtube-oauth.json`, and updates `process.env.YOUTUBE_REFRESH_TOKEN`.
5. Lavalink binds the token natively via `${YOUTUBE_REFRESH_TOKEN}` in `application.yml` and Java system properties without modifying `.env` on disk.

You can also re-trigger authorization any time with the `/youtube-auth` command (Owner only).

---

## 📖 Available Commands

> For the complete, up-to-date list of all 66 slash commands and the `/set` subcommands, see the [Commands Reference](wiki/Commands-Reference.md).

### 🎵 Music Commands
| Command | Description | Usage |
|---|---|---|
| `/play` | Play a song or playlist from YouTube, Spotify, etc. | `/play query: darude sandstorm` |
| `/pause` / `/resume` | Pause or resume audio playback | `/pause` |
| `/skip` / `/skipto` | Skip the current track or jump to a queue position | `/skipto position: 3` |
| `/queue` | Display current track queue | `/queue` |
| `/shuffle` | Shuffle the current queue | `/shuffle` |
| `/lyrics` | Fetch song lyrics | `/lyrics title: Bohemian Rhapsody` |
| `/bassboost` / `/nightcore` / `/karaoke` / `/vaporwave` | Toggle audio playback filters | `/bassboost` |
| `/create-playlist` | Create a custom user playlist | `/create-playlist playlist-name: Favorites` |
| `/save-to-playlist` | Save a track or URL to a custom playlist | `/save-to-playlist playlist-name: Favorites url: <url>` |
| `/my-playlists` | View your saved playlists | `/my-playlists` |
| `/music-trivia` / `/stop-trivia` | Start or stop an interactive voice channel music trivia game | `/music-trivia rounds: 5 category: 90s` |
| `/help` | Interactive command directory & detailed help | `/help` |

### 🔨 Moderation Commands
| Command | Description | Usage |
|---|---|---|
| `/ban` | Ban a member with optional reason and message purge | `/ban user: @User reason: Spam delete-messages: 24h` |
| `/kick` | Kick a member from the server | `/kick user: @User reason: Rule violation` |
| `/timeout` | Timeout (mute) a member or remove timeout | `/timeout user: @User duration: 5m reason: Spam` |
| `/slowmode` | Set text channel rate limit (0 to disable) | `/slowmode seconds: 10 channel: #general` |
| `/purge` | Bulk delete recent messages (optional user filter) | `/purge amount: 25 user: @User` |

### ⚙️ Utility & Owner Commands
| Command | Description | Usage |
|---|---|---|
| `/help` | Category browser and command details | `/help` |
| `/set` | Configure server settings (Welcome, Logging, Tickets, Twitch, Volume) | `/set <subcommand>` |
| `/youtube-auth` | Re-trigger YouTube OAuth Device Flow (Owner Only) | `/youtube-auth` |
| `/avatar` | Display a user's Discord avatar | `/avatar user: @User` |
| `/reddit` | Fetch posts from a subreddit | `/reddit subreddit: memes` |
| `/game-search` | Search video game info via IGDB | `/game-search game: Metroid` |
| `/tv-show-search` | Search TV show details via TVMaze | `/tv-show-search query: Office` |
| `/twitch-status` | Check live status of a Twitch streamer | `/twitch-status streamer: shroud` |

---

## 🐳 Docker Deployment

To run the complete stack (Bot, Dashboard, PostgreSQL, Redis, Lavalink v4) in containerized mode:

```bash
docker compose --env-file docker.env up -d --build
```

---

## 📚 Documentation & Wiki

For detailed architecture guides, deployment steps, and API credential instructions, visit the project [Wiki](wiki/Home.md):
- 📘 [Setup & Deployment Guide](wiki/Setup-and-Deployment.md)
- 🎵 [Lavalink v4 Setup Guide](wiki/Lavalink.md)
- 🔑 [API Keys & Configuration](wiki/API-Keys.md)
- 📜 [Complete Commands Reference](wiki/Commands-Reference.md)

---

## 👥 Contributors ❤️

**⭐ [Bacon Fixation](https://github.com/Bacon-Fixation) ⭐ - Countless contributions**

- [ModoSN](https://github.com/ModoSN) - 'resolve-ip', 'rps', '8ball', 'bored', 'trump', 'advice', 'kanye', 'urban dictionary' commands and visual updates
- [PhantomNimbi](https://github.com/PhantomNimbi) - gif commands, Lavalink config tweaks, Next.js 15 migration, moderation suite, and support ticket system
- [rafaeldamasceno](https://github.com/rafaeldamasceno) - 'music-trivia' and Dockerfile improvements, minor tweaks
- [navidmafi](https://github.com/navidmafi) - 'LeaveTimeOut' and 'MaxResponseTime' options, update issue template, fix leave command
- [Kyoyo](https://github.com/NotKyoyo) - added back 'now-playing'
- [MontejoJorge](https://github.com/MontejoJorge) - added back 'remind'
- [malokdev](https://github.com/malokdev) - 'uptime' command
- [chimaerra](https://github.com/chimaerra) - minor command tweaks

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

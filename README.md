# 🤖 Master-Bot

[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/Package_Manager-pnpm-orange)](https://pnpm.io/)
[![Lavalink](https://img.shields.io/badge/Lavalink-v4.x-purple)](https://github.com/lavalink-devs/Lavalink)
[![Deploy to Heroku](https://img.shields.io/badge/Deploy%20to-Heroku-430098?logo=heroku&logoColor=white)](https://heroku.com/deploy?template=https://github.com/PhantomNimbi/Master-Bot)

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
│   ├── db/            # Shared Prisma ORM Client & Database Schemas
│   ├── eslint-config/ # Workspace ESLint Rules
│   └── tailwind-config/# Workspace Tailwind CSS Configuration
├── scripts/
│   ├── common.mjs     # Shared cross-platform port management & log writers
│   ├── dev.mjs        # Unified Development Launcher & Service Manager
│   └── start.mjs      # Unified Production Launcher & Service Manager
├── logs/              # Service-specific log files (bot.log, dashboard.log, lavalink.log)
├── application.yml    # Lavalink v4 Audio Engine Configuration
└── Lavalink.jar       # Lavalink v4 Server Executable
```

---

## ⚡ Key Features

- **🎵 High-Performance Audio Engine:** Powered by **Lavalink v4** with support for YouTube, Spotify metadata resolution (`lavasrc-plugin`), SoundCloud fallback, Vimeo, Twitch, and direct audio streams.
- **🔨 Full Moderation Suite:** Dedicated slash commands (`/ban`, `/kick`, `/slowmode`, `/timeout`, `/purge`) with permission hierarchy validation and safety checks.
- **🎫 Thread-Based Support Ticket System:** Interactive ticket panel with auto-posting buttons (`ticket_create`, `ticket_close`), thread management, dynamic greeting templates (`{user}`, `{username}`, `{server}`), and secure transcript archiving.
- **📜 Granular Event & Audit Logging:** Multi-category logging system supporting 18 event triggers with customizable channel targets.
- **🗄️ Automatic Database Migrations:** `pnpm dev` and `pnpm start` automatically execute `prisma db push` on launch before the bot process starts.
- **🔑 Native YouTube Device Flow OAuth & In-Memory Protection:**
  - Automated detection and formatted device code prompt displayed directly in the terminal console.
  - Runtime token capture updates `process.env.YOUTUBE_REFRESH_TOKEN` strictly in process memory.
  - Native Spring environment variable binding (`refreshToken: "${YOUTUBE_REFRESH_TOKEN}"` in `application.yml`) prevents file mutation and `.env` disk corruption.
- **🌐 Interactive Web Dashboard:** Modern **Next.js 15** App Router dashboard with Discord OAuth login, server settings, custom welcome & ticket message editors with live previews, and audit log controls.
- **🚀 Cross-Platform Unified Launchers:** `pnpm dev` and `pnpm start` automatically manage ports (`3000`, `6379`, `2333`), clear lingering processes, route output to isolated log files (`logs/`), and present a clean console status UI.
- **🖼️ Reaction GIFs & Media:** Powered by Klipy API and Waifu.im.
- **🎮 Gaming & Info:** Live Twitch channel alerts, IGDB game search, and TVMaze TV show info.

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
git clone https://github.com/PhantomNimbi/Master-Bot.git
cd Master-Bot
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` in the root folder:

```bash
cp .env.example .env
```

Ensure key environment variables are configured:

```env
# Database & Redis
DATABASE_URL="postgresql://user:password@localhost:5432/masterbot?schema=public"
REDIS_HOST="localhost"
REDIS_PORT=6379

# Discord Application Credentials
DISCORD_TOKEN="YOUR_BOT_TOKEN"
DISCORD_CLIENT_ID="YOUR_CLIENT_ID"
DISCORD_CLIENT_SECRET="YOUR_CLIENT_SECRET"

# Dashboard & NextAuth
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Lavalink Server Settings
LAVA_HOST="localhost"
LAVA_PORT=2333
LAVA_PASS="youshallnotpass"
```

### 3. Download Lavalink v4 Server

Download the latest `Lavalink.jar` release from [lavalink-devs/Lavalink Releases](https://github.com/lavalink-devs/Lavalink/releases) and place it in the project root directory alongside `application.yml`.

### 4. Launch Development Services

Run the unified launcher:

```bash
pnpm dev
```

The launcher will automatically execute `prisma db push` to synchronize the database schema before launching all services simultaneously:
- 🗄️ **Database Sync:** Applied automatically on launch
- 🤖 **Bot Service:** Logs written to `logs/bot.log`
- 🌐 **Web Dashboard:** Running at [http://localhost:3000](http://localhost:3000) (Logs: `logs/dashboard.log`)
- 🎵 **Lavalink Audio Server:** Running at `localhost:2333` (Logs: `logs/lavalink.log`)
- 📄 **Combined System Log:** Written to `logs/combined.log`

---

## 🔑 YouTube OAuth Device Flow

When launching for the first time without a YouTube refresh token:
1. Lavalink's `youtube-plugin` triggers the OAuth device flow.
2. The launcher displays a prompt in the terminal console containing the link (`https://www.google.com/device`) and user code (`XXXX-XXXX`).
3. Visit the link in your browser and authorize the device code.
4. The launcher automatically captures the issued token, saves it atomically to `.youtube-oauth.json`, and updates `process.env.YOUTUBE_REFRESH_TOKEN`.
5. Lavalink binds the token natively via `${YOUTUBE_REFRESH_TOKEN}` in `application.yml` and Java system properties without modifying `.env` on disk.

---

## 📖 Available Commands

### 🎵 Music Commands
| Command | Description | Usage |
|---|---|---|
| `/play` | Play a song or playlist from YouTube, Spotify, etc. | `/play query: darude sandstorm` |
| `/pause` / `/resume` | Pause or resume audio playback | `/pause` |
| `/skip` | Skip the current track | `/skip` |
| `/skipto` | Skip directly to a specific track number in the queue | `/skipto position: 3` |
| `/queue` | Display current track queue | `/queue` |
| `/nowplaying` | Show playback progress and track details | `/nowplaying` |
| `/volume` | Adjust playback volume (1-100) | `/volume level: 80` |
| `/lyrics` | Fetch song lyrics | `/lyrics song: Bohemian Rhapsody` |
| `/music-trivia` | Start an interactive voice channel music trivia game | `/music-trivia rounds: 5 category: 90s` |
| `/stop-trivia` | Stop an ongoing music trivia game | `/stop-trivia` |
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
| `/set` | Configure server settings (Welcome, Twitch, Logging, Tickets, Volume) | `/set <subcommand>` |
| `/youtube-auth` | Re-trigger YouTube OAuth Device Flow (Owner Only) | `/youtube-auth` |
| `/avatar` | Display a user's Discord avatar | `/avatar user: @User` |
| `/reddit` | Fetch posts from a subreddit | `/reddit subreddit: memes` |
| `/game-search` | Search video game info via IGDB | `/game-search title: Metroid` |
| `/tv-show-search` | Search TV show details via TVMaze | `/tv-show-search query: Office` |
| `/twitch-status` | Check live status of a Twitch streamer | `/twitch-status channel: shroud` |

---

## 🚀 1-Click Heroku Deployment

Deploy a complete instance of Master-Bot (Discord Bot, Next.js 15 Dashboard, Lavalink v4 Audio Engine, PostgreSQL, and Redis) directly to Heroku with one click:

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/PhantomNimbi/Master-Bot)

### How It Works:
1. Click the **Deploy to Heroku** button above.
2. Enter your Discord Bot credentials (`DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`).
3. Heroku automatically provisions:
   - **Heroku Postgres** database addon (auto-populates `DATABASE_URL`).
   - **Heroku Redis** cache addon (auto-populates `REDIS_URL`).
   - **NextAuth Secret** generation (`NEXTAUTH_SECRET`).
   - **Postdeploy Migration**: Automatically executes `pnpm db:push` to apply all database tables on initial setup.
4. Click **Deploy App** — your bot and web dashboard will be live in minutes!

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

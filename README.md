# 🤖 Master-Bot

[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/Package_Manager-pnpm-orange)](https://pnpm.io/)
[![Lavalink](https://img.shields.io/badge/Lavalink-v4.x-purple)](https://github.com/lavalink-devs/Lavalink)

**Master-Bot** is a production-ready, high-performance Discord Music and Utility Bot monorepo featuring a full-featured **Next.js Web Dashboard**. Built with **TypeScript**, **Sapphire Framework**, **discord.js v14**, **Next.js 14**, **tRPC v11**, **Prisma ORM**, **Redis**, and **Lavalink v4**.

---

## 🏗️ Architecture & Monorepo Structure

Master-Bot is organized as a Turbo monorepo managed with `pnpm` workspaces:

```text
Master-Bot/
├── apps/
│   ├── bot/           # Sapphire & Discord.js v14 Bot Application
│   └── dashboard/     # Next.js 14 Web Dashboard (Tailwind CSS, NextAuth, tRPC)
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

- **🎵 High-Performance Audio Engine:** Powered by **Lavalink v4** with support for YouTube, Spotify metadata resolution (`lavasrc-plugin`), Vimeo, Twitch, and direct audio streams.
- **🔑 Native YouTube Device Flow OAuth:**
  - Automated detection and prompt display directly in the unified terminal console.
  - Automatic owner Direct Message prompt on bot startup if unauthenticated.
  - `/youtube-auth` slash command for bot application owners.
  - Automatic interception and persistence of `YOUTUBE_REFRESH_TOKEN` into `.env`.
- **🌐 Interactive Web Dashboard:** Next.js 14 dashboard with Discord OAuth login, live command logs, server settings, and real-time audio statistics.
- **🚀 Cross-Platform Unified Launchers:** `pnpm dev` and `pnpm start` automatically manage ports (`3000`, `6379`, `2333`), clear lingering processes, route output to isolated log files, and present a clean unified console UI.
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

Ensure the following key variables are configured:

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

### 3. Initialize Database Schema

```bash
pnpm db:push
```

### 4. Download Lavalink v4 Server

Download the latest `Lavalink.jar` release from [lavalink-devs/Lavalink Releases](https://github.com/lavalink-devs/Lavalink/releases) and place it in the project root directory alongside `application.yml`.

### 5. Launch Development Services

Run the unified launcher:

```bash
pnpm dev
```

The unified console will start all services simultaneously:
- 🤖 **Bot Service:** Logs written to `logs/bot.log`
- 🌐 **Web Dashboard:** Running at [http://localhost:3000](http://localhost:3000) (Logs: `logs/dashboard.log`)
- 🎵 **Lavalink Audio Server:** Running at `localhost:2333` (Logs: `logs/lavalink.log`)
- 📄 **Combined System Log:** Written to `logs/combined.log`

---

## 🔑 YouTube OAuth Setup

When launching for the first time without a refresh token:
1. The bot will send a **Direct Message** to the bot owner (and print a prominent banner in the terminal console) with a verification URL (`https://www.google.com/device`) and code (`XXXX-XXXX`).
2. Visit the URL, enter the code, and grant approval in your browser.
3. The launcher automatically intercepts the issued token and saves `YOUTUBE_REFRESH_TOKEN` into your `.env` file.
4. Future runs will reuse this saved token automatically.
5. You can also re-trigger authorization at any time using the owner-only `/youtube-auth` slash command in Discord.

---

## 📖 Available Commands

### 🎵 Music Commands
| Command | Description | Usage |
|---|---|---|
| `/play` | Play a song or playlist from YouTube, Spotify, etc. | `/play query: darude sandstorm` |
| `/pause` / `/resume` | Pause or resume audio playback | `/pause` |
| `/skip` | Skip the current track | `/skip` |
| `/queue` | Display current track queue | `/queue` |
| `/nowplaying` | Show playback progress and track details | `/nowplaying` |
| `/volume` | Adjust playback volume (1-100) | `/volume level: 80` |
| `/lyrics` | Fetch song lyrics | `/lyrics song: Bohemian Rhapsody` |
| `/help` | Interactive command directory & detailed help | `/help` |

### ⚙️ Utility & Owner Commands
| Command | Description | Usage |
|---|---|---|
| `/help` | Category browser and command details | `/help` |
| `/youtube-auth` | Re-trigger YouTube OAuth Device Flow (Owner Only) | `/youtube-auth` |
| `/avatar` | Display a user's Discord avatar | `/avatar user: @User` |
| `/reddit` | Fetch posts from a subreddit | `/reddit subreddit: memes` |
| `/game-search` | Search video game info via IGDB | `/game-search title: Metroid` |
| `/tv-show-search` | Search TV show details via TVMaze | `/tv-show-search query: Office` |
| `/twitch-status` | Check live status of a Twitch streamer | `/twitch-status channel: shroud` |

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

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

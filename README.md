# Master-Bot

A Discord Music and Utility Bot written in TypeScript using Sapphire, discord.js, Next.js, and React.

[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/Package_Manager-pnpm-orange.svg)](https://pnpm.io/)
[![Lavalink](https://img.shields.io/badge/Lavalink-v4.x-purple.svg)](https://github.com/lavalink-devs/Lavalink)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

---

## System Dependencies

- [Node.js](https://nodejs.org/) LTS (`>= 20.0.0`)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Java 17+](https://adoptium.net/) (required to run the Lavalink audio server)

---

## Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/galnir/Master-Bot.git
   cd Master-Bot
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Install dependencies:**
   ```bash
   pnpm install
   ```
   *(Generates the Prisma client and initializes the SQLite database automatically.)*

4. **Run the bot and dashboard:**
   ```bash
   pnpm dev
   ```
   For production:
   ```bash
   pnpm build && pnpm start
   ```

---

## Settings (`.env`)

Create a `.env` file in the root directory by copying `.env.example`.

```env
# Database (URI string: SQLite stored at /data/db.sqlite, or external PostgreSQL)
DB_URI="file:/data/db.sqlite"

# Dashboard URLs
# INTERNAL_URL binds to 0.0.0.0:3000 to listen on all interfaces, allowing public connections
INTERNAL_URL="0.0.0.0:3000"
PUBLIC_URL="https://your-domain.com"
DISCORD_CALLBACK_URL="https://discord.com/api/oauth2/authorize?client_id=your_client_id&permissions=8&scope=bot"

# Discord Bot & OAuth Credentials
DISCORD_TOKEN=""
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""

# Lavalink Audio Engine
LAVA_HOST="localhost"
LAVA_PASS="youshallnotpass"
LAVA_PORT=2333
LAVA_SECURE=false
LAVA_EXTERNAL=false

# Optional Integrations (YouTube, Spotify, Twitch, News, Genius, Klipy)
YOUTUBE_CLIENT_ID=""
YOUTUBE_CLIENT_SECRET=""
YOUTUBE_REFRESH_TOKEN=""
SPOTIFY_CLIENT_ID=""
SPOTIFY_CLIENT_SECRET=""
TWITCH_CLIENT_ID=""
TWITCH_CLIENT_SECRET=""
```

> 📖 **Full Configuration Guide:** Detailed documentation for all optional APIs, Lavalink nodes, and feature toggles is in the [Configuration Wiki](../../wiki/Configuration).

---

## Commands

Master-Bot features slash commands across Music, Moderation, Utility, Entertainment, and Notifications.

| Category | Highlights | Example |
| :--- | :--- | :--- |
| 🎵 **Music** | `/play`, `/queue`, `/shuffle`, `/pause`, `/resume`, `/skip`, `/volume`, `/lyrics`, `/bassboost`, custom playlists | `/play song-name` |
| 🔨 **Moderation** | `/ban`, `/kick`, `/timeout`, `/slowmode`, `/purge` | `/timeout user: @member duration: 10m` |
| ⚙️ **Settings** | `/set` (unified server settings, logging, tickets, stream alerts) | `/set option: view` |
| 🔔 **Alerts** | YouTube live/upload notifications, Twitch live alerts | `/set option: youtube channel: @creator` |
| 😂 **Fun & GIFs** | Consolidated `/gif` command with modular tag options (`/gif [tag] [query] [target]`), `/8ball`, `/rps`, `/urban` | `/gif tag: hug target: @friend` |
| ℹ️ **General** | `/help`, `/dashboard`, `/reminder`, `/poll`, `/weather`, `/translate`, `/game-search`, `/world-news` | `/help` |

> 📖 **Complete Command Reference:** See the [Commands Wiki](../../wiki/Commands) for full descriptions, arguments, and permission requirements.

---

## 📚 Documentation & Wiki

Comprehensive guides and architectural documentation are available in the [Wiki](../../wiki/Home):

- 🚀 [Getting Started](../../wiki/Getting-Started) — Prerequisites, installation, and first boot
- ⚙️ [Configuration](../../wiki/Configuration) — Environment variables, API keys, and feature flags
- 🏗️ [Architecture](../../wiki/Architecture) — Monorepo design, zero-ops SQLite fallback, and Redis caching
- ⌨️ [Commands Reference](../../wiki/Commands) — Detailed breakdown of all commands and `/set` options
- 🎵 [Music & Lavalink](../../wiki/Music) — Embedded Lavalink v4, YouTube OAuth, and audio filters
- 🌐 [Web Dashboard](../../wiki/Dashboard) — Next.js 15 App Router features and Discord OAuth2 setup
- 🛠️ [Developer Guide](../../wiki/Development-Guide) — Extending commands, listeners, and background monitors
- 🚀 [Deployment](../../wiki/Deployment) — Docker, Linux VPS (PM2/Caddy), and hosting options
- ❓ [FAQ & Troubleshooting](../../wiki/FAQ) — Solutions to common issues and questions

---

## Contributing

Fork it and submit a pull request!
Contributions, bug fixes, and feature proposals are warmly welcomed. Please see [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines and development workflows.

---

## Contributors ❤️

**⭐ [Bacon Fixation](https://github.com/Bacon-Fixation) ⭐ — Countless contributions**

- [ModoSN](https://github.com/ModoSN) — `resolve-ip`, `rps`, `8ball`, `bored`, `trump`, `advice`, `kanye`, `urban dictionary` commands and visual updates
- [PhantomNimbi](https://github.com/PhantomNimbi) — GIF consolidation, Lavalink v4 engine, Next.js 15 migration, moderation suite, support ticket system, live ASCII progress bar & auto-updater
- [Natemo6348](https://github.com/Natemo6348) — `mute`, `unmute`
- [kfirmeg](https://github.com/kfirmeg) — play command flags, dockerization, docker wiki
- [rafaeldamasceno](https://github.com/rafaeldamasceno) — `music-trivia` and Dockerfile improvements
- [navidmafi](https://github.com/navidmafi) — `LeaveTimeOut` and `MaxResponseTime` options, update issue template, fix leave command
- [Kyoyo](https://github.com/NotKyoyo) — brought back `now-playing`
- [MontejoJorge](https://github.com/MontejoJorge) — brought back `remind`
- [malokdev](https://github.com/malokdev) — `uptime` command
- [chimaerra](https://github.com/chimaerra) — minor command tweaks

---

## 📄 License

Distributed under the MIT License. See [`LICENSE.md`](LICENSE.md) for more information.
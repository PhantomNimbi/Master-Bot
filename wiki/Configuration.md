# ⚙️ Configuration & Environment Reference

Master-Bot is configured entirely through a single `.env` file located in the workspace root. Both the bot and the dashboard share this environment.

---

## 📑 Table of Contents
1. [Overview & Configuration Flow](#-overview--configuration-flow)
2. [🗄️ Database (`DB_URI`)](#️-database-db_uri)
3. [🤖 Discord & Dashboard URLs](#-discord--dashboard-urls)
4. [🎵 Lavalink & Audio Gateway](#-lavalink--audio-gateway)
5. [📺 YouTube OAuth Credentials](#-youtube-oauth-credentials)
6. [🎧 Spotify & Third-Party APIs](#-spotify--third-party-apis)
7. [🚩 Feature Toggles](#-feature-toggles)
8. [🔑 API Keys & Acquisition Guide](#-api-keys--acquisition-guide)
9. [Related Guides](#-related-guides)

---

## 📖 Overview & Configuration Flow

```mermaid
flowchart TD
    Env[Workspace .env] --> BotEnv[apps/bot/src/env.ts]
    Env --> DashEnv[apps/dashboard/src/env.mjs]
    Env --> DBPackage[packages/db/scripts/prepare-schema.mjs]

    BotEnv --> BotGateway[Discord Bot Gateway & Music]
    DashEnv --> WebServer[Next.js 15 Web Dashboard]
    DBPackage --> Prisma[Prisma Schema & Client: DB_URI]
```

---

## 🗄️ Database (`DB_URI`)

```env
DB_URI="file:/data/db.sqlite"
```

Master-Bot uses **Prisma ORM** with a strict dual-database architecture:
- **SQLite (Default Zero-Ops)**: When set to a `file:...` URI (e.g. `file:/data/db.sqlite`), Master-Bot uses local SQLite storage. The directory is created automatically on boot. No external database server or Docker container is needed.
- **PostgreSQL (Production Scaling)**: Set `DB_URI="postgresql://user:password@host:5432/dbname?schema=public"` for high-throughput multi-server production environments.

> [!IMPORTANT]
> The project strictly enforces a single environment variable: `DB_URI`. Redundant aliases such as `DATABASE_URL` or `DB_URL` are not supported.

---

## 🎨 Dashboard Theme & Appearance

| Variable | Default | Options | Description |
| :--- | :---: | :--- | :--- |
| `DASHBOARD_THEME` | `dark` | `dark`, `light`, `glassmorphism`, `cyberpunk`, `dracula`, `nord`, `emerald` | Default visual theme rendered on first load. Users can toggle freely from the theme picker dropdown. |
| `DASHBOARD_COLOR_SCHEME` | `default` | `default`, `purple`, `blue`, `emerald`, `rose`, `amber`, `indigo`, `crimson`, `teal`, `sunset`, `cyan` | Default accent color scheme overriding buttons, focus rings, and highlights. |

---

## 🤖 Discord & Dashboard URLs

| Variable | Required | Description |
| :--- | :---: | :--- |
| `DISCORD_TOKEN` | ✅ | Bot authentication token from the [Discord Developer Portal](https://discord.com/developers/applications). |
| `DISCORD_CLIENT_ID` | ✅ | Discord application Client ID (used for OAuth2 and invite generation). |
| `DISCORD_CLIENT_SECRET` | ✅ | Discord application Client Secret (used for web dashboard login). |
| `NEXTAUTH_SECRET` | ✅ | 32+ character random signing secret (`openssl rand -base64 32`). |
| `INTERNAL_URL` | ✅ | Host and port binding (`0.0.0.0:3000`). Binds to `0.0.0.0` so the service listens across all network interfaces, allowing both internal SSR requests and public traffic to reach the dashboard. |
| `PUBLIC_URL` | ✅ | The canonical public HTTPS domain of your dashboard (e.g. `https://your-domain.com`). Used for dashboard links and OAuth callbacks. |
| `DISCORD_CALLBACK_URL` | ✅ | Public bot invite authorization URL with administrator permissions. |

---

## 🎵 Lavalink & Audio Gateway

| Variable | Default | Description |
| :--- | :---: | :--- |
| `LAVA_HOST` | `localhost` | Hostname or IP address of the Lavalink v4 server. |
| `LAVA_PORT` | `2333` | Port number for the Lavalink HTTP and WebSocket gateway. |
| `LAVA_PASS` | `youshallnotpass` | Authorization password (must match `application.yml`). |
| `LAVA_SECURE` | `false` | Set to `true` to enable TLS (WSS/HTTPS) for remote Lavalink nodes. |
| `LAVA_EXTERNAL` | `false` | Set to `true` when connecting to a remote external Lavalink node. |

---

## 📺 YouTube OAuth Credentials

| Variable | Required | Description |
| :--- | :---: | :--- |
| `YOUTUBE_CLIENT_ID` | Optional | Google Cloud OAuth 2.0 Client ID. Powers YouTube live stream and video upload alerts. |
| `YOUTUBE_CLIENT_SECRET` | Optional | Google Cloud OAuth 2.0 Client Secret for YouTube alerts. |
| `YOUTUBE_REFRESH_TOKEN` | Optional | OAuth 2.0 refresh token for stream alerts and embedded Lavalink YouTube playback. |
| `YOUTUBE_CIPHER_URL` | `https://cipher.kikkia.dev/` | Remote endpoint for deciphering complex YouTube streaming signatures. |
| `YOUTUBE_CIPHER_PASSWORD` | Optional | Password for self-hosted cipher instances. |

> [!TIP]
> Setting `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, and `YOUTUBE_REFRESH_TOKEN` enables authenticated playback in Lavalink, bypassing YouTube IP throttling and robot verification challenges.

---

## 🎧 Spotify & Third-Party APIs

| Variable | Required | Description |
| :--- | :---: | :--- |
| `SPOTIFY_CLIENT_ID` | Optional | Spotify Developer client ID (resolves Spotify track/album metadata). |
| `SPOTIFY_CLIENT_SECRET` | Optional | Spotify Developer client secret. |
| `TWITCH_CLIENT_ID` | Optional | Twitch Developer Client ID (powers `/twitch-status`, Twitch alerts, and IGDB game lookups). |
| `TWITCH_CLIENT_SECRET` | Optional | Twitch Developer Client Secret. |
| `KLIPY_API` | Optional | API key from Klipy for reaction GIFs and search in `/gif`. |
| `NEWS_API` | Optional | NewsAPI key for global headline searches in `/world-news`. |
| `GENIUS_API` | Optional | Genius API client access token for fetching track lyrics in `/lyrics`. |

---

## 🚩 Feature Toggles

Disable individual bot features without code modifications:

| Variable | Default | Affected Capabilities |
| :--- | :---: | :--- |
| `LAVA_ENABLED` | `true` | Audio engine and all music commands (`/play`, `/queue`, etc.). |
| `GIFS_ENABLED` | `true` | Animated reaction GIFs and search (`/gif`). |
| `TWITCH_ENABLED` | `true` | Twitch live streamer polling notifications and `/twitch-status`. |
| `NEWS_ENABLED` | `true` | International news headlines command (`/world-news`). |
| `IGDB_ENABLED` | `true` | Video game database search command (`/game-search`). |

---

## 🔑 API Keys & Acquisition Guide

Every external API utilized by Master-Bot offers a free access tier:

| Service | Portal | Purpose |
| :--- | :--- | :--- |
| **Discord** | [Developer Portal](https://discord.com/developers/applications) | Bot token, client ID, client secret (mandatory). |
| **Spotify** | [Developer Dashboard](https://developer.spotify.com/dashboard) | Resolving Spotify playlist/track links to YouTube audio streams. |
| **Twitch** | [Developer Console](https://dev.twitch.tv/console/apps) | Stream monitoring alerts and IGDB game database queries. |
| **Google Cloud** | [Google Cloud Console](https://console.cloud.google.com/) | OAuth credentials for YouTube live notifications and unthrottled streaming. |
| **NewsAPI** | [NewsAPI Registration](https://newsapi.org/register) | Global news headlines (`/world-news`). |
| **Genius** | [Genius API Clients](https://genius.com/api-clients) | Song lyrics lookup (`/lyrics`). |
| **Klipy** | [Klipy](https://klipy.com/) | Reaction GIFs and animations (`/gif`). |

---

## 🔗 Related Guides
- [Home](Home) — Return to wiki main page
- [Getting Started](Getting-Started) — Prerequisites and initial workspace setup
- [Commands Reference](Commands) — Full breakdown of all slash commands
- [Stream Alerts](Reminders-and-Twitch) — YouTube and Twitch notification setup
- [Deployment](Deployment) — Production self-hosting and container deployment

---
[Home](Home) • [Documentation Index](Home) • [GitHub Repository](https://github.com/galnir/Master-Bot)
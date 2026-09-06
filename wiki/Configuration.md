# 🔑 Configuration & Environment Variables Guide

Master configuration reference for all environment variables in Master-Bot.

---

## Master `.env` Configuration Template

```env
# PostgreSQL Database URL
DATABASE_URL="postgresql://user:password@localhost:5432/master_bot?schema=public"
SHADOW_DB_URL="postgresql://user:password@localhost:5432/master_bot_shadow?schema=public"

# Discord Bot Credentials
DISCORD_TOKEN=""
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
DISCORD_OWNER_ID=""

# NextAuth & Web Dashboard
NEXTAUTH_SECRET="your_32_character_session_secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_URL_INTERNAL="http://localhost:3000"
NEXT_PUBLIC_INVITE_URL="https://discord.com/api/oauth2/authorize?client_id=...&permissions=8&scope=bot"

# Redis Cache
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Lavalink v4 Audio Engine
LAVA_ENABLED=true
LAVA_HOST="127.0.0.1"
LAVA_PORT=2333
LAVA_PASS="youshallnotpass"
LAVA_SECURE=false

# Spotify Metadata
SPOTIFY_CLIENT_ID=""
SPOTIFY_CLIENT_SECRET=""

# Twitch Stream Alerts
TWITCH_ENABLED=false
TWITCH_CLIENT_ID=""
TWITCH_CLIENT_SECRET=""

# Media & Search APIs
KLIPY_API=""
NEWS_ENABLED=false
NEWS_API=""
GENIUS_API=""
IGDB_ENABLED=false
IGDB_CLIENT_ID=""
IGDB_CLIENT_SECRET=""
```

---

## 🚩 Dynamic Feature Flags

| Variable | Default | Description |
| :--- | :--- | :--- |
| `LAVA_ENABLED` | `false` | Master toggle for Lavalink audio and all music commands |
| `GIFS_ENABLED` | `true` | Enables animated GIF reactions and media commands |
| `TWITCH_ENABLED` | `true` | Enables Twitch streamer monitoring and live alerts |
| `NEWS_ENABLED` | `true` | Enables global news headlines via NewsAPI (`/world-news`) |
| `IGDB_ENABLED` | `true` | Enables video game search via IGDB (`/game-search`) |

---

## Detailed Credentials Setup

See [API Keys & Integrations Guide](API-Keys) for step-by-step instructions on acquiring credentials.

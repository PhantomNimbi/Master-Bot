# 🔑 Configuration & Environment Variables Guide

Comprehensive configuration reference for all environment variables in Master-Bot.

---

## Complete `.env` Configuration Template

```env
# SQLite Database (auto-created at <repo>/data/bot.sqlite on first start)
# DISCORD_DB_PATH="/absolute/path/to/bot.sqlite"

# Unified Runtime Port (bot + embedded dashboard + OAuth2 share ONE port)
PORT=3000

# Discord Bot Credentials
DISCORD_TOKEN=""
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
DISCORD_OWNER_ID=""

# Dashboard / OAuth2 (optional — auto-resolved from PORT)
# NEXTAUTH_URL="https://your-domain.com"
# NEXTAUTH_SECRET="your_32_character_session_secret"

# Lavalink v4 Audio Engine
LAVA_ENABLED=true
LAVA_HOST="127.0.0.1"
LAVA_PORT=2333
LAVA_PASS="youshallnotpass"
LAVA_SECURE=false
LAVA_EXTERNAL=false

# Spotify Metadata
SPOTIFY_CLIENT_ID=""
SPOTIFY_CLIENT_SECRET=""

# Twitch Stream Alerts & IGDB
TWITCH_ENABLED=false
TWITCH_CLIENT_ID=""
TWITCH_CLIENT_SECRET=""
IGDB_ENABLED=false

# Media & Search APIs
GIFS_ENABLED=true
KLIPY_API=""
NEWS_ENABLED=false
NEWS_API=""
GENIUS_API=""
```

---

## 🚩 Dynamic Feature Flags

| Variable | Default | Description |
| :--- | :--- | :--- |
| `LAVA_ENABLED` | `false` | Global toggle for Lavalink audio and all music commands |
| `GIFS_ENABLED` | `true` | Enables animated GIF reactions and media commands |
| `TWITCH_ENABLED` | `true` | Enables Twitch streamer monitoring and live alerts |
| `NEWS_ENABLED` | `true` | Enables global news headlines via NewsAPI (`/world-news`) |
| `IGDB_ENABLED` | `true` | Enables video game search via IGDB (`/game-search`) |

---

## Detailed Credentials Setup

See [API Keys & Integrations Guide](API-Keys) for step-by-step instructions on acquiring credentials.

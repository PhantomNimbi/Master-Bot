# 🔑 Configuration & Environment Variables Guide

Comprehensive configuration reference for all environment variables in Master-Bot.

---

## Complete `.env` Configuration Template

```env
# SQLite Database URL
DATABASE_URL="file:./db.sqlite"

# Discord Bot Credentials
DISCORD_TOKEN=""
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""

# NextAuth & Port Configuration
DASHBOARD_PORT=3000
BOT_PORT=3001
BOT_API_PORT=3002
NEXTAUTH_SECRET="your_32_character_session_secret"

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
| `LAVA_ENABLED` | `false` | Global toggle for Lavalink audio and all music commands |
| `GIFS_ENABLED` | `true` | Enables animated GIF reactions and media commands |
| `TWITCH_ENABLED` | `true` | Enables Twitch streamer monitoring and live alerts |
| `NEWS_ENABLED` | `true` | Enables global news headlines via NewsAPI (`/world-news`) |
| `IGDB_ENABLED` | `true` | Enables video game search via IGDB (`/game-search`) |

---

## Detailed Credentials Setup

See [API Keys & Integrations Guide](API-Keys) for step-by-step instructions on acquiring credentials.

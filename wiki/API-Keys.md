# 🔑 API Keys & Integrations Guide

Step-by-step guide to acquiring credentials from developer portals.

---

## 1. Discord Bot Token & OAuth2 Credentials
- **Portal**: [Discord Developer Portal](https://discord.com/developers/applications)
- **Intents**: Enable `Message Content Intent` and `Server Members Intent`.
- **Variables**: `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`.

---

## 2. Spotify Developer API
- **Portal**: [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- **Variables**: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`.
- **Purpose**: Enables metadata search and ISRC resolution for Spotify tracks and playlists in Lavalink.

---

## 3. Twitch & IGDB Developer API
- **Portal**: [Twitch Developer Console](https://dev.twitch.tv/console)
- **Variables**: `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `IGDB_CLIENT_ID`, `IGDB_CLIENT_SECRET`.
- **Purpose**: Live Twitch stream alerts and IGDB video game database queries (`/game-search`).

---

## 4. Klipy (GIF Search Engine)
- **Portal**: [Klipy Developers](https://klipy.com/developers)
- **Variable**: `KLIPY_API`.
- **Purpose**: Powers `/gif` reaction commands.

---

## 5. NewsAPI (Global Headlines)
- **Portal**: [NewsAPI.org](https://newsapi.org/)
- **Variable**: `NEWS_API`.
- **Purpose**: Powers `/world-news` headlines search across countries and categories.

---

## 6. Genius API (Lyrics)
- **Portal**: [Genius API Clients](https://genius.com/api-clients/new)
- **Variable**: `GENIUS_API`.
- **Purpose**: Song lyrics search (`/lyrics`).

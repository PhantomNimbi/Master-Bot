# API Keys & Configuration Guide

Master-Bot integrates with multiple external services. Below is a complete guide to acquiring and setting up credentials.

---

## 🔑 Required Credentials

### Discord Bot Token & OAuth2 Client Credentials
- **Portal:** [Discord Developer Portal](https://discord.com/developers/applications)
- **Permissions:** Enable `Message Content Intent` and `Server Members Intent` under the Bot tab.
- **Variables:**
  - `DISCORD_TOKEN`: Bot User Token
  - `DISCORD_CLIENT_ID`: Application Client ID
  - `DISCORD_CLIENT_SECRET`: Application Client Secret (Used for Web Dashboard NextAuth.js login)

---

## 🎵 Music & Lavalink Engine Credentials

> [!IMPORTANT]
> Lavalink audio streaming is **gated behind API keys/credentials**. If no API keys for YouTube, Spotify, or SoundCloud are provided in `.env`, the internal Lavalink server launch is automatically skipped and Lavalink is disabled.

### 1. YouTube Audio Engine (`YOUTUBE_API_KEY` / `YOUTUBE_REFRESH_TOKEN`)
- **Automated OAuth Capture:** On launch, Lavalink's `youtube-plugin` outputs a Google OAuth device code prompt to the terminal console. Completing authorization at `https://www.google.com/device` automatically saves `YOUTUBE_REFRESH_TOKEN` into `.env`.
- **Variables:** `YOUTUBE_REFRESH_TOKEN` or `YOUTUBE_API_KEY`

### 2. Spotify Developer API (`SPOTIFY_CLIENT_ID` & `SPOTIFY_CLIENT_SECRET`)
- **Portal:** [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- **Variables:** `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`
- **Features:** Enables Lavalink `lavasrc-plugin` to search and resolve Spotify track/album/playlist URLs directly into playable audio streams. Gated behind credentials.

### 3. SoundCloud Artist Pro API (`SOUNDCLOUD_CLIENT_ID` & `SOUNDCLOUD_CLIENT_SECRET`)
- **Requirement:** Requires a SoundCloud Artist Pro account to register and obtain API client credentials.
- **Variables:** `SOUNDCLOUD_CLIENT_ID` and `SOUNDCLOUD_CLIENT_SECRET`
- **Features:** Enables full-track SoundCloud search (`scsearch`) without 30-second preview limitations. Automatically used as a search source when configured. Gated behind credentials.

---

## 🎮 Optional Service Integrations

### Twitch & IGDB (Game Search)
- **Portal:** [Twitch Developer Console](https://dev.twitch.tv/console)
- **Variables:** `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`
- **Features:** Grants access to Twitch live streamer status alerts and **IGDB video game metadata search** (`/game-search`).

### Klipy (GIF Search Engine)
- **Portal:** [Klipy Developers](https://klipy.com/developers)
- **Variable:** `KLIPY_API`
- **Features:** Powers `/gif` search commands.

### Genius API (Song Lyrics)
- **Portal:** [Genius API Clients](https://genius.com/api-clients/new)
- **Variable:** `GENIUS_API`
- **Features:** Song lyrics fetching (`/lyrics`).

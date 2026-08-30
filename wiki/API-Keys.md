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
> Lavalink audio streaming is **gated behind API keys/credentials**. If no API keys for YouTube or Spotify are provided in `.env`, the internal Lavalink server launch is automatically skipped and Lavalink is disabled.

### 1. YouTube Audio Engine (`YOUTUBE_API_KEY` / `YOUTUBE_REFRESH_TOKEN`)
- **Automated OAuth Capture:** On launch, Lavalink's `youtube-plugin` outputs a Google OAuth device code prompt to the terminal console (or triggered via `/youtube-auth`). Completing authorization at `https://www.google.com/device` automatically saves the refresh token atomically into `.youtube-oauth.json`.
- **Variables:** `YOUTUBE_REFRESH_TOKEN` or `YOUTUBE_API_KEY`

### 2. Spotify Developer API (`SPOTIFY_CLIENT_ID` & `SPOTIFY_CLIENT_SECRET`)
- **Portal:** [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- **Variables:** `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`
- **Features:** Enables Lavalink `lavasrc-plugin` to search and resolve Spotify track/album/playlist URLs directly into playable audio streams. Gated behind credentials.

### 3. SoundCloud (Built-In Free Source — No API Keys Required)
- **Features:** Uses Lavalink's **built-in** SoundCloud source (`filterOutPreviewTracks: true`) for full-length track search and playback (`scsearch`) — **no paid SoundCloud Artist Pro API keys are required**. SoundCloud is enabled by default.
- **Optional Variables:** `SOUNDCLOUD_CLIENT_ID` and `SOUNDCLOUD_CLIENT_SECRET` — only needed if you re-enable the `lavasrc` SoundCloud source (paid), which is disabled by default.

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

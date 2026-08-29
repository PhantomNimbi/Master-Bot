# API Keys & Configuration Guide

Master-Bot integrates with several services. Below is a guide on how to acquire and set up credentials.

## Required Credentials
- **Discord Bot Token & OAuth2 Client ID/Secret:**
  - Obtain from the [Discord Developer Portal](https://discord.com/developers/applications).
  - Enable `Message Content Intent` and `Server Members Intent`.
  - Set `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, and `DISCORD_CLIENT_SECRET` in `.env`.

## Optional Integrations

### Twitch & IGDB (Game Search)
- **Twitch Developer Portal:** [Twitch Developers](https://dev.twitch.tv/console)
- Register an application to receive a `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`.
- These credentials grant access to both Twitch stream status and **IGDB game search**.

### Klipy (GIF Search)
- **Klipy Partner Panel:** [Klipy Developers](https://klipy.com/developers)
- Obtain an API key and set `KLIPY_API` in `.env`.

### YouTube Refresh Token (Music Engine)
- Used for persistent authentication with YouTube plugins in Lavalink v4.
- Set `YOUTUBE_REFRESH_TOKEN` in `.env`.

### Genius API (Song Lyrics)
- **Genius API Portal:** [Genius API Clients](https://genius.com/api-clients/new)
- Set `GENIUS_API` in `.env`.

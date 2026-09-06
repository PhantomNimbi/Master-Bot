# 🔑 Lavalink YouTube OAuth Device Flow

YouTube playback requires OAuth 2.0 device flow authentication to bypass bot verification checks and rate limits.

---

## How YouTube Device Authorization Works

1. On startup without a refresh token, Lavalink outputs an OAuth verification prompt to the terminal console:
   - **Verification Link**: `https://www.google.com/device`
   - **User Code**: `XXXX-XXXX`
2. Visit the link in your browser and authorize the device code.
3. The launcher automatically captures the issued token, saves it atomically to `.youtube-oauth.json` (gitignored), and sets `process.env.YOUTUBE_REFRESH_TOKEN`.
4. Tokens persist across reboots without modifying `.env` on disk.

---

## Owner Slash Command

The bot owner can re-trigger authorization at any time using:

```text
/youtube-auth
```

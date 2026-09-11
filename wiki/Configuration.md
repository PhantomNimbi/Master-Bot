# ⚙️ Configuration

Everything is configured through a single `.env` file at the workspace root (copy from `.env.example`). The bot and dashboard share it; app-specific scripts load it via `dotenv`.

## 🗄️ Database

```env
DATABASE_URL="file:./db.sqlite"
```

Master-Bot uses **SQLite** through **Prisma ORM**. The database is a single portable file (`db.sqlite`, created automatically at `packages/db/prisma/db.sqlite` — relative paths resolve against the Prisma schema). No separate database server is required.

## 🤖 Discord / NextAuth

| Variable | Required | Description |
| --- | --- | --- |
| `DISCORD_TOKEN` | ✅ | Bot token from the Discord Developer Portal. |
| `NEXTAUTH_SECRET` | ✅ | Random 32+ char secret that signs dashboard session tokens. |
| `NEXTAUTH_URL` | ✅ | Canonical public dashboard URL (e.g. `http://localhost:3000` or `https://domain.com`). |
| `NEXTAUTH_URL_INTERNAL` | — | Internal SSR URL for dashboard requests (default `http://localhost:3000`). |
| `NEXT_PUBLIC_INVITE_URL` | ✅ | Public OAuth2 bot invite URL used by the dashboard. |
| `DISCORD_CLIENT_ID` | ✅ | Discord application client ID (dashboard OAuth). |
| `DISCORD_CLIENT_SECRET` | ✅ | Discord application client secret (dashboard OAuth). |

## 🎵 Lavalink & Audio

| Variable | Default | Description |
| --- | --- | --- |
| `LAVA_HOST` | `localhost` | Lavalink host. |
| `LAVA_PORT` | `2333` | Lavalink WebSocket/HTTP port. |
| `LAVA_PASS` | `youshallnotpass` | Lavalink password (must match `application.yml`). |
| `LAVA_SECURE` | `false` | `true` enables WSS/HTTPS (use when hosting remotely behind TLS). |
| `LAVA_EXTERNAL` | `false` | Set to `true` when connecting to an external Lavalink instance (such as the public HELIX Origin server or [HELIX-Origin/Lavalink-Server](https://github.com/HELIX-Origin/Lavalink-Server)). |
| `YOUTUBE_REFRESH_TOKEN` | — | YouTube OAuth 2.0 refresh token; auto-saved to `.youtube-oauth.json` after `/youtube-auth`. |
| `YOUTUBE_API_KEY` | — | Optional YouTube Data API v3 key for richer track metadata. |
| `YOUTUBE_CIPHER_URL` | `https://cipher.kikkia.dev/` | Remote YouTube signature-decipher endpoint. |
| `YOUTUBE_CIPHER_PASSWORD` | — | Password for a self-hosted `yt-cipher` (leave empty for the public endpoint). |

> 💡 **Public Lavalink Server (Hosted by HELIX Origin):**
> If you don't wish to run or deploy a Lavalink server yourself, you can point Master-Bot to HELIX Origin's public instance:
> ```env
> LAVA_ENABLED=true
> LAVA_EXTERNAL=true
> LAVA_HOST="lavalink-server-4n9o.onrender.com"
> LAVA_PORT=443
> LAVA_PASS="youshallnotpass"
> LAVA_SECURE=true
> ```
> Live server status and configuration info can also be accessed at the [Lavalink Server Dashboard](https://lavalink-server-4n9o.onrender.com/).

## 🎧 Spotify (Metadata Resolution)

| Variable | Description |
| --- | --- |
| `SPOTIFY_CLIENT_ID` | Spotify Developer app client ID — resolves Spotify playlists/tracks to YouTube sources. |
| `SPOTIFY_CLIENT_SECRET` | Spotify Developer app client secret. |

## 🟣 Twitch & IGDB

| Variable | Description |
| --- | --- |
| `TWITCH_CLIENT_ID` | Twitch Developer app client ID — powers Twitch live notifications *and* IGDB game search. |
| `TWITCH_CLIENT_SECRET` | Twitch Developer app client secret. |

## 🔌 Misc APIs

| Variable | Description |
| --- | --- |
| `KLIPY_API` | API key for anime reactions and interactive GIFs (see [API Keys & Credentials](Configuration.md#api-keys--credentials)). |
| `NEWS_API` | NewsAPI key for `/world-news` global headline searches. |
| `GENIUS_API` | Genius API client token for `/lyrics`. |

## 🚩 Feature Flags

Every module can be disabled without touching code:

| Variable | Default | Module |
| --- | --- | --- |
| `LAVA_ENABLED` | `true` | Lavalink audio engine and all music commands. |
| `GIFS_ENABLED` | `true` | Animated GIF and reaction commands. |
| `TWITCH_ENABLED` | `true` | Twitch stream monitoring and notifications. |
| `NEWS_ENABLED` | `true` | News headline commands. |
| `IGDB_ENABLED` | `true` | IGDB game database lookups. |

Disabling a flag hides the related slash commands at startup and skips their background tasks.

---

## 🔑 API Keys & Credentials

Acquiring API keys (all free):

| Service | Where | Needed For |
| --- | --- | --- |
| **Discord** | [Developer Portal](https://discord.com/developers/applications) | Bot token, client ID/secret (required). |
| **Twitch** | [Twitch Developer Console](https://dev.twitch.tv/console/apps) | `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` — live alerts + IGDB search. |
| **Spotify** | [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) | `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` — Spotify→YouTube resolution. |
| **YouTube OAuth** | Google Cloud Console → OAuth consent screen | `YOUTUBE_REFRESH_TOKEN` via the bot's `/youtube-auth`. Needed for `/youtube-api` client playback (recommended, defeats YouTube throttling). |
| **NewsAPI** | [newsapi.org](https://newsapi.org/register) | `NEWS_API` — `/world-news`. |
| **Genius** | [Genius API](https://genius.com/api-clients) | `GENIUS_API` — `/lyrics`. |
| **Klipy** | [Klipy](https://klipy.com/) | `KLIPY_API` — anime reactions/GIFs. |

### Registering the bot with Spotify & YouTube is highly recommended for reliable audio

Without Spotify keys, `/play` can't resolve Spotify links; without the YouTube OAuth token, playback may be throttled by YouTube. (See [Music & Lavalink](Music.md#youtube-oauth) for the OAuth flow.)
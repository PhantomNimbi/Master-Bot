# 🎵 Lavalink v4 Configuration (`application.yml`)

Master-Bot runs **Lavalink v4** with a **custom configuration** tracked in the repo as [`application.yml.example`](../application.yml.example). This is **not** Lavalink's stock config — it ships fixes for features that are broken or unusable with the default `application.yml` from the Lavalink release.

> ⚠️ **Always use our template, never Lavalink's default.**
> The bare `application.yml` in each [Lavalink release](https://github.com/lavalink-devs/Lavalink) is minimal and will **not** play YouTube (throttled/blocked, single client) and will **not** resolve Spotify links. Always start from our example:
>
> ```bash
> cp application.yml.example application.yml
> ```
>
> The Heroku build and Docker setup do this for you automatically — see [Deployment](Deployment.md).

## What our config fixes

| Area | Stock Lavalink default | Master-Bot's `application.yml.example` |
| --- | --- | --- |
| YouTube playback | single client, frequently throttled or age-locked | `youtube-plugin` with six rotating clients (`TV`, `MUSIC`, `ANDROID_VR`, `IOS`, `WEB`, `WEBEMBEDDED`), a `remoteCipher` resolver (`cipher.kikkia.dev`) and optional [YouTube OAuth](Music.md#-youtube-oauth-recommended) |
| YouTube source | native `youtube` source is unreliable | native source disabled (`youtube: false`); playback handled by the plugin instead |
| Spotify resolution | not resolvable at all | `lavasrc-plugin` with ISRC providers (`ytmsearch` / `ytsearch` by `%ISRC%`) so tracks, albums and playlists map to their YouTube counterparts |
| Streaming quality | default buffering | tuned `bufferDurationMs: 400`, `frameBufferDurationMs: 10000`, `opusEncodingQuality: 10`, `resamplingQuality: HIGH` |
| Stalled tracks | 15s stuck threshold | `trackStuckThresholdMs: 30000` — fewer false "stuck" skips |

## Plugins it loads

Two plugins are pinned under `lavalink.plugins`:

- **`dev.lavalink.youtube:youtube-plugin`** `1.18.2` — from `https://maven.lavalink.dev/releases`
- **`com.github.topi314.lavasrc:lavasrc-plugin`** `4.8.3` — from `https://maven.topi.wtf/releases`

Lavalink downloads these artifacts (plus the plugin's YouTube clients) from Maven on first boot, so the server needs outbound internet access at startup.

## Environment variables

`application.yml` expands these at boot; provide them via `.env` / Heroku config vars:

| Variable | Used for | Default |
| --- | --- | --- |
| `LAVA_PASS` | WebSocket server password | `youshallnotpass` |
| `LAVA_PORT` | HTTP/WebSocket port | `2333` |
| `PORT` | overrides `LAVA_PORT` when set (see below) | — |
| `YOUTUBE_CIPHER_URL` | remote cipher resolver for YouTube | `https://cipher.kikkia.dev/` |
| `YOUTUBE_CIPHER_PASSWORD` | cipher resolver password | empty |
| `YOUTUBE_REFRESH_TOKEN` | [YouTube OAuth](Music.md#-youtube-oauth-recommended) refresh token | empty |
| `YOUTUBE_SKIP_INIT` | skip YouTube OAuth initialization | `false` |
| `SPOTIFY_CLIENT_ID` | Spotify → YouTube resolution | empty |
| `SPOTIFY_CLIENT_SECRET` | Spotify → YouTube resolution | empty |

> 💡 **Why `PORT` matters:** the template binds `server.port` to `${PORT:${LAVA_PORT:2333}}`. On hosts that inject a `PORT` value (e.g. Heroku), set `PORT`/`LAVA_PORT` so audio stays on the port your bot expects; locally it just defaults to `2333`.

## Where this config is used

| Setup | How `application.yml` appears |
| --- | --- |
| **Local dev / VPS** | `pnpm dev` auto-starts Lavalink with the repo config when Java 17+ is detected (see [Music & Lavalink](Music.md#option-c-local-lavalink-server-for-local--dedicated-vps-development)). |
| **External / Heroku** | Heroku does not run Lavalink (512 MB eco limit); your external server must be configured with this file as `application.yml`. |
| **Docker / VPS compose** | `docker-compose.yml` mounts the repo and starts Lavalink from our config in its own container. |

## Updating plugin versions

Both versions are edited directly in `application.yml.example`. Check the release feeds before bumping:

- youtube-plugin: <https://github.com/lavalink-devs/youtube-source/releases>
- lavasrc: <https://github.com/topi314/LavaSrc/releases>

After changing the config, restart Lavalink so it re-downloads the plugin artifacts on boot.

## Related pages

- [Music & Lavalink](Music.md) — setup options and playback
- [Deployment](Deployment.md) — Heroku (external Lavalink) + Docker deployment
- [FAQ & Troubleshooting](FAQ.md)
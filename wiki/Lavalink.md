# Lavalink v4 Setup & Audio Engine Guide

Master-Bot uses **Lavalink v4** for high-performance, low-latency cross-platform audio streaming.

---

## 1. Java Requirements

Lavalink v4 requires **Java 17 or higher**. The **Java 21 LTS** release is the recommended version for production stability and long-term support.

- Download Java 21 (Azul Zulu): https://www.azul.com/downloads/?package=jdk#zulu
- Verify your installation: `java -version` (should print `21.x.x` or higher)

> [!IMPORTANT]
> Java versions below 17 are **not supported** and will cause Lavalink to fail on startup.

---

## 2. Download Lavalink Executable

- **Official Repository:** [lavalink-devs/Lavalink](https://github.com/lavalink-devs/Lavalink)
- **Releases Page:** [Download Latest Lavalink v4 Release](https://github.com/lavalink-devs/Lavalink/releases)

Place `Lavalink.jar` in the root workspace directory alongside `application.yml`.

---

## 3. Configuration (`application.yml`)

The repository includes a preconfigured `application.yml` supporting:
- `youtube-plugin` (`dev.lavalink.youtube:youtube-plugin:1.18.2`): Modern YouTube playback engine supporting OAuth 2.0 device flow with all active YouTube clients (`MUSIC`, `WEB`, `WEBEMBEDDED`, `ANDROID_VR`, `TVHTML5`).
- `lavasrc-plugin` (`com.github.topi314.lavasrc:lavasrc-plugin:4.8.3`): Spotify, Deezer, Apple Music metadata resolution.

> [!NOTE]
> The `TVHTML5_SIMPLY` client was removed in youtube-plugin v1.14.0+ as Google deprecated it. The current client list is correct and should not be modified.

---

## 4. Automated YouTube OAuth Device Flow

YouTube playback requires OAuth 2.0 authentication to prevent IP rate limits and bot verification blocks.

### Initial Setup Authorization
1. On launch, if `YOUTUBE_REFRESH_TOKEN` is missing in `.env`, Lavalink's `youtube-plugin` triggers a device authorization flow.
2. The launcher prints a formatted banner directly to the **terminal console** containing:
   - Verification Link: `https://www.google.com/device`
   - User Code: `XXXX-XXXX`
3. Visit the link in your browser and enter the code to grant authorization.
4. The launcher automatically intercepts the issued token, saves `YOUTUBE_REFRESH_TOKEN` into `.env`, and updates runtime environment variables.
5. On future launches, `pnpm dev` and `pnpm start` supply `-Dplugins.youtube.oauth.refreshToken=...` to Lavalink automatically via JVM argument.

### Token Auto-Refresh
Once a valid `YOUTUBE_REFRESH_TOKEN` is stored, Lavalink's youtube-plugin handles short-lived access token refresh internally every ~60 minutes. No manual intervention is required.

---

## 5. Connection Environment Variables

Ensure the following variables in `.env` match your Lavalink setup:
- `LAVA_HOST`: Hostname (default `localhost` or `0.0.0.0`)
- `LAVA_PORT`: WebSocket port (default `2333`)
- `LAVA_PASS`: Password (must match `lavalink.server.password` in `application.yml`)
- `LAVA_EXTERNAL`: Set to `true` if connecting to a remote external Lavalink instance.

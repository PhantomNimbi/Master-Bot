# Lavalink v4 Setup & Audio Engine Guide

Master-Bot uses **Lavalink v4** for high-performance, low-latency cross-platform audio streaming.

---

## 🎵 Audio Architecture & YouTube OAuth Lifecycle

```mermaid
flowchart TD
    User["Discord User (/play)"] --> SapphireBot["Master-Bot (Sapphire)"]
    SapphireBot -->|WebSocket (Port 2333)| Lavalink["Lavalink v4 Audio Server"]

    subgraph Lavalink Engine
        YouTubePlugin["youtube-plugin (1.18.2)"]
        LavaSrc["lavasrc-plugin (Spotify / Apple)"]
        SoundCloud["SoundCloud Audio Source"]
    end

    Lavalink --> YouTubePlugin
    Lavalink --> LavaSrc
    Lavalink --> SoundCloud

    YouTubePlugin -->|OAuth Device Flow| GoogleOAuth["Google / YouTube OAuth"]
    GoogleOAuth -->|Atomic Write| TokenFile[".youtube-oauth.json"]
    TokenFile -->|Spring Binding| Lavalink
    Lavalink -->|Direct Opus Stream| VoiceChannel["Discord Voice Channel"]
```

---

## 1. Java Requirements & OS Installation

Lavalink v4 requires **Java 17 or higher**. The **Java 21 LTS** release is the recommended version for production stability, virtual threads, and long-term support.

### 🪟 Windows

```powershell
winget install Microsoft.OpenJDK.21
# or Eclipse Temurin
winget install EclipseAdoptium.Temurin.21.JDK
```

### 🍎 macOS

```bash
brew install openjdk@21
sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk
```

### 🐧 Linux

```bash
# Ubuntu / Debian
sudo apt update && sudo apt install -y openjdk-21-jre-headless

# Arch Linux
sudo pacman -S jdk21-openjdk

# Fedora / RHEL
sudo dnf install -y java-21-openjdk
```

### Verify Java Installation

```bash
java -version
# Expected output: openjdk version "21.x.x" ...
```

> [!IMPORTANT]
> Java versions below 17 are **not supported** and will cause Lavalink to fail on startup.

---

## 2. Download Lavalink Executable

- **Official Repository:** [lavalink-devs/Lavalink](https://github.com/lavalink-devs/Lavalink)
- **Releases Page:** [Download Latest Lavalink v4 Release](https://github.com/lavalink-devs/Lavalink/releases)

Place `Lavalink.jar` in the root workspace directory alongside `application.yml`.

> [!TIP]
> A preconfigured template is provided at `application.yml.example`. Copy it to `application.yml` to get started:
>
> ```bash
> cp application.yml.example application.yml
> ```

---

## 3. Configuration (`application.yml`)

The repository includes a preconfigured `application.yml` supporting:

- `youtube-plugin` (`dev.lavalink.youtube:youtube-plugin:1.18.2`): Modern YouTube playback engine supporting OAuth 2.0 device flow with multi-client InnerTube failover and remote signature deciphering:
  - `remoteCipher`: Offloads YouTube signature deciphering to a remote cipher server (`https://cipher.kikkia.dev/` or custom `YOUTUBE_CIPHER_URL`), preventing playback stalls when YouTube rolls out player cipher updates.
  - `MUSIC` (`WEB_REMIX`): YouTube Music endpoints (bypasses video player ciphers).
  - `ANDROID_VR`: Android VR streaming client.
  - `WEB`: Standard Web player client.
  - `WEBEMBEDDED` (`WEB_EMBEDDED_PLAYER`): Embedded player for restricted content.
  - `IOS`: Direct audio stream extraction from iOS InnerTube endpoints.
  - `TV` (`TVHTML5`): OAuth 2.0 device flow authentication endpoint.
- `lavasrc-plugin` (`com.github.topi314.lavasrc:lavasrc-plugin:4.8.3`): Spotify metadata resolution via ISRC/query search fallback.

> [!NOTE]
> The built-in SoundCloud source (free, no API keys required) is used for SoundCloud playback with `filterOutPreviewTracks: true` to ensure only full-length tracks are returned. The `lavasrc` SoundCloud source (which requires paid Artist Pro API keys) is disabled.

---

## 4. Automated YouTube OAuth Device Flow & Token Persistence

YouTube playback requires OAuth 2.0 authentication to prevent IP rate limits and bot verification blocks.

### Initial Setup Authorization

1. On launch, if `YOUTUBE_REFRESH_TOKEN` is missing from `.env` and `.youtube-oauth.json`, Lavalink's `youtube-plugin` triggers a device authorization flow.
2. The launcher prints a formatted banner directly to the **terminal console** containing:
   - Verification Link: `https://www.google.com/device`
   - User Code: `XXXX-XXXX`
3. Visit the link in your browser and enter the code to grant authorization.
4. The launcher automatically intercepts the issued token and writes it atomically to `.youtube-oauth.json` (gitignored), setting `process.env.YOUTUBE_REFRESH_TOKEN` for the session.
5. Lavalink binds the token natively via `refreshToken: "${YOUTUBE_REFRESH_TOKEN}"` in `application.yml`, eliminating `.env` disk corruption while surviving reboots.

### Token Auto-Refresh

Once a valid `YOUTUBE_REFRESH_TOKEN` is present, Lavalink's `youtube-plugin` handles short-lived access token refresh internally every ~60 minutes. No manual intervention is required.

---

## 5. Connection Topologies & Environment Configuration

Master-Bot supports three primary Lavalink deployment topologies:

### Topology A: Internal Local Server (Default for Development & Docker)

Runs locally on the same host or inside the Docker Compose network.

```env
LAVA_ENABLED=true
LAVA_EXTERNAL=false
LAVA_HOST="127.0.0.1"
LAVA_PORT=2333
LAVA_PASS="youshallnotpass"
LAVA_SECURE=false
```

### Topology B: Dedicated External Server (Recommended for Production Cloud)

Runs on a dedicated VPS (e.g. Hetzner, DigitalOcean) with uninterrupted 24/7 uptime and SSL termination.

```env
LAVA_ENABLED=true
LAVA_EXTERNAL=true
LAVA_HOST="lava.yourdomain.com"
LAVA_PORT=443
LAVA_PASS="your_secure_lavalink_password"
LAVA_SECURE=true
```

### Topology C: Public Community Lavalink Servers

Connects to a verified public Lavalink v4 community node.

```env
LAVA_ENABLED=true
LAVA_EXTERNAL=true
LAVA_HOST="public-lavalink.example.com"
LAVA_PORT=2333
LAVA_PASS="public_lavalink_pass"
LAVA_SECURE=false
```

---

## 6. Live Interactive Player Embed & Dynamic Progress Bar

When music playback begins, Master-Bot automatically deploys a dedicated interactive rich embed in the bound music text channel:

- **Interactive Button Controls**: Includes row components for `▶️ Resume / ⏸️ Pause`, `⏭️ Next`, `⏹️ Stop`, `🔁 Repeat: ON/OFF`, `🔀 Shuffle`, `🔉 Vol -`, and `🔊 Vol +`.
- **Live ASCII Progress Bar**: Renders real-time playback position (`00:00 ▰▰▰▰▰▰▱▱▱▱▱ 03:45`) that automatically ticks forward in 5-second intervals.
- **Livestream Support**: Intelligently identifies live audio and video streams (e.g. YouTube Live, Twitch) and renders `🔴 LIVE STREAM`.
- **Resource Management**: Automatically halts background timers and cleans up message components when tracks finish, pause, skip, or the bot leaves the voice channel.

---

## 7. Real-Time Audio DSP Filters

Master-Bot provides real-time DSP filter commands powered by Lavalink:

- **/bassboost**: Amplifies lower audio frequencies with selectable intensity levels (`low`, `medium`, `high`, `extreme`).
- **/nightcore**: Increases speed and pitch for an upbeat tempo.
- **/vaporwave**: Slows playback and lowers pitch for a retro aesthetic.
- **/karaoke**: Suppresses centered mono vocal frequencies.
- **/seek**: Seeks to any arbitrary timestamp position (`/seek 1:45`).

# ⚙️ Lavalink Configuration Guide (`application.yml`)

Detailed breakdown of Lavalink v4 configuration and plugin management.

---

## Configuration File Template

A preconfigured template is provided at `application.yml.example`. Copy it to `application.yml`:

```bash
cp application.yml.example application.yml
```

---

## Key Plugin Configurations

### 1. YouTube Plugin (`youtube-plugin:1.18.2`)
- **Remote Cipher**: Offloads YouTube signature deciphering to `https://cipher.kikkia.dev/` or custom `YOUTUBE_CIPHER_URL`.
- **InnerTube Clients**: Configures `MUSIC` (`WEB_REMIX`), `ANDROID_VR`, `WEB`, `WEBEMBEDDED`, `IOS`, and `TV` clients for playback.

### 2. LavaSrc Plugin (`lavasrc-plugin:4.8.3`)
- Enables Spotify track/album/playlist metadata resolution via ISRC and search fallback.

### 3. Built-In SoundCloud Source
- Free built-in full-length track streaming (`filterOutPreviewTracks: true`) without paid API keys.

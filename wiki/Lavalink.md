# 🎵 Lavalink v4 Audio Engine Hub

Master-Bot uses **Lavalink v4** for low-latency, cross-platform audio streaming.

---

## 🗺️ Audio Architecture

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

## 📚 Dedicated Audio Sub-Guides

- [⚙️ **Server Configuration (`application.yml`)**](Lavalink-Configuration): Plugins, remote cipher server, YouTube InnerTube clients.
- [🔑 **YouTube OAuth Device Flow**](Lavalink-YouTube-OAuth): Terminal authorization prompts, `/youtube-auth` command, atomic token persistence.
- [🎛️ **Audio DSP Filters**](Lavalink-Audio-Filters): Bassboost, Nightcore, Vaporwave, Karaoke, seek.
- [🌐 **Lavalink Node Topologies**](Lavalink-Nodes): Internal local server vs dedicated VPS vs public community nodes.

# 🤖 Master-Bot Discord Application (`@master-bot/bot`)

The Discord client application for **Master-Bot**, built with [Sapphire Framework](https://www.sapphirejs.dev/), [discord.js v14](https://discord.js.org/), [Lavalink v4 (`lavalink-client`)](https://github.com/lavalink-devs/Lavalink), and [Prisma ORM](https://www.prisma.io/).

---

## 🏗️ Architecture & Directory Structure

```text
apps/bot/
├── src/
│   ├── commands/              # 74 Sapphire chat input (slash) commands
│   │   ├── gifs/              # Klipy & Waifu.im reaction commands
│   │   ├── moderation/        # Ban, kick, purge, slowmode, timeout
│   │   ├── music/             # Lavalink audio playback & playlist suite
│   │   ├── other/             # Utilities, games, polls, reminders, news
│   │   └── twitch/            # Twitch status monitor
│   ├── lib/                   # Internal business logic and class modules
│   │   ├── games/             # Connect 4, Tic-Tac-Toe, Rock-Paper-Scissors
│   │   ├── gifs/              # Media scrapers & fetchers
│   │   ├── music/             # Queue, Track, Lavalink node managers, NowPlaying embeds
│   │   ├── presence/          # Dynamic rotating presence status manager
│   │   ├── reminders/         # Background reminder cron scheduler
│   │   ├── structures/        # ExtendedClient and CommandHelp interfaces
│   │   └── twitch/            # Twitch token and live stream checkers
│   ├── listeners/             # Sapphire event listeners
│   │   ├── guild/             # Guild member add/remove, role updates, channel events
│   │   ├── interaction/       # Slash commands, autocomplete, and error handlers
│   │   ├── music/             # Lavalink node connection and track lifecycle events
│   │   └── tempchannels/      # Temporary voice channel lifecycle management
│   ├── preconditions/         # Sapphire preconditions (isCommandDisabled, permissions)
│   └── env.ts                 # Type-safe environment validation
├── package.json
└── tsconfig.json
```

---

## ⚡ Key Features & Subsystems

1. **🎵 Lavalink v4 Audio Playback**:
   - YouTube multi-client failover with automated OAuth device token capture.
   - Spotify metadata resolution via `lavasrc-plugin`.
   - Free built-in SoundCloud track search and playback.
   - Interactive channel now-playing embeds with live 5-second ASCII progress bars.
   - Audio DSP filters: Bassboost, Karaoke, Nightcore, Vaporwave.
2. **🔨 Moderation Suite**:
   - Slash commands with hierarchy safety checks and automated audit logging.
3. **🎫 Support Tickets**:
   - Thread-based ticketing system with interactive buttons (`ticket_create`, `ticket_close`) and `.txt` transcript archiving.
4. **⏰ Scheduled Reminders**:
   - In-memory background scheduler checking database reminders every 30 seconds.
5. **📜 Audit Logging**:
   - 18 granular server event listeners routing formatted embeds to designated log channels.

---

## 🚀 Running & Building

From the workspace root:

```bash
# Build the bot TypeScript application
pnpm --filter @master-bot/bot build

# Launch the bot in development watch mode
pnpm --filter @master-bot/bot dev

# Launch full development stack (Bot + Dashboard + Lavalink)
pnpm dev
```

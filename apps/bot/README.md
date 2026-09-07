# 🤖 Master-Bot Discord Application (`@master-bot/bot`)

The Discord client application for **Master-Bot**, built with [Sapphire Framework](https://www.sapphirejs.dev/), [discord.js v14](https://discord.js.org/), [Lavalink v4 (`lavalink-client`)](https://github.com/lavalink-devs/Lavalink), and [Prisma ORM](https://www.prisma.io/) (SQLite).

---

## 🏗️ Architecture & Directory Structure

```text
apps/bot/
├── src/
│   ├── index.ts                # Boot: session.init() → client.login()
│   ├── commands/               # 74 Sapphire chat input (slash) commands
│   │   ├── gifs/               # Klipy & Waifu.im reaction commands
│   │   ├── moderation/         # Ban, kick, purge, slowmode, timeout
│   │   ├── music/              # Lavalink audio playback & playlist suite
│   │   ├── other/              # Utilities, games, polls, reminders, news, /set
│   │   └── twitch/             # Twitch status monitor
│   ├── lib/                    # Internal business logic and class modules
│   │   ├── session/            # SessionManager — in-memory state hub (SQLite-backed)
│   │   ├── set/                # Per-feature /set subcommand handlers (welcome, logging, tickets…)
│   │   ├── games/              # Connect 4, Tic-Tac-Toe, Rock-Paper-Scissors
│   │   ├── gifs/               # Media scrapers & fetchers
│   │   ├── music/              # Queue, QueueStore, TriviaSession, NowPlaying embeds, YouTube OAuth
│   │   ├── presence/           # Dynamic rotating presence status manager
│   │   ├── reminders/          # Background reminder scheduler (30s tick)
│   │   ├── structures/         # ExtendedClient, CommandHelp, HelpRegistry
│   │   └── twitch/             # Twitch token and live stream checkers
│   ├── listeners/              # Sapphire event listeners
│   │   ├── guild/              # Guild member add/remove, guild create/delete
│   │   ├── interaction/        # Ticket buttons, slash command errors
│   │   ├── music/              # Lavalink node connection and track lifecycle events
│   │   └── tempchannels/       # Temporary voice channel lifecycle management
│   ├── preconditions/          # Sapphire preconditions (isCommandDisabled, permissions)
│   └── env.ts                  # Type-safe environment validation (zod)
├── package.json
└── tsconfig.json
```

---

## ⚡ Key Features & Subsystems

1. **🎵 Lavalink v4 Audio Playback**:
   - YouTube multi-client failover with `/youtube-auth` OAuth token capture (persisted to `.youtube-oauth.json`).
   - Spotify metadata resolution via `lavasrc-plugin`.
   - Free built-in SoundCloud track search and playback.
   - Interactive channel now-playing embeds with live progress bars.
   - Audio DSP filters: Bassboost, Karaoke, Nightcore, Vaporwave.
   - Per-user, per-server custom playlists (`Playlist`/`Song` models).
2. **🔨 Moderation Suite**:
   - Slash commands with hierarchy safety checks and automated audit logging.
3. **🎫 Support Tickets**:
   - Thread-based ticketing system with interactive panels and `.txt` transcript archiving.
4. **⏰ Scheduled Reminders**:
   - Background scheduler checking reminders every 30 seconds; per-guild scoping.
5. **📜 Audit Logging**:
   - 20 granular server event triggers routing formatted embeds to designated log channels.
6. **🧠 Session Persistence**:
   - All runtime state (guilds, welcome messages, tickets, playlists, reminders, Twitch subscriptions, members) lives in the in-memory `SessionManager`, hydrates from SQLite at boot, and persists writes through a serial queue.
7. **👋 Member Lifecycle**:
   - Per-guild `GuildMember` rows on join; cascade-cleanup of tickets, temp channels, playlists, reminders, and Twitch data on leave.

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

## 📚 Wiki

See [Music & Lavalink](https://github.com/galnir/Master-Bot/wiki/Music) and the [Commands Reference](https://github.com/galnir/Master-Bot/wiki/Commands) for feature documentation.
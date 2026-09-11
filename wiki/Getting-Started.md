# 🚀 Getting Started

This guide walks you through installing, configuring, and launching **Master-Bot** for the first time.

## ✅ Prerequisites

| Requirement | Version | Purpose |
| --- | --- | --- |
| **Node.js** | `>= 20.0` | Runtime for the bot and dashboard |
| **pnpm** | `8.x` (repo pins `pnpm@8.6.7`) | Package manager for the workspace |
| **Java** | `17+` | Only required if running a **local Lavalink** server. Not needed if using an external dedicated server like [HELIX-Origin/Lavalink-Server](https://github.com/HELIX-Origin/Lavalink-Server) (see [Music & Lavalink](Music.md)) |
| **Discord Application** | — | Bot token, client ID, and secret from the [Discord Developer Portal](https://discord.com/developers/applications) |

> 💡 **Music is optional.** If you don't provide Lavalink (or set `LAVA_ENABLED=false`), every other feature still works.

## 📦 Installation

```bash
# 1. Clone the repository
git clone https://github.com/galnir/Master-Bot.git

# 2. Enter the project
cd Master-Bot

# 3. Install dependencies (runs the database bootstrap automatically)
pnpm install
```

`pnpm install` triggers a `postinstall` hook that runs `db:generate && db:push`, which:

1. Generates the **Prisma Client** for the workspace.
2. **Creates and migrates** the SQLite database (`db.sqlite`) with every table the bot needs.

No separate database server is required — nothing to install, nothing to manage.

## 🔐 Create a Discord Application

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and click **New Application**.
2. Go to **Bot** → **Reset Token** → copy your **bot token**.
3. Under **OAuth2 → General**, copy the **Client ID** and **Client Secret**.
4. Under **OAuth2 → URL Generator**, select the `bot` and `applications.commands` scopes, then generate a local invite URL.

## ⚙️ Configure the Environment

Copy the template and fill in your values:

```bash
cp .env.example .env
```

At a minimum, set:

```env
DISCORD_TOKEN="your-bot-token"
NEXTAUTH_SECRET="a-long-random-string-of-at-least-32-chars"
DISCORD_CLIENT_ID="your-client-id"
DISCORD_CLIENT_SECRET="your-client-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_INVITE_URL="https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands"
```

See [**Configuration**](Configuration.md) for the complete reference of every variable and feature flag.

## ▶️ Launch the Bot

### Development

```bash
pnpm dev
```

`pnpm dev` launches the **consolidated runtime** in a single console window: the bot gateway, the Next.js web dashboard (`http://localhost:3000/dashboard`), and the in-memory `ioredis-mock` cache — without requiring any external Redis binary.

Install Lavalink for local music (optional):

```bash
# Download the latest Lavalink v4 jar from the releases page,
# then copy the repo's config template (not Lavalink's stock application.yml —
# it lacks the YouTube/Spotify fixes, see wiki/Lavalink.md):
cp application.yml.example application.yml
java -jar Lavalink.jar
```

### Production

```bash
pnpm build   # builds the Next.js dashboard and compiles the bot
pnpm start   # runs the consolidated bot + internal dashboard in a single console window
```

### Individual Apps

You can also drive each app directly:

```bash
pnpm --filter bot dev          # bot only
pnpm --filter dashboard dev    # dashboard only
```

## 🔗 Invite the Bot

Use your generated invite URL to add the bot to a server with **Administrator** permissions (or the subset you prefer; the bot requires `Send Messages`, `Embed Links`, `Manage Messages`, `Manage Channels`, `Manage Roles`, `Manage Threads`, `Connect`, and `Speak` for its core features).

Then run `/set` in the server to configure welcome messages, logging, tickets, twitch alerts, and volume — and `/help` to see the full command list.

## 🗃️ Where Data Lives

- **Database:** `packages/db/prisma/db.sqlite` — created automatically (relative SQLite paths resolve against the Prisma schema). Back it up by copying this single file.
- **Logs:** `logs/` — bot, dashboard, Lavalink, and combined logs.
- **YouTube OAuth:** `.youtube-oauth.json` — auto-saved after first `/youtube-auth`.

## ❓ Problems?

See the [**FAQ & Troubleshooting**](FAQ.md) page.
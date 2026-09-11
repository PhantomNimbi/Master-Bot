# ❓ FAQ & Troubleshooting

## 🤖 The Bot

**The bot doesn't respond to any commands.**
- The bot must have **Read Messages / Send Messages** and `applications.commands` permission in the server, and you must **re-invite** it with the new scope if it was added without slash permissions.
- It may still be starting: check `logs/bot.log`. Slash commands register after the first successful connection.
- Verify `DISCORD_TOKEN` in `.env` and that the app didn't fail on a missing/optional API key.

**Slash commands are missing entirely.**
Re-invite the bot with the `applications.commands` OAuth scope alongside `bot` (see [Getting Started](Getting-Started.md#invite-the-bot)).

**Commands from a disabled module still show.**
Register happens at boot — restart the bot after flipping a feature flag (`LAVA_ENABLED`, `GIFS_ENABLED`, `TWITCH_ENABLED`, `NEWS_ENABLED`, `IGDB_ENABLED`).

**Where are the logs?** `logs/` at the workspace root — `bot.log`, `dashboard.log`, `lavalink.log`, and `combined.log`.

## 🎵 Music

**“No available audio players” / nothing plays.**
Lavalink isn't running or isn't reachable. Start it locally (`java -jar Lavalink.jar`), deploy an external server with one click via [**HELIX-Origin/Lavalink-Server**](https://github.com/HELIX-Origin/Lavalink-Server), or connect to the public Lavalink server hosted by HELIX Origin (`lavalink-server-4n9o.onrender.com`, port `443`, secure `true`). Check that `LAVA_HOST`, `LAVA_PORT`, and `LAVA_PASS` match. On a remote host also set `LAVA_EXTERNAL=true` (and `LAVA_SECURE=true` if using TLS/WSS).

**Spotify links do nothing.** Add `SPOTIFY_CLIENT_ID` + `SPOTIFY_CLIENT_SECRET`.

**YouTube throttles or blocks playback.** Complete `/youtube-auth` once so the bot streams through an authorized YouTube account (see [Music & Lavalink](Music.md#youtube-oauth)).

**Playback works but there's no visual progress / embed.** The now-playing embed needs **Embed Links** permission in the channel.

## 🗄️ Data & Database

**Where do settings, playlists, and reminders live?** In `packages/db/prisma/db.sqlite` — created automatically. Settings take effect after the bot hydrates at boot; save them and restart if something looks stale.

**I want a clean slate.** Stop the bot, delete `packages/db/prisma/db.sqlite`, run `pnpm db:push`, and restart. (The file is recreated on next boot.)

**SQLite errors like “database is locked” appear.** This usually means the bot/dashboard processes are pointing at different copies of the file, or a long-running transaction. Ensure both processes share the same directory/volume and aren't duplicated.

**How do I back up?** Copy `db.sqlite` (ideally via `sqlite3 .backup`). See [Deployment](Deployment.md#backups).

## 🔐 Auth & Dashboard

**Dashboard shows “Authorization failed”.** Confirm `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` and that `NEXTAUTH_URL` matches the URL you're visiting (localhost vs. domain — and HTTP vs. HTTPS).

**Dashboard shows no servers.** The bot must be a member of the server and have completed at least one boot there; also check the invite wasn't restricted by server settings.

**Users can't sign in.** The Discord OAuth **Redirect URI** must be `<NEXTAUTH_URL>/api/auth/callback/discord` in the Developer Portal.

**Where do dashboard settings go?** The same SQLite DB the bot uses — both processes must share one `db.sqlite`.

## 🛠️ Build & Runtime

**`pnpm install` fails.** You need Node `>=20` and pnpm `8.x`. If you're behind a proxy, adjust the pnpm registry.

**“Cannot find module @master-bot/...”** The workspace wasn't installed/built — run `pnpm install` then `pnpm build` from the repo root.

**Port 3000 already in use.** Change `PORT` and set `NEXTAUTH_URL` to the new port, or stop whatever is occupying it.

## 🤔 Still stuck?

Open an issue at https://github.com/galnir/Master-Bot/issues with the relevant `logs/` output and your `.env` **values masked** — never post secrets.
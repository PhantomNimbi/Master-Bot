# 🦅 Pterodactyl Panel Deployment Guide

Deploy Master-Bot to a Pterodactyl Game & App server panel using a generic Node.js egg. The bot embeds the dashboard, and SQLite is stored in the panel's persistent file area.

---

## 1. Panel Configuration

1. **Egg Selection**: Use a **Node.js 22+** egg.
2. **File Upload**: Upload repository files or clone via Git in the file manager.
3. **Startup Command**:
   ```bash
   pnpm install --ignore-scripts && pnpm build && pnpm start
   ```
4. **Port**: Set the startup port to `3000` (match the `PORT` variable).

---

## 2. Environment Variables

Populate the required environment variables in the **Startup** tab:
- `DISCORD_TOKEN`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_OWNER_ID`
- `PORT=3000`
- Optional: `DISCORD_DB_PATH` (defaults to `data/bot.sqlite` in the workspace — persists on the panel)
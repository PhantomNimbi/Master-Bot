# 🦅 Pterodactyl Panel Deployment Guide

Deploy Master-Bot to a Pterodactyl Game & App server panel using a generic Node.js egg.

---

## 1. Panel Configuration

1. **Egg Selection**: Use a **Node.js 20+** egg.
2. **File Upload**: Upload repository files or clone via Git in the file manager.
3. **Startup Command**:
   ```bash
   pnpm install && pnpm db:generate && pnpm --filter @master-bot/bot start
   ```

---

## 2. Environment Variables

Populate the required environment variables in the **Startup** tab:
- `DISCORD_TOKEN`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DATABASE_URL` (Point to external PostgreSQL host)
- `REDIS_HOST` (Point to external Redis host)

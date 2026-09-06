# 🟢 Deploying on Koyeb (koyeb.com)

Manual deployment instructions using Koyeb Console. Deploy the bot as a **single Web Service** — the dashboard is embedded and SQLite requires no PostgreSQL.

---

## 1. Deploy Master-Bot (Web Service)

1. Click **Create Service** -> **GitHub**.
2. Select repository and set:
   - **Type**: Web Service
   - **Build Command**: `pnpm install && pnpm build`
   - **Run Command**: `pnpm start`
   - **Port**: `3000`
3. Add environment variables: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_TOKEN`, `LAVA_ENABLED`.

## 2. Persistent Volume (SQLite)

Create a volume mounted at `/data` and set `DISCORD_DB_PATH=/data/bot.sqlite` so the auto-created SQLite database survives redeploys.

## 3. Discord Redirect

Add `https://<your-service>.koyeb.app/api/auth/callback/discord` to your Discord Developer Portal OAuth2 redirects.
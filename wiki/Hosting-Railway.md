# 🚆 Deploying on Railway (railway.app)

Manual step-by-step instructions for deploying Master-Bot to Railway as a **single service**. The bot embeds the dashboard; SQLite needs no external databases.

---

## Step 1: Add the Master-Bot Service

1. Open [Railway Dashboard](https://railway.app/dashboard) and click **New Project**.
2. Click **Create** -> **GitHub Repo** and select your repository.

## Step 2: Configure the Service

1. Open service **Settings**:
   - **Service Name**: `master-bot`
   - **Custom Build Command**: `pnpm install && pnpm build`
   - **Custom Start Command**: `pnpm start`
2. Under **Networking**, click **Generate Domain**.
3. Add a **Volume** mounted at `/data` for the SQLite database.

## Step 3: Add Environment Variables

- `DISCORD_DB_PATH`: `/data/bot.sqlite`
- `NEXTAUTH_URL`: `https://${{RAILWAY_PUBLIC_DOMAIN}}`
- `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_OWNER_ID`
- `LAVA_ENABLED`: `false`

Railway sets `PORT` automatically; add the generated domain's `/api/auth/callback/discord` redirect to your Discord Developer Portal OAuth2 settings.
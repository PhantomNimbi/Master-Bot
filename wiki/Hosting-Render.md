# 🚀 Deploying on Render (render.com)

Manual step-by-step instructions for deploying Master-Bot to Render as a **single Web Service**. The bot embeds the dashboard; SQLite requires no external database.

---

## Step 1 (Optional): Provision a Persistent Disk

The SQLite database lives at `<repo>/data/bot.sqlite`. To keep data across deploys, attach a **Persistent Disk** to the Web Service and mount it at `/opt/render/project/data`.

---

## Step 2: Deploy Master-Bot (Web Service)

1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name**: `master-bot`
   - **Language**: `Node`
   - **Branch**: `main`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
4. Add Environment Variables:
   - `PORT`: `3000` (Render injects its own `PORT` too)
   - `DISCORD_DB_PATH`: `/opt/render/project/data/bot.sqlite` (if a Persistent Disk is mounted)
   - `NEXTAUTH_URL`: `https://<your-service>.onrender.com`
   - `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_OWNER_ID`
   - `LAVA_ENABLED`: `false` (or an external Lavalink node host/pass)
5. Under your Discord Developer Portal OAuth2 settings, add:
   - `https://<your-service>.onrender.com/api/auth/callback/discord`
6. Click **Create Web Service**.

Dashboard: `https://<your-service>.onrender.com/dashboard`
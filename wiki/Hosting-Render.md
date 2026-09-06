# 🚀 Deploying on Render (render.com)

Manual step-by-step instructions for deploying Master-Bot to Render using a Web Service (Dashboard) and Background Worker (Discord Bot).

---

## Step 1: Provision Backing Databases

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **PostgreSQL**.
   - **Name**: `master-bot-db`
   - Click **Create Database** and copy the **Internal Database URL**.
3. Click **New +** -> **Redis**.
   - **Name**: `master-bot-redis`
   - Click **Create Redis** and copy the **Internal Redis Host** and **Port**.

---

## Step 2: Deploy Discord Bot (Background Worker)

1. In Render Dashboard, click **New +** -> **Background Worker**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name**: `master-bot-worker`
   - **Language**: `Node`
   - **Branch**: `main`
   - **Build Command**: `pnpm install && pnpm db:generate && pnpm build`
   - **Start Command**: `pnpm --filter @master-bot/bot start`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_OWNER_ID`
   - `DATABASE_URL`: (Internal PostgreSQL URL)
   - `REDIS_HOST`: (Internal Redis Host)
   - `REDIS_PORT`: (Internal Redis Port)
   - `LAVA_ENABLED`: `false` (or external Lavalink node host/pass)
5. Click **Create Background Worker**.

---

## Step 3: Deploy Web Dashboard (Web Service)

1. Click **New +** -> **Web Service**.
2. Connect the same repository.
3. Configure settings:
   - **Name**: `master-bot-dashboard`
   - **Language**: `Node`
   - **Branch**: `main`
   - **Build Command**: `pnpm install && pnpm db:generate && pnpm build`
   - **Start Command**: `pnpm --filter @master-bot/dashboard start`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `NEXTAUTH_URL`: `https://master-bot-dashboard.onrender.com`
   - `NEXTAUTH_SECRET`: (Generate a random 32-character string)
   - `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_TOKEN`
   - `DATABASE_URL`: (Internal PostgreSQL URL)
5. Under your Discord Developer Portal OAuth2 settings, add:
   - `https://master-bot-dashboard.onrender.com/api/auth/callback/discord`
6. Click **Create Web Service**.

# 🚆 Deploying on Railway (railway.app)

Manual step-by-step instructions for deploying Master-Bot to Railway using connected project services.

---

## Step 1: Create Project & Add Databases

1. Open [Railway Dashboard](https://railway.app/dashboard) and click **New Project**.
2. Select **Provision PostgreSQL**.
3. In the project canvas, click **Create** -> **Database** -> **Add Redis**.

---

## Step 2: Add Discord Bot Worker Service

1. Click **Create** -> **GitHub Repo** and select your repository.
2. Open service **Settings**:
   - **Service Name**: `master-bot-worker`
   - **Custom Build Command**: `pnpm install && pnpm db:generate && pnpm build`
   - **Custom Start Command**: `pnpm --filter @master-bot/bot start`
3. Open **Variables** and add:
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
   - `REDIS_HOST`: `${{Redis.REDISHOST}}`
   - `REDIS_PORT`: `${{Redis.REDISPORT}}`
   - `REDIS_PASSWORD`: `${{Redis.REDISPASSWORD}}`
   - `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`
   - `LAVA_ENABLED`: `false`

---

## Step 3: Add Web Dashboard Service

1. Click **Create** -> **GitHub Repo** and select the repository again.
2. Open service **Settings**:
   - **Service Name**: `master-bot-dashboard`
   - **Custom Build Command**: `pnpm install && pnpm db:generate && pnpm build`
   - **Custom Start Command**: `pnpm --filter @master-bot/dashboard start`
3. Under **Networking**, click **Generate Domain**.
4. Open **Variables** and add:
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
   - `NEXTAUTH_SECRET`: (32-character secret)
   - `NEXTAUTH_URL`: `https://${{RAILWAY_PUBLIC_DOMAIN}}`
   - `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_TOKEN`
5. Add the domain redirect URL to Discord Developer Portal.

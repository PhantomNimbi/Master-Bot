# 🟢 Deploying on Koyeb (koyeb.com)

Manual deployment instructions using Koyeb Console.

---

## 1. Provision PostgreSQL
1. Go to [Koyeb Console](https://app.koyeb.com/).
2. Create a new **PostgreSQL Database** service and copy the connection string.

---

## 2. Deploy Web Dashboard
1. Click **Create Service** -> **GitHub**.
2. Select repository and set:
   - **Type**: Web Service
   - **Build Command**: `pnpm install && pnpm db:generate && pnpm build`
   - **Run Command**: `pnpm --filter @master-bot/dashboard start`
   - **Port**: `3000`
3. Add environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`.

---

## 3. Deploy Discord Bot Worker
1. In the same App, click **Add Service** -> **GitHub**.
2. Set **Type**: Worker Service.
   - **Build Command**: `pnpm install && pnpm db:generate && pnpm build`
   - **Run Command**: `pnpm --filter @master-bot/bot start`
3. Add environment variables: `DATABASE_URL`, `DISCORD_TOKEN`, `REDIS_HOST`, `REDIS_PORT`, `LAVA_ENABLED`.

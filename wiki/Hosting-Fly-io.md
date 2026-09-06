# ✈️ Deploying on Fly.io (fly.io)

Manual deployment instructions using the Fly CLI. The bot embeds the dashboard; SQLite is stored on a Fly.io volume — no PostgreSQL or Redis needed.

---

## 1. Initialize & Add a Volume

```bash
# Initialize App
fly launch --no-deploy

# Create a persistent volume for the SQLite database
fly volumes create data --size 1 --region ord
```

## 2. Configure Dockerfile & Mounts

Master-Bot ships a production `Dockerfile` (Node 22). Mount the SQLite volume where the app expects it:

```toml
# fly.toml
[mounts]
source = "data"
destination = "/data"

[env]
DISCORD_DB_PATH = "/data/bot.sqlite"
```

## 3. Set Secrets & Deploy

```bash
# Set Secrets
fly secrets set \
  DISCORD_TOKEN="your_bot_token" \
  DISCORD_CLIENT_ID="your_client_id" \
  DISCORD_CLIENT_SECRET="your_client_secret" \
  NEXTAUTH_SECRET="your_32_char_secret" \
  NEXTAUTH_URL="https://master-bot.fly.dev" \
  LAVA_ENABLED=false

# Deploy App
fly deploy
```

Add `https://master-bot.fly.dev/api/auth/callback/discord` to your Discord Developer Portal OAuth2 redirects.
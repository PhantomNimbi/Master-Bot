# ✈️ Deploying on Fly.io (fly.io)

Manual deployment instructions using the Fly CLI.

---

## 1. Create Databases

```bash
# Create PostgreSQL Cluster
fly postgres create --name master-bot-postgres --region ord --initial-cluster-size 1 --vm-size shared-cpu-1x

# Create Upstash Redis
fly redis create --name master-bot-redis --region ord
```

---

## 2. Launch & Set Secrets

```bash
# Initialize App
fly launch --no-deploy

# Attach PostgreSQL
fly postgres attach master-bot-postgres --app master-bot

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

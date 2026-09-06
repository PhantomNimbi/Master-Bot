# 🟣 Deploying on Heroku (heroku.com)

Manual deployment instructions for Heroku using Buildpacks and Dynos.

---

## 1. Create Application & Add-ons

```bash
# Create Heroku App
heroku create master-bot-prod

# Add official Node.js buildpack
heroku buildpacks:add heroku/nodejs -a master-bot-prod

# Attach Heroku Postgres & Redis add-ons
heroku addons:create heroku-postgresql:essential-0 -a master-bot-prod
heroku addons:create heroku-redis:mini -a master-bot-prod
```

---

## 2. Configure `Procfile`

Ensure a `Procfile` exists in repository root:
```text
web: pnpm --filter @master-bot/dashboard start
worker: pnpm --filter @master-bot/bot start
```

---

## 3. Set Config Vars & Deploy

```bash
# Set environment variables
heroku config:set \
  NODE_ENV=production \
  NPM_CONFIG_PRODUCTION=false \
  DISCORD_TOKEN="your_bot_token" \
  DISCORD_CLIENT_ID="your_client_id" \
  DISCORD_CLIENT_SECRET="your_client_secret" \
  NEXTAUTH_SECRET="generate_random_32_char_secret" \
  NEXTAUTH_URL="https://master-bot-prod.herokuapp.com" \
  LAVA_ENABLED=false \
  -a master-bot-prod

# Deploy to Heroku
git push heroku main

# Scale dynos
heroku ps:scale web=1 worker=1 -a master-bot-prod

# Sync Prisma Database Schema
heroku run pnpm --filter @master-bot/db prisma db push -a master-bot-prod
```

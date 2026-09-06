# 🟣 Deploying on Heroku (heroku.com)

Manual deployment instructions for Heroku using Buildpacks and a single Dyno. The bot embeds the dashboard, and SQLite needs no add-ons.

---

## 1. Create Application

```bash
# Create Heroku App
heroku create master-bot-prod

# Add official Node.js buildpack
heroku buildpacks:add heroku/nodejs -a master-bot-prod
```

> The `package.json` engines require Node 22+, which Heroku's default stack resolves automatically.

---

## 2. Configure `Procfile`

Ensure a `Procfile` exists in repository root — one `web` process serves both the bot and dashboard:

```text
web: pnpm start
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

# Scale a single dyno
heroku ps:scale web=1 -a master-bot-prod
```

Heroku sets `PORT` automatically; the bot, dashboard, and OAuth2 callback all serve from it. The SQLite database is auto-created (use an ephemeral filesystem add-on or `DISCORD_DB_PATH` on a persistent volume to keep data across deploys).
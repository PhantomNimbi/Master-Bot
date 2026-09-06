# 🔷 Deploying on Northflank (northflank.com)

Manual deployment instructions for Northflank projects. The bot embeds the dashboard and uses embedded SQLite — no PostgreSQL or Redis add-ons needed.

---

1. **Create Project**: Create a new Northflank project.
2. **Add Service**: Deploy the repository as a single **Combined Service**.
   - **Build**: Node.js buildpack or the repository `Dockerfile`.
   - **Port**: Expose port `3000` via the auto-generated HTTPS domain.
3. **Persistent Volume**: Add a volume mounted at `/data` and set `DISCORD_DB_PATH=/data/bot.sqlite` to persist the SQLite database.
4. **Environment**: Provide `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_OWNER_ID`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET`.
5. **Discord Redirect**: Add `https://<service>.<project>.northflank.app/api/auth/callback/discord` to your Discord Developer Portal OAuth2 redirects.
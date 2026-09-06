# 🔷 Deploying on Northflank (northflank.com)

Manual deployment instructions for Northflank projects.

---

1. **Create Project**: Create a new Northflank project.
2. **Add Add-ons**: Provision a managed **PostgreSQL** and **Redis** add-on.
3. **Deploy Bot Worker**:
   - **Deployment Type**: Background Worker / Deployment Service.
   - **Build**: Node.js buildpack or Dockerfile (`apps/bot`).
   - **Environment**: Link PostgreSQL and Redis credentials; provide `DISCORD_TOKEN`.
4. **Deploy Dashboard Web Service**:
   - **Deployment Type**: Combined Service (Port 3000 exposed via HTTPS domain).
   - **Build**: Node.js buildpack (`apps/dashboard`).
   - **Environment**: Link PostgreSQL connection; set `NEXTAUTH_URL` and `NEXTAUTH_SECRET`.

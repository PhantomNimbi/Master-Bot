# ☁️ Cloud & Platform Hosting Hub

Comprehensive manual step-by-step deployment instructions for hosting **Master-Bot** across major cloud platforms. The Discord client, embedded web dashboard, and OAuth2 login run as a **single process** using embedded SQLite — no PostgreSQL or Redis.

---

## 🗺️ Supported Platform Guides

| Platform | Type | Dedicated Guide |
| :--- | :--- | :--- |
| **🚀 Render** | Single Web Service (persistent disk for SQLite) | [Render Hosting Guide](Hosting-Render) |
| **🚆 Railway** | Single Service (volume for SQLite) | [Railway Hosting Guide](Hosting-Railway) |
| **✈️ Fly.io** | MicroVM App (volume for SQLite) | [Fly.io Hosting Guide](Hosting-Fly-io) |
| **🟣 Heroku** | Single Web Dyno | [Heroku Hosting Guide](Hosting-Heroku) |
| **🟢 Koyeb** | Single Web Service (volume for SQLite) | [Koyeb Hosting Guide](Hosting-Koyeb) |
| **🔷 Northflank** | Single Deployment Service | [Northflank Hosting Guide](Hosting-Northflank) |
| **🐧 Linux VPS** | Systemd / Docker | [Linux VPS Guide](Hosting-VPS) |
| **🦅 Pterodactyl** | App / Bot Egg | [Pterodactyl Guide](Hosting-Pterodactyl) |
| **🐳 Docker** | docker-compose (bot + Lavalink) | [Docker Deployment Guide](Docker-Deployment) |

---

## 🔑 Master-Bot Environment Variables Reference

See the full [Configuration Guide](Configuration) for complete details on all required environment variables.

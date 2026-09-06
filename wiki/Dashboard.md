# 🌐 Web Dashboard Hub

The official web management portal and command center for **Master-Bot**. Since the HELIX rebuild it is **not** a separate Next.js app — it's a dependency-light Node.js `http` server (`apps/dashboard`) **embedded inside the bot process** (`apps/bot/src/server.ts`). The bot, dashboard, and OAuth2 login all share one unified port (default `3000`).

---

## 🎨 Command Center

The dashboard renders a dark glassmorphism interface (Tailwind CSS via CDN, CSS `backdrop-filter`) with:

- **Live telemetry** — guild/command/uptime stats served from `BotDatabase` and the running bot (`/api/dashboard/stats`)
- **Guild overview** — server listing with settings and actions (`/api/dashboard/guilds`)
- **Bot actions** — zero-lag server-side actions dispatched through the `dataService` facade (`/api/dashboard/bot/*`)
- **OAuth2 login** — NextAuth-compatible Discord session flow (`/api/auth/*`), cookie format mirrored from the original NextAuth implementation

Access it at `http://localhost:3000/dashboard` (or whatever `PORT` is set to).

---

## 📚 Dedicated Dashboard Sub-Guides

- [🏛️ **Technical Architecture**](Dashboard-Architecture): Single-process embedding, route table, context injection, `dataService` + `BotDatabase` wiring.
- [🎛️ **Feature Studios Guide**](Dashboard-Studios): Deep-dive into the dashboard studios (Music, Broadcaster, Audit Log, Support Tickets, Twitch, Telemetry, Reminders, Welcome Messages, Command Controls).
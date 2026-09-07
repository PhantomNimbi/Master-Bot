# 🌐 Master-Bot Web Dashboard

The official web management portal and control center for **Master-Bot**, built with **Next.js 15 (App Router)**, **React 18**, **tRPC v11**, **NextAuth.js v5 beta**, **Prisma ORM** (SQLite), and **Tailwind CSS**.

---

## ⚡ Features & Control Panels

- **🔐 Discord OAuth Authentication:** Secure login via NextAuth.js with Discord OAuth2, user upsert by Discord ID, and avatar synchronization.
- **📊 Server Hub (`/dashboard`):** Server picker for every server where the bot is present.
- **👋 Welcome Greetings (`/dashboard/[server_id]/welcome-message`):** Channel picker, template editor, toggle, and live embed preview.
- **📜 Audit & Event Logging (`/dashboard/[server_id]/log-channel`):** Master toggle, channel picker, and a switchboard of **20 event triggers** across Members, Messages, Channels, Roles, Voice, and Moderation.
- **🎫 Support Ticket System (`/dashboard/[server_id]/tickets`):** Ticket toggle, channel selectors for the panel and transcripts, and custom greeting editing.
- **⏰ Reminders (`/dashboard/reminders`):** Personal and server-wide scheduled reminders with live countdowns and status badges.
- **🎛️ Command Management (`/dashboard/[server_id]/commands/[command_id]`):** Per-command info and toggles.
- **🎵 Music (`/dashboard/music`):** Global audio and queue settings.
- **📣 Broadcast (`/dashboard/broadcast`):** Rich embed broadcaster with live Discord-style preview.
- **🔌 Integrations (`/dashboard/integrations`):** External service connections and credentials.
- **🖥️ System Telemetry (`/dashboard/system`):** Runtime health, uptime, and diagnostics.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions, RSC)
- **API & State:** [tRPC v11](https://trpc.io/) & [@tanstack/react-query v5](https://tanstack.com/query)
- **Auth:** [NextAuth.js v5 beta](https://authjs.dev/) (`@auth/prisma-adapter`) via `@master-bot/auth`
- **Database:** [Prisma ORM](https://www.prisma.io/) with **SQLite** (shared with the bot through `@master-bot/db`)
- **UI & Styling:** [Tailwind CSS](https://tailwindcss.com/), Radix UI primitives, custom UI components

---

## 🚀 Running Locally

From the project root:

```bash
# Development mode (launches Bot, Dashboard, and Lavalink)
pnpm dev

# Or launch only the dashboard
pnpm --filter @master-bot/dashboard dev
```

> ⚠️ The dashboard and bot **must share the same `db.sqlite`** — run them from the same directory or mount one persistent volume in containers.

## 📚 Wiki

See the [Web Dashboard](https://github.com/galnir/Master-Bot/wiki/Dashboard) page for the full architecture and studios overview.
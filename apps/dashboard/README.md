# 🌐 Master-Bot Web Dashboard

The official web management portal and control center for **Master-Bot**, built with **Next.js 15 (App Router)**, **React 18**, **tRPC v11**, **NextAuth.js v5 beta**, **Prisma ORM**, and **Tailwind CSS**.

---

## ⚡ Features & Control Panels

- **🔐 Discord OAuth Authentication:** Secure login via NextAuth.js with Discord OAuth2 provider, automatic token refresh, and avatar synchronization.
- **📊 Server Overview (`/dashboard/[server_id]`):** Quick-stat cards for Slash Commands, Welcome Greetings, Audit Logging, and Support Tickets.
- **🎛️ Command Management (`/dashboard/[server_id]/commands`):** Category-by-category command browser with per-command toggle switches.
- **👋 Welcome Greetings (`/dashboard/[server_id]/welcome-message`):**
  - Interactive placeholder guide (`{user}`, `{username}`, `{server}`, `{position}`).
  - One-click tag insertion.
  - Live simulated Discord chat embed preview.
- **📜 Audit & Event Logging (`/dashboard/[server_id]/log-channel`):**
  - Master log toggle switch and channel picker.
  - 18 granular event triggers categorized across Members, Messages, Channels, Roles, Voice, and Moderation.
- **🎫 Support Ticket System (`/dashboard/[server_id]/tickets`):**
  - Master ticket toggle with auto-posting support panel.
  - Channel selectors for Ticket Hub and Transcripts.
  - Custom ticket welcome message editor with real-time thread preview.
- **⏰ Reminders Management (`/dashboard/reminders` & `/dashboard/[server_id]/reminders`):**
  - Personal and server-wide scheduled reminder management.
  - Create, view, and delete active reminders with live countdowns and status badges.
- **📄 Owner Log Viewer (`/dashboard/logs`):** Protected real-time system log streaming directly from disk (`logs/combined.log`).

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions, RSC)
- **API & State:** [tRPC v11](https://trpc.io/) & [@tanstack/react-query v5](https://tanstack.com/query)
- **Auth:** [NextAuth.js v5 beta](https://authjs.dev/) (`@auth/prisma-adapter`)
- **Database:** [Prisma ORM](https://www.prisma.io/) with PostgreSQL
- **UI & Styling:** [Tailwind CSS](https://tailwindcss.com/), Radix UI primitives, [Lucide React](https://lucide.dev/)

---

## 🚀 Running Locally

From the monorepo root:

```bash
# Development mode (launches Bot, Dashboard, and Lavalink)
pnpm dev

# Or launch only the dashboard
pnpm --filter @master-bot/dashboard dev
```


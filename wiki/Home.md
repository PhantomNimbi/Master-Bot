# Welcome to the Master-Bot Wiki

**Master-Bot** is a modern, production-grade Discord Bot and Next.js Web Dashboard monorepo built with **TypeScript**, **Sapphire Framework**, **tRPC v11**, **Prisma ORM**, **Next.js 14**, **Redis**, and **Lavalink v4**.

---

## 📖 Wiki Navigation

- **[Setup & Deployment Guide](Setup-and-Deployment.md)**: Step-by-step local development setup, unified launcher instructions (`pnpm dev` / `pnpm start`), and Docker Compose deployment.
- **[Lavalink v4 Audio Engine](Lavalink.md)**: In-depth Lavalink v4 configuration, plugin management (`youtube-plugin`, `lavasrc-plugin`), and automatic YouTube OAuth device authorization.
- **[API Keys & Credentials](API-Keys.md)**: Guide on acquiring and setting up required and optional credentials (Discord, Twitch, Klipy, IGDB, YouTube).
- **[Commands Reference](Commands-Reference.md)**: Full reference for all available slash commands, interactive help browser, and parameters.

---

## ⚡ Key Highlights

- **Monorepo Architecture:** Managed via `pnpm` workspaces and Turborepo (`apps/bot`, `apps/dashboard`, `packages/api`, `packages/auth`, `packages/db`).
- **Unified Cross-Platform Launchers:** `scripts/dev.mjs` and `scripts/start.mjs` automatically manage ports (`3000`, `6379`, `2333`), redirect service logs to separate files (`logs/bot.log`, `logs/dashboard.log`, `logs/lavalink.log`), and format YouTube OAuth device codes.
- **Native YouTube OAuth:** Automatic owner Direct Messages and terminal prompts for YouTube device authorization, with automatic token persistence to `.env`.
- **Interactive Help System:** Built-in category browser dropdown menu (`StringSelectMenuBuilder`) and detailed command lookup.

---

## 🔗 Quick Links

- **Repository:** [PhantomNimbi/Master-Bot](https://github.com/PhantomNimbi/Master-Bot)
- **Lavalink v4 Releases:** [lavalink-devs/Lavalink](https://github.com/lavalink-devs/Lavalink/releases)

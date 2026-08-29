# Setup & Deployment Guide

This guide covers setting up Master-Bot for development or production deployment across **Windows**, **macOS**, and **Linux**.

## Prerequisites
- **Node.js**: `>=20.0.0`
- **pnpm**: `8.6.7` (`npm install -g pnpm@8.6.7`)
- **Docker & Docker Compose** (Optional for containerized deployment)
- **PostgreSQL Database**
- **Redis Server**

---

## Local Development Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/PhantomNimbi/Master-Bot.git
   cd Master-Bot
   ```

2. **Install Dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, and `DATABASE_URL`.

4. **Initialize Database:**
   ```bash
   pnpm db:push
   ```

5. **Start Development Services:**
   ```bash
   pnpm dev
   ```

---

## Docker Deployment (Recommended)

Run the complete stack (Bot, Dashboard, PostgreSQL, Redis, Lavalink v4) in Docker:

```bash
docker compose --env-file docker.env up -d --build
```

To stop the services:
```bash
docker compose down
```

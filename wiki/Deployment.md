# 🚀 Deployment

Master-Bot is a monorepo with three runtimes — the **bot**, the **dashboard**, and (optionally) **Lavalink**. The unified launcher (`scripts/start.mjs`) runs everything together, so a single process group is all you need to supervise.

## 🧰 Production Launch (bare metal / VPS)

```bash
pnpm install        # generates Prisma client + pushes the SQLite schema
pnpm build          # compiles the whole workspace
pnpm start          # launcher: bot + dashboard (+ Lavalink if enabled + Java present)
```

Runtime layout produced by the launcher:

```txt
logs/
├── combined.log       # unified stream
├── bot.log            # bot (Sapphire logger)
├── dashboard.log      # Next.js output
└── lavalink.log       # local Lavalink (when spawned)
```

### systemd

A minimal unit that supervises the launcher and restarts on crash:

```ini
[Unit]
Description=Master-Bot
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/Master-Bot
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=5
Environment=PATH=/usr/bin:/usr/local/bin

[Install]
WantedBy=multi-user.target
```

## 🐳 Docker

The included **Dockerfile** builds a single portable image (`node:20-slim`, PORT `3000`):

```bash
docker build -t master-bot .
docker run -d \
  --env-file docker.env \
  -p 3000:3000 \
  -v master-bot-db:/Master-Bot/packages/db/prisma \
  master-bot
```

> 💡 A `docker-compose.yml` is included — it runs the bot app plus optional Lavalink/Redis sidecars and mounts a `sqlite-data` volume at `/Master-Bot/packages/db/prisma` so `db.sqlite` survives recreation. The standalone Dockerfile is the current single-service path.

## ☁️ Cloud Hosts

Master-Bot is plain Node.js — any host that runs Node 20 works. The one non-negotiable is **persistent disk for `db.sqlite`**.

| Host | Guide |
| --- | --- |
| **VPS / bare metal** | Best: full control, local Lavalink, persistent local disk. See [Production Launch](#production-launch). |
| **Render** | Web service → Node 20, build `pnpm install && pnpm build`, start `pnpm start`, add a **Persistent Disk** and mount it at the repo root. |
| **Railway** | Railway volume mounted at the project root; `NEXTAUTH_URL` = your Railway domain. |
| **Fly.io** | `fly volume create` + mount at `/Master-Bot`; `xct: 'pnpm start'`; health-checks on port 3000. |
| **Heroku** | See below — filesystem is ephemeral, so plan persistence accordingly. |

### Persistent-data warning

Any host whose filesystem is **ephemeral** (Heroku dynos, free tiers, container image layers) will lose `db.sqlite` on restart or redeploy. Always attach a **persistent volume** — or accept that state resets. This is a single-file SQLite database, so volumes work trivially.

## ✈️ Heroku

```bash
heroku create master-bot
heroku buildpacks:set heroku/nodejs
```

1. **Node 20 + pnpm:** Heroku's Node buildpack honors `engines.packageManager` (already pinned `pnpm@8.6.7`) and enables Corepack automatically on recent versions. If the build still falls back to `npm`, add a small `package.json` script or set `USE_PNPM=true` as a config var.
2. **Environment:** set `NEXTAUTH_URL` to your Heroku app URL, plus `DISCORD_TOKEN`, `NEXTAUTH_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, and `NEXT_PUBLIC_INVITE_URL`.
3. **Start:** a `Procfile` is convenient:

   ```procfile
   web: pnpm start
   ```

4. **Persistence:** Heroku's filesystem is ephemeral. Mount a volume (Heroku Private Space / partner add-ons) or accept `db.sqlite` resetting on each deploy — for production data, a VPS or a persistent-volume host is strongly recommended.

## 🔐 Environment Checklist for Production

| Variable | Why it matters |
| --- | --- |
| `NEXTAUTH_URL` | Must be the **public HTTPS** dashboard URL or OAuth callbacks break. |
| `NEXTAUTH_SECRET` | A long random string; rotate carefully — changing it signs old sessions out. |
| `NEXT_PUBLIC_INVITE_URL` | Client-side invite button target. |
| `LAVA_EXTERNAL` / `LAVA_SECURE` | Set `true`/`true` when Lavalink runs on another host over TLS. |
| `PORT` | Next.js listens on `3000`; configure your proxy/health-check to match. |

## 🔁 Backups

Because everything is one file, backups are trivial — snapshot `db.sqlite` on a schedule:

```bash
sqlite3 packages/db/prisma/db.sqlite ".backup 'backups/db-$(date +%F).sqlite'"
```

(or simply copy the file while no migration is running).
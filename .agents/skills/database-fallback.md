# 🗄️ Skill: Database & Redis Fallback (`database-fallback`)

## Purpose
Guide agents in maintaining, configuring, and verifying the dual-database (PostgreSQL / SQLite) and dual-cache (Redis / `ioredis-mock`) architecture.

---

## 🏛️ Decision Topology

```mermaid
flowchart LR
    subgraph Input [Environment]
        DBUrl[DATABASE_URL]
        RedisUrl[REDIS_URL]
    end

    subgraph DynamicSetup [packages/db]
        Prep[prepare-schema.mjs]
        Client[packages/db/index.ts]
    end

    subgraph Output [Active Provider]
        PG[(PostgreSQL)]
        Lite[(SQLite db.sqlite)]
        ExtR[(External Redis)]
        MockR[ioredis-mock]
    end

    DBUrl --> Prep
    Prep -->|starts with postgres| PG
    Prep -->|file: or empty| Lite

    RedisUrl --> Client
    Client -->|connected| ExtR
    Client -->|missing or failed| MockR
```

---

## 🛠️ Verification & Maintenance Commands

```bash
# 1. Test SQLite preparation and generate Prisma Client
node packages/db/scripts/prepare-schema.mjs

# 2. Test PostgreSQL preparation (simulated)
DATABASE_URL="postgresql://user:pass@localhost:5432/db" node packages/db/scripts/prepare-schema.mjs

# 3. Push schema to active database without data loss
pnpm --filter @master-bot/db db:push

# 4. Run fallback unit tests
pnpm test tests/unit/databaseFallback.test.ts
```

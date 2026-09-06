# 🧪 Testing & Quality Assurance Guide

Master-Bot features a comprehensive unit and integration test harness powered by **Vitest v4** and **v8 code coverage**.

---

## 🚀 Running Tests

```bash
# Run Vitest test suites
pnpm test

# Run tests with code coverage reporting
pnpm run test:coverage

# Run tests in interactive watch mode
pnpm run test:watch

# Verify TypeScript types in test suites
pnpm run test:types
```

---

## 📊 Monorepo Test Suites Inventory

| Test Suite | File | Focus Area |
| :--- | :--- | :--- |
| **Config Parity** | `tests/unit/config.test.ts` | Turborepo pipeline, package scripts, parity |
| **Common Utils** | `tests/unit/scripts/common.test.ts` | Launcher path resolution & port extractors |
| **Environment** | `tests/unit/env.test.ts` | Environment variable schema validation |
| **Database** | `tests/unit/db/prisma.test.ts` | `BotDatabase` (node:sqlite) singleton, schema & CRUD |
| **Bot Constants** | `tests/unit/bot/constants.test.ts` | Bot directory paths and module locations |
| **Auth Config** | `tests/unit/auth/auth-config.test.ts` | NextAuth-compatible config from env & session tokens |
| **API Routers** | `tests/unit/api/routers.test.ts` | `dataService` router shapes (playlists, guild, twitch, tickets, reminders) |
| **Dashboard API** | `tests/integration/dashboard-api.test.ts` | Embedded dashboard endpoints over a real HTTP server |

# 🧪 Testing & Quality Assurance Guide

Master-Bot features a comprehensive unit and integration test harness powered by **Vitest v2** and **v8 code coverage**.

---

## 🚀 Running Tests

```bash
# Run Vitest test suites
pnpm test

# Run tests with code coverage reporting
pnpm run test:coverage

# Run tests in interactive UI mode
pnpm run test:ui

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
| **Database** | `tests/unit/db/prisma.test.ts` | PrismaClient singleton and schema exports |
| **Bot Constants** | `tests/unit/bot/constants.test.ts` | Bot directory paths and module locations |
| **Auth Config** | `tests/unit/auth/auth-config.test.ts` | NextAuth providers & Discord scopes |
| **API Routers** | `tests/unit/api/routers.test.ts` | tRPC procedure registration across 15 namespaces |
| **Dashboard API** | `tests/integration/dashboard-api.test.ts` | Authentication caller & procedure authorization |

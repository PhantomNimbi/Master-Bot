# ⚙️ Rule: Operational Safeguards & Commands

## Purpose
Define operational commands, process workflows, and safety gates for agents executing changes in the Master-Bot repository.

---

## 🛠️ Monorepo Commands

| Command | Action | Expected Outcome |
| :--- | :--- | :--- |
| `pnpm dev` | Start unified bot and dashboard in development mode | Single Node.js process listening on `PORT` (default `3000`) |
| `pnpm start` | Start unified production service | Boots bot, web server, and fallback/embedded services |
| `pnpm build` | Build all workspace packages via Turbo | Outputs `.next/`, `dist/`, and compiled Prisma client |
| `pnpm lint` | Run ESLint and `manypkg check` | 0 errors across all workspaces |
| `pnpm lint:fix` | Automatically resolve fixable lint issues | Fixed source files |
| `pnpm type-check` | Execute TypeScript compilation check | 0 compilation errors across all projects |
| `pnpm test` | Execute test suite via Vitest | 100% test pass rate |
| `pnpm test:watch` | Start Vitest interactive watch mode | Tests watch for changes |

---

## 🛡️ Safety Gates & Data Loss Prevention

1. **Prisma Database Sync**:
   - In development, use `pnpm db:push` for schema updates.
   - Do NOT run destructive reset commands in production environments without explicit confirmation.

2. **Command Verification**:
   - Before completing any task, run `pnpm lint`, `pnpm type-check`, and `pnpm test`.
   - Never commit code that breaks these quality gates.

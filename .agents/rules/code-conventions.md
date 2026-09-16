# 💻 Rule: Code Conventions

## Purpose
Define code styling, architectural boundaries, and TypeScript/framework standards across the Master-Bot monorepo.

---

## Workspace Structure & Responsibilities

| Workspace | Technology Stack | Boundary Rules |
| :--- | :--- | :--- |
| **`apps/bot`** | Node.js CommonJS, Sapphire Framework, `discord.js` v14 | Handles Discord gateway events, slash commands, voice audio streaming, and in-memory session hydration. |
| **`apps/dashboard`** | Next.js 15 (App Router), React 18, Tailwind CSS, tRPC v11 | Handles Web UI, server settings studios, telemetry views, and authenticated SSR. |
| **`packages/auth`** | NextAuth.js v5 beta, `@auth/prisma-adapter` | Discord OAuth session management and user authentication. |
| **`packages/db`** | Prisma ORM v5, `ioredis`, `ioredis-mock` | Dynamic database provider schema (PostgreSQL / SQLite) and Redis cache client with fallback. |
| **`packages/config/*`** | ESLint, Tailwind CSS configurations | Shared tooling and presets. |

---

## TypeScript Guidelines

1. **Explicit Types & Interfaces**:
   - Avoid `any` whenever possible; use typed interfaces or `unknown` with validation.
   - For loosely-typed legacy Sapphire pieces, annotate intentional type exceptions with explanatory comments.

2. **Nullish Coalescing (`??`)**:
   - Always prefer `??` over `||` when reading boolean, numeric, or nullable configuration values.

3. **Promise Handling**:
   - Always await Promises or explicitly mark unawaited promises with `void`.
   - In event listeners and handlers, attach `.catch()` to avoid unhandled rejections.

4. **Package Imports**:
   - Workspace imports must use package names (e.g. `@master-bot/db`), never deep relative traversals (`../../../packages/db`).
   - Use `node:path`, `node:fs`, `node:url` prefix for Node.js built-ins.

---

## Monorepo Dependency Rules

1. **Root `package.json`**:
   - Root is private (`"private": true`).
   - Root MUST NOT contain `"dependencies"`. All root tools MUST reside in `"devDependencies"` to satisfy `manypkg check`.
2. **Engines**:
   - Enforce `"node": ">=20.0.0"` monorepo-wide.

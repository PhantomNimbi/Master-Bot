# 🏗️ Skill: Monorepo Orchestrator (`monorepo-orchestrator`)

## Purpose
Manage Turborepo pipelines, pnpm workspace packages, cross-package dependencies, and compilation caches.

---

## 🛠️ Pipeline Guide

```bash
# Clean build artifacts
pnpm run clean

# Run linting with workspace validation
pnpm run lint

# Execute typecheck across all workspace packages
pnpm run type-check

# Run full test suite
pnpm test
```

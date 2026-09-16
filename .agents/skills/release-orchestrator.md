# 🚀 Skill: Release Orchestrator (`release-orchestrator`)

## Purpose
Manage versioning, release tags, tarball asset packaging, and GitHub releases.

---

## 🛠️ Release Workflow

```bash
# 1. Verify all quality gates pass
pnpm lint && pnpm type-check && pnpm test

# 2. Build production assets
pnpm build

# 3. Create tag and release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

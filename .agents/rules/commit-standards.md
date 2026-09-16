# 📝 Rule: Commit Standards

## Purpose
Enforce consistent, human-readable, and richly detailed commit messages across all agents and human contributors. Every commit should clearly explain **what** changed and **why**, using semantic emojis for rapid visual scanning in Git logs and GitHub timelines.

---

## Format Specification

```text
<emoji> <type>(<scope>): <imperative summary>

- <detailed bullet point explaining motivation and changes>
- <component or file impacts>
- <associated issue or PR references, e.g. Closes #123>
```

---

## 🏷️ Approved Types & Emojis

| Emoji | Type | Purpose | Example |
| :---: | :--- | :--- | :--- |
| ✨ | `feat` | New feature or capability | `✨ feat(audio): integrate embedded Lavalink v4 audio server` |
| 🐛 | `fix` | Bug fix or error resolution | `🐛 fix(dashboard): resolve INTERNA_URL typo in providers.tsx` |
| 📚 | `docs` | Documentation updates (README, wiki, comments) | `📚 docs(wiki): update Music.md with Lavalink embedded guide` |
| 💄 | `style` | Formatting, CSS, styling, whitespace | `💄 style(dashboard): polish dark mode card contrast` |
| ♻️ | `refactor` | Code restructuring without behavioral change | `♻️ refactor(db): extract dynamic schema preparation script` |
| ⚡️ | `perf` | Performance optimization | `⚡️ perf(redis): optimize connection timeout and fallback logic` |
| 🧪 | `test` | Adding or updating unit/integration tests | `🧪 test(db): add dual database and redis fallback unit tests` |
| 🔧 | `chore` | Tooling, workspace config, script updates | `🔧 chore(deps): import @helix-origin/vitest-suite v0.2.3` |
| 📦 | `build` | Build artifacts, packaging, tarballs | `📦 build(bot): bundle production distribution scripts` |
| 🚀 | `deploy` | Deployment blueprints (Docker, Render, Railway) | `🚀 deploy(docker): add dual DB support to Dockerfile` |
| 🔒 | `security` | Security fixes, auth, credential handling | `🔒 security(oauth): encrypt Discord refresh tokens in DB` |
| 🐙 | `github` | GitHub Actions, issues, PRs, CLI workflows | `🐙 github(ci): update workflow node-version matrix` |
| 🤖 | `agent` | Agent ecosystem, skills, rules, templates | `🤖 agent(ecosystem): rebuild comprehensive .agents architecture` |

---

## Structural Requirements

1. **Subject Line**:
   - Begins with an approved semantic emoji followed by a space.
   - Type is lowercase, scope is enclosed in parentheses: `<emoji> <type>(<scope>): <summary>`.
   - Written in imperative mood (e.g., "add", "fix", "update", NOT "added", "fixing").
   - Maximum 72 characters.
2. **Body**:
   - Separated from subject by a blank line.
   - Contains detailed, human-readable bullet points.
   - Mentions non-obvious design decisions, bug roots, and architectural context.
3. **Trailers**:
   - Closes or references issues: `Closes #123` or `Ref #456`.

---

## Detailed Examples

### Example 1: Feature Commit
```text
✨ feat(db): add external PostgreSQL and Redis support with internal fallbacks

- Implement packages/db/scripts/prepare-schema.mjs to dynamically inspect DATABASE_URL
- Configure PostgreSQL schema generation with @db.Text token fields when postgresql:// is detected
- Preserve zero-ops SQLite fallback when DATABASE_URL is omitted or points to file:./db.sqlite
- Enhance getRedisClient() in packages/db/index.ts to attempt real Redis connection before falling back to ioredis-mock
- Export getDatabaseProvider() and isUsingMockRedis() for runtime diagnostics
- Closes #828
```

### Example 2: Bug Fix Commit
```text
🐛 fix(dashboard): resolve INTERNA_URL environment variable typo and lint errors

- Correct process.env.INTERNA_URL typo in apps/dashboard/src/app/providers.tsx
- Replace logical OR with nullish coalescing operator in apps/dashboard/src/env.mjs
- Remove redundant type assertion and fill empty catch blocks in guild.ts router
- Remove unused env import in trpc.ts
- Resolves turbo lint failure across dashboard workspace
```

### Example 3: Agent Ecosystem Commit
```text
🤖 agent(ecosystem): construct extensive agent operating system with GitHub CLI and issue standards

- Create .agents/ architecture comprising 8 agents, 8 skills, 6 rules, and 6 templates
- Add gh-cli-expert skill covering issues, PRs, runs, releases, and auth
- Add issue-orchestrator skill with Mermaid diagram generators and sub-issue linking
- Add wiki-management skill and wiki-standards rule with GitHub link syntax
- Publish AGENTS.md in repository root as top-level index
```

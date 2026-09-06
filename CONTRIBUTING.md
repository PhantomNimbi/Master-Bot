# Contributing to Master-Bot 🤝

Thank you for your interest in contributing to **Master-Bot**! Master-Bot is an open-source Discord music and utility bot with a full-featured web dashboard. We welcome contributions of all kinds—bug fixes, new features, documentation improvements, UI polish, and performance optimizations.

Please take a few moments to review this guide before opening an issue or submitting a pull request.

---

## 📑 Table of Contents

1. [Code of Conduct](#-code-of-conduct)
2. [Project Architecture](#-project-architecture)
3. [Prerequisites & Development Setup](#-prerequisites--development-setup)
4. [Development Workflow](#-development-workflow)
5. [Coding Standards & Conventions](#-coding-standards--conventions)
6. [Commit & Pull Request Guidelines](#-commit--pull-request-guidelines)
7. [Reporting Bugs & Suggesting Features](#-reporting-bugs--suggesting-features)
8. [Community & Getting Help](#-community--getting-help)

---

## 📜 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Please be respectful, constructive, and considerate in all interactions—whether in issues, pull requests, or community discussions.

---

## 🏗️ Project Architecture

Master-Bot is organized as a [Turborepo](https://turbo.build/) workspace managed with [pnpm](https://pnpm.io/workspaces):

| Package / App               | Location         | Technology Stack                                           | Responsibility                                                            |
| :-------------------------- | :--------------- | :--------------------------------------------------------- | :------------------------------------------------------------------------ |
| **`@master-bot/bot`**       | `apps/bot`       | Sapphire Framework, `discord.js` v14, `lavalink-client` v2 | Discord client, music playback, slash commands, moderation, ticket system |
| **`@master-bot/dashboard`** | `apps/dashboard` | Plain Node.js HTTP server (embedded in the bot process)    | Web dashboard served from `apps/bot` — settings, stats, OAuth2 login      |
| **`@master-bot/db`**        | `packages/db`    | `node:sqlite` (Node 22+, zero dependencies)                | Hand-rolled SQLite data layer, typed CRUD, `data/bot.sqlite` (auto-created)|
| **`Launcher Scripts`**      | `scripts/`       | Node.js ESM (`.mjs`), child processes                      | Cross-platform dev & prod orchestration, port cleanup, log routing        |

---

## 🛠️ Prerequisites & Development Setup

### System Requirements

- **Node.js**: `>=22.0.0` (required for `node:sqlite` and the modern toolchain)
- **pnpm**: `>=8.0.0` (`npm install -g pnpm`)
- **Java**: Java 17 or higher (Java 21 LTS recommended for Lavalink v4)
- **SQLite**: None! The database is embedded, auto-created at `<root>/data/bot.sqlite`

### Setup Steps

1. **Fork and Clone the Repository**:

   ```bash
   git clone https://github.com/<your-username>/Master-Bot.git
   cd Master-Bot
   ```

2. **Install Dependencies**:

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

   Fill in your development credentials:
   - `DISCORD_TOKEN`: Bot token from the [Discord Developer Portal](https://discord.com/developers/applications)
   - `DISCORD_CLIENT_ID` & `DISCORD_CLIENT_SECRET`: Application OAuth2 credentials (dashboard login)
   - `PORT`: Single unified HTTP port (default: `3000`) shared by bot, dashboard and OAuth2 callbacks
   - `LAVA_ENABLED`: Set to `true` if you wish to run and test audio playback.

4. **Lavalink Configuration (Optional for non-music development)**:
   If developing audio features, copy `application.yml.example` to `application.yml` and ensure `Lavalink.jar` (v4) is present in the workspace root.

5. **Start Development Stack**:
   ```bash
   pnpm dev
   ```
   The unified launcher starts the single-process bot (embedding the dashboard), auto-creates the SQLite database on first start, optionally spawns Lavalink, clears lingering ports, and routes logs to `logs/`.

---

## 🔄 Development Workflow

### Branching Strategy

- Create a descriptive feature or bugfix branch from `main`:
  ```bash
  git checkout -b feat/my-new-feature
  # or
  git checkout -b fix/issue-description
  ```

### Validation & Verification Commands

Before committing or opening a pull request, always verify that your changes compile and pass type checks with **0 errors**:

```bash
# Type-check all packages
pnpm --filter @master-bot/db type-check
pnpm --filter @master-bot/dashboard type-check

# Compile the Discord bot application
pnpm --filter @master-bot/bot build

# Build the web dashboard
pnpm --filter @master-bot/dashboard build
```

---

## 📐 Coding Standards & Conventions

### General Principles

- **Root-Cause Fixes**: Always trace bugs to their fundamental architectural cause rather than implementing temporary workarounds.
- **Cross-Platform Parity**: Every feature, script, and command must function reliably across **Windows, macOS, and Linux**.
- **Non-Destructive Modifications**: Avoid deleting existing repository files unless they are verified to be unused dead code with zero imports.

### Bot & Discord.js Standards (`apps/bot`)

- **Sapphire Events**: Always use the official `Events` enum from `@sapphire/framework` (e.g. `Events.ChatInputCommandError`, `Events.ClientReady`). Never use magic strings.
- **Lightweight Preconditions**: Avoid slow, uncached database or network queries in preconditions to ensure Discord interaction tokens do not exceed the strict 3-second response deadline.
- **Interaction Reply Safety**: Use `interaction.deferReply()` for long-running commands, and ensure deferred interactions are updated via `interaction.editReply()`.
- **Structured Logging**: Route errors through `Logger.error()` (`apps/bot/src/lib/logger.ts`) with contextual metadata.

### Dashboard & API Standards (`apps/dashboard`)

- **Single-Process Embedding**: The dashboard runs as a plain Node.js `http` server embedded in the bot process (`apps/bot/src/server.ts`); it shares the unified `PORT` with the bot and OAuth2 callback route.
- **Typed Handlers**: Route handlers live in `apps/dashboard/src/router.ts` and call the bot through the `dataService` facade (`apps/bot/src/dataService.ts`) — no RPC framework, end-to-end TypeScript by import.
- **OAuth2 Sessions**: Auth/session logic in `apps/dashboard/src/auth/` (config + handlers) mirrors the NextAuth-compatible cookie format.

### Security & Git Hygiene

- **Zero Disk Secret Mutation**: Never write runtime credentials into `.env` at runtime.
- **Strict Gitignore**: Runtime files (`.env`, `.youtube-oauth.json`, `Lavalink.jar`, `logs/`) must **never** be tracked or committed to Git.

---

## 📦 Commit & Pull Request Guidelines

### Conventional Commits

All commit messages must strictly follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <short imperative summary in lowercase>
```

#### Allowed Types

- `feat`: A new feature or capability
- `fix`: A bug fix
- `docs`: Documentation updates or corrections
- `refactor`: Code restructure without changing behavior
- `perf`: A code change that improves performance
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates, tooling
- `build`: Changes affecting build system or external dependencies
- `ci`: Continuous integration configuration changes

#### Common Scopes

- `bot`, `dashboard`, `db`, `launcher`, `music`, `moderation`, `tickets`, `settings`, `deps`, `docs`

#### Examples

- `feat(music): add live ascii progress bar and auto-updating player embed`
- `fix(bot): replace followUp with editReply on deferred interactions`
- `docs(readme): update commands table and contributor references`

---

### Opening a Pull Request

1. **Title**: Use a clear, concise Conventional Commit format (e.g., `feat(tickets): add dynamic greeting placeholders`).
2. **Description**:
   - Explain the motivation and context behind the change.
   - List key modifications and affected components.
   - Include verification details (type-check output, screenshots for UI changes).
3. **Keep PRs Focused**: Avoid bundling unrelated refactors or formatting changes with feature implementations.

---

## 🐛 Reporting Bugs & Suggesting Features

### Reporting a Bug

- Check [existing GitHub Issues](https://github.com/galnir/Master-Bot/issues) to ensure the issue hasn't already been reported.
- Provide a clear, reproducible description including:
  - Operating system and Node.js / Java versions.
  - Relevant log snippets from `logs/bot.log` or `logs/lavalink.log`.
  - Exact steps to reproduce the behavior.

### Suggesting a Feature

- Open a Feature Request issue describing:
  - The problem or use case your feature solves.
  - Proposed slash command syntax or dashboard UI workflow.
  - Any architectural considerations.

---

## 💬 Community & Getting Help

- **Repository**: [galnir/Master-Bot](https://github.com/galnir/Master-Bot)
- **Documentation Wiki**: [Master-Bot Wiki](wiki/Home.md)
- **Discussions & Issues**: [GitHub Issues](https://github.com/galnir/Master-Bot/issues)

Thank you for helping make Master-Bot better for everyone! 🚀

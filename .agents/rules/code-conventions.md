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

---

## 📁 File Naming & Submodule Architecture

1. **Naming Conventions**:
   - **`camelCase` for All Files**: All TypeScript and JavaScript files across the project must follow `camelCase` naming conventions (e.g. `embedHandler.ts`, `banEmbed.ts`, `ticketEmbed.ts`, `searchSong.ts`, `statusManager.ts`).
   - **No `index.ts` Files in Subdirectories**: Under no circumstances should `index.ts` or `index.js` be placed inside subfolders of `apps/bot` (only the root entry point `apps/bot/src/index.ts` is permitted). This prevents Sapphire's automatic piece loader from treating `index.ts` as an unnamed command/listener piece, preventing loader crashes and ambiguous imports.
   - **Descriptive File Names**: Every file must accurately describe its exact usage (e.g. `banEmbed.ts`, `reactionGifEmbed.ts`).

2. **Submodules in `apps/bot/src/lib/`**:
   - Internal submodules and domain utilities reside under `apps/bot/src/lib/<submodule>/` (e.g. `lib/embeds/`, `lib/music/`, `lib/session/`, `lib/twitch/`, `lib/presence/`, `lib/games/`).
   - Submodules must export modular units directly and be imported via explicit file paths (e.g. `import { createBanEmbed } from '../../lib/embeds/commands/moderation/banEmbed'`).

---

## 🏛️ Unified Piece & Module Structures

### 1. Slash Command Structure (`apps/bot/src/commands/`)
Every command file must follow this standardized template:
```typescript
import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { createActionEmbed } from '../../lib/embeds/commands/<category>/<action>Embed';

@ApplyOptions<Command.Options>({
	name: '<command-name>',
	description: '<Brief description>',
	preconditions: ['isCommandDisabled']
})
export class ActionCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				// options...
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply();
		// Execution logic...
		const embed = createActionEmbed({ ... });
		return interaction.editReply({ embeds: [embed] });
	}
}

export const help: CommandHelp = {
	name: '<command-name>',
	category: '<category>',
	description: '<Detailed description>',
	usage: '/<command-name> ...',
	examples: ['/<command-name> ...']
};
```

### 2. Event Listener Structure (`apps/bot/src/listeners/`)
Every listener file must follow this standardized template:
```typescript
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({
	event: Events.<EventName>
})
export class EventListener extends Listener {
	public override async run(...args: unknown[]): Promise<void> {
		try {
			// Listener handling...
		} catch (error) {
			this.container.logger.error('Error handling event:', error);
		}
	}
}
```

### 3. Modular Embed Handler Structure (`apps/bot/src/lib/embeds/`)
Every embed generator must have its own dedicated file and adhere to this structure:
```typescript
import { EmbedBuilder, type User } from 'discord.js';
import { EmbedHandler } from '../../embedHandler';

export interface ActionEmbedOptions {
	targetUser: User;
	moderator: User;
	reason?: string;
}

export function createActionEmbed(options: ActionEmbedOptions): EmbedBuilder {
	return EmbedHandler.create({
		title: 'Action Performed',
		variant: 'brand',
		fields: [
			EmbedHandler.field('👤 User', `<@${options.targetUser.id}>`, true)
		],
		timestamp: true
	});
}
```

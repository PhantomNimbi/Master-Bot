import { createRequire } from 'node:module';
import { container } from '@sapphire/framework';
import { isCommandNameGloballyDisabled } from '../../preconditions/isCommandDisabled.js';
import type { CommandHelp } from './CommandHelp.js';

const require = createRequire(import.meta.url);

export class HelpRegistry {
	private static getHelpFromCommand(cmd: any): CommandHelp | undefined {
		if (cmd.help) return cmd.help;
		try {
			if (cmd.location?.full) {
				const mod = require(cmd.location.full);
				if (mod?.help) return mod.help;
			}
		} catch {}
		return undefined;
	}

	/**
	 * Retrieves all enabled commands formatted as CommandHelp items.
	 * Dynamically pulls from Sapphire's active command store and validates against
	 * isCommandDisabled state (including LAVA_ENABLED).
	 */
	public static getEnabledCommands(): CommandHelp[] {
		const commandsStore = container.stores.get('commands');
		const result: CommandHelp[] = [];

		commandsStore.forEach(cmd => {
			const helpMeta = this.getHelpFromCommand(cmd);
			const category =
				helpMeta?.category?.toLowerCase() ||
				cmd.category?.toLowerCase() ||
				'other';

			// Filter out disabled commands or categories using central isCommandDisabled check
			if (!cmd.enabled) return;
			if (
				isCommandNameGloballyDisabled(cmd.name) ||
				isCommandNameGloballyDisabled(category)
			) {
				return;
			}

			result.push({
				name: cmd.name,
				category,
				description:
					helpMeta?.description || cmd.description || `${cmd.name} command`,
				usage: helpMeta?.usage || `/${cmd.name}`,
				examples: helpMeta?.examples || [`/${cmd.name}`],
				options: helpMeta?.options || [],
				disabled: false
			});
		});

		return result.sort((a, b) => a.name.localeCompare(b.name));
	}

	/**
	 * Retrieves enabled commands grouped by category.
	 */
	public static getCategoriesMap(): Map<string, CommandHelp[]> {
		const commands = this.getEnabledCommands();
		const map = new Map<string, CommandHelp[]>();

		for (const cmd of commands) {
			if (!map.has(cmd.category)) {
				map.set(cmd.category, []);
			}
			map.get(cmd.category)!.push(cmd);
		}

		return map;
	}

	/**
	 * Finds a specific command help item by name, checking enablement against isCommandDisabled.
	 */
	public static getCommand(name: string): {
		help: CommandHelp | null;
		disabled: boolean;
	} {
		const cleanName = name.toLowerCase().replace(/^\//, '');
		const commandsStore = container.stores.get('commands');
		const cmd = commandsStore.get(cleanName);

		if (!cmd) {
			return { help: null, disabled: false };
		}

		const helpMeta = this.getHelpFromCommand(cmd);
		const category =
			helpMeta?.category?.toLowerCase() ||
			cmd.category?.toLowerCase() ||
			'other';
		const isDisabled =
			!cmd.enabled ||
			isCommandNameGloballyDisabled(cmd.name) ||
			isCommandNameGloballyDisabled(category);

		return {
			help: {
				name: cmd.name,
				category,
				description:
					helpMeta?.description || cmd.description || `${cmd.name} command`,
				usage: helpMeta?.usage || `/${cmd.name}`,
				examples: helpMeta?.examples || [`/${cmd.name}`],
				options: helpMeta?.options || [],
				disabled: isDisabled
			},
			disabled: isDisabled
		};
	}
}

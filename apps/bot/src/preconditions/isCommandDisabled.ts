import { ApplyOptions } from '@sapphire/decorators';
import {
	AsyncPreconditionResult,
	Precondition,
	PreconditionOptions
} from '@sapphire/framework';
import { ChatInputCommandInteraction } from 'discord.js';
import { trpcNode } from '../trpc';

import { container } from '@sapphire/framework';
import { env } from '../env';

interface DisabledCacheEntry {
	commands: string[];
	expiresAt: number;
}

const disabledCommandsCache = new Map<string, DisabledCacheEntry>();

/**
 * Checks whether a command or category is globally disabled dynamically
 * by querying the command's category in Sapphire against feature toggles.
 */
export function isCommandNameGloballyDisabled(
	commandOrCategoryName: string
): boolean {
	const isLavaEnabled =
		(env.LAVA_ENABLED || process.env.LAVA_ENABLED)?.toLowerCase() === 'true';
	const isGifsEnabled =
		(env.GIFS_ENABLED || process.env.GIFS_ENABLED)?.toLowerCase() !== 'false';
	const isTwitchEnabled =
		(env.TWITCH_ENABLED || process.env.TWITCH_ENABLED)?.toLowerCase() !==
		'false';
	const isNewsEnabled =
		(env.NEWS_ENABLED || process.env.NEWS_ENABLED)?.toLowerCase() !== 'false';
	// IGDB utilizes Twitch API credentials — respects IGDB_ENABLED if set, otherwise follows TWITCH_ENABLED
	const rawIgdb = env.IGDB_ENABLED || process.env.IGDB_ENABLED;
	const isIgdbEnabled = rawIgdb !== undefined
		? rawIgdb.toLowerCase() !== 'false'
		: isTwitchEnabled;

	const name = commandOrCategoryName.toLowerCase();

	// 1. Direct Category Checks
	if (!isLavaEnabled && name === 'music') return true;
	if (!isGifsEnabled && name === 'gifs') return true;
	if (!isTwitchEnabled && name === 'twitch') return true;

	// 2. Dynamic Command Category Lookup
	const cmd = container.stores.get('commands')?.get(name);
	if (cmd) {
		const category = cmd.category?.toLowerCase() || '';
		if (!isLavaEnabled && category === 'music') return true;
		if (!isGifsEnabled && category === 'gifs') return true;
		if (!isTwitchEnabled && category === 'twitch') return true;
		if (!isNewsEnabled && cmd.name === 'news') return true;
		if ((!isIgdbEnabled || !isTwitchEnabled) && cmd.name === 'game-search') return true;
	}

	return false;
}

@ApplyOptions<PreconditionOptions>({
	name: 'isCommandDisabled'
})
export class IsCommandDisabledPrecondition extends Precondition {
	public override async chatInputRun(
		interaction: ChatInputCommandInteraction
	): AsyncPreconditionResult {
		const commandID = interaction.commandId;
		const guildID = interaction.guildId as string;

		// Check global disable state via dynamic feature toggles
		if (isCommandNameGloballyDisabled(interaction.commandName)) {
			const cmd = container.stores.get('commands')?.get(interaction.commandName);
			const category = cmd?.category?.toLowerCase() || '';
			let featureName = 'This feature';
			if (category === 'music' || interaction.commandName === 'music') {
				featureName = 'Music & Audio commands';
			} else if (category === 'gifs' || interaction.commandName === 'gifs') {
				featureName = 'GIF commands';
			} else if (category === 'twitch' || interaction.commandName === 'twitch') {
				featureName = 'Twitch commands';
			} else if (interaction.commandName === 'game-search') {
				featureName = 'Game search (IGDB)';
			} else if (interaction.commandName === 'news') {
				featureName = 'News commands';
			}

			return this.error({
				message: `:warning: ${featureName} are currently disabled in configuration.`
			});
		}

		// Most likely a DM
		if (!guildID) {
			return this.ok();
		}

		try {
			const cached = disabledCommandsCache.get(guildID);
			let disabledCommands: string[];

			if (cached && cached.expiresAt > Date.now()) {
				disabledCommands = cached.commands;
			} else {
				const queryPromise = trpcNode.command.getDisabledCommands.query({
					guildId: guildID
				});
				const timeoutPromise = new Promise<never>((_, reject) =>
					setTimeout(() => reject(new Error('Precondition timeout')), 300)
				);

				const data = (await Promise.race([queryPromise, timeoutPromise])) as any;
				disabledCommands = data?.disabledCommands || [];
				disabledCommandsCache.set(guildID, {
					commands: disabledCommands,
					expiresAt: Date.now() + 60_000
				});
			}

			if (disabledCommands.includes(commandID)) {
				return this.error({
					message: 'This command is disabled'
				});
			}
		} catch {
			// On timeout or tRPC error, allow command to proceed to ensure Discord gets response within 3s
			return this.ok();
		}

		return this.ok();
	}
}

declare module '@sapphire/framework' {
	export interface Preconditions {
		isCommandDisabled: never;
	}
}

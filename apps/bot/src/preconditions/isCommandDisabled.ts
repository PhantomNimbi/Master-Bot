import { ApplyOptions } from '@sapphire/decorators';
import {
	AsyncPreconditionResult,
	Precondition,
	PreconditionOptions
} from '@sapphire/framework';
import { ChatInputCommandInteraction } from 'discord.js';
import { dataService } from '../dataService.js';

import { container } from '@sapphire/framework';
import {
	isGifsEnabled,
	isIgdbEnabled,
	isLavalinkEnabled,
	isNewsEnabled,
	isTwitchEnabled
} from '../env.js';

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
	const lavaEnabled = isLavalinkEnabled();
	const gifsEnabled = isGifsEnabled();
	const twitchEnabled = isTwitchEnabled();
	const newsEnabled = isNewsEnabled();
	// IGDB utilizes Twitch API credentials — respects IGDB_ENABLED if set, otherwise follows TWITCH_ENABLED
	const igdbEnabled = isIgdbEnabled();

	const name = commandOrCategoryName.toLowerCase();

	// 1. Direct Category Checks
	if (!lavaEnabled && name === 'music') return true;
	if (!gifsEnabled && name === 'gifs') return true;
	if (!twitchEnabled && name === 'twitch') return true;

	// 2. Dynamic Command Category Lookup
	const cmd = container.stores.get('commands')?.get(name);
	if (cmd) {
		const category = cmd.category?.toLowerCase() || '';
		if (!lavaEnabled && category === 'music') return true;
		if (!gifsEnabled && category === 'gifs') return true;
		if (!twitchEnabled && category === 'twitch') return true;
		if (!newsEnabled && cmd.name === 'news') return true;
		if ((!igdbEnabled || !twitchEnabled) && cmd.name === 'game-search')
			return true;
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
			const cmd = container.stores
				.get('commands')
				?.get(interaction.commandName);
			const category = cmd?.category?.toLowerCase() || '';
			let featureName = 'This feature';
			if (category === 'music' || interaction.commandName === 'music') {
				featureName = 'Music & Audio commands';
			} else if (category === 'gifs' || interaction.commandName === 'gifs') {
				featureName = 'GIF commands';
			} else if (
				category === 'twitch' ||
				interaction.commandName === 'twitch'
			) {
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
				const queryPromise = dataService.command.getDisabledCommands({
					guildId: guildID
				});
				const timeoutPromise = new Promise<never>((_, reject) =>
					setTimeout(() => reject(new Error('Precondition timeout')), 300)
				);

				const data = (await Promise.race([
					queryPromise,
					timeoutPromise
				])) as any;
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

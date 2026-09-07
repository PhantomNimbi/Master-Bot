import type { ChatInputCommandInteraction } from 'discord.js';

export type SetHandler = (
	interaction: ChatInputCommandInteraction
) => Promise<unknown>;
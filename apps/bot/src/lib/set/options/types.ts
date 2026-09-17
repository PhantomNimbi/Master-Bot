import type { ChatInputCommandInteraction } from 'discord.js';

export interface SetOption {
	name: string;
	label: string;
	description: string;
	execute(interaction: ChatInputCommandInteraction): Promise<unknown>;
}

import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'random',
	description: 'Generate a random number between two inputs!',
	preconditions: ['isCommandDisabled']
})
export class RandomCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addIntegerOption(option =>
					option
						.setName('min')
						.setDescription('What is the minimum number?')
						.setRequired(true)
				)
				.addIntegerOption(option =>
					option
						.setName('max')
						.setDescription('What is the maximum number?')
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const min = Math.ceil(interaction.options.getInteger('min', true));
		const max = Math.floor(interaction.options.getInteger('max', true));

		const rngEmbed = new EmbedBuilder().setTitle(
			`${Math.floor(Math.random() * (max - min + 1)) + min}`
		);

		return await interaction.reply({ embeds: [rngEmbed] });
	}
}

export const help: CommandHelp = {
	name: 'random',
	category: 'other',
	description: 'Generate a random number between two inputs!',
	usage: '/random <min> <max>',
	examples: ['/random min: value max: value'],
	options: [
		{
				"name": "min",
				"description": "What is the minimum number?",
				"required": true
		},
		{
				"name": "max",
				"description": "What is the maximum number?",
				"required": true
		}
]
};

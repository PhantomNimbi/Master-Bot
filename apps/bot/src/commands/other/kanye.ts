import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'kanye',
	description: 'Replies with a random Kanye quote',
	preconditions: ['isCommandDisabled']
})
export class KanyeCommand extends Command {
	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();
		try {
			const response = await fetch('https://api.kanye.rest/?format=json');
			const data = (await response.json()) as any;

			if (!data.quote)
				return await interaction.editReply({
					content: 'Something went wrong!'
				});

			const embed = new EmbedBuilder()
				.setColor('Orange')
				.setAuthor({
					name: 'Kanye Omari West',
					url: 'https://kanye.rest',
					iconURL: 'https://i.imgur.com/SsNoHVh.png'
				})
				.setDescription(data.quote)
				.setTimestamp()
				.setFooter({
					text: 'Powered by kanye.rest'
				});

			return await interaction.editReply({ embeds: [embed] });
		} catch {
			return await interaction.editReply({
				content: 'Something went wrong!'
			});
		}
	}

	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description
		});
	}
}

export const help: CommandHelp = {
	name: 'kanye',
	category: 'other',
	description: 'Replies with a random Kanye quote',
	usage: '/kanye',
	examples: ['/kanye'],
	options: []
};

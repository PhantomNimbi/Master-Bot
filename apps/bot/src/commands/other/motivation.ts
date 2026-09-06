import type { CommandHelp } from '../../lib/structures/CommandHelp.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'motivation',
	description: 'Replies with a motivational quote!',
	preconditions: ['isCommandDisabled']
})
export class MotivationCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description
		});
	}
	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();
		try {
			const response = await fetch('https://type.fit/api/quotes');
			const data = (await response.json()) as any[];

			if (!Array.isArray(data) || !data.length)
				return await interaction.editReply({
					content: 'Something went wrong!'
				});

			const randomQuote = data[Math.floor(Math.random() * data.length)];

			const embed = new EmbedBuilder()
				.setColor('Yellow')
				.setAuthor({
					name: 'Motivational Quote',
					url: 'https://type.fit',
					iconURL: 'https://i.imgur.com/Cnr6cQb.png'
				})
				.setDescription(
					`*"${randomQuote.text}"*\n\n-${randomQuote.author || 'Anonymous'}`
				)
				.setTimestamp()
				.setFooter({
					text: 'Powered by type.fit'
				});

			return await interaction.editReply({ embeds: [embed] });
		} catch {
			return await interaction.editReply({
				content: 'Something went wrong!'
			});
		}
	}
}

export const help: CommandHelp = {
	name: 'motivation',
	category: 'other',
	description: 'Replies with a motivational quote!',
	usage: '/motivation',
	examples: ['/motivation'],
	options: []
};

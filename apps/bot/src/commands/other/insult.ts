import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'insult',
	description: 'Replies with a mean insult',
	preconditions: ['isCommandDisabled']
})
export class InsultCommand extends Command {
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
			const response = await fetch(
				'https://evilinsult.com/generate_insult.php?lang=en&type=json'
			);
			const data = (await response.json()) as any;

			if (!data.insult)
				return await interaction.editReply({
					content: 'Something went wrong!'
				});

			const embed = new EmbedBuilder()
				.setColor('Red')
				.setAuthor({
					name: 'Evil Insult',
					url: 'https://evilinsult.com',
					iconURL: 'https://i.imgur.com/bOVpNAX.png'
				})
				.setDescription(data.insult)
				.setTimestamp()
				.setFooter({
					text: 'Powered by evilinsult.com'
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
	name: 'insult',
	category: 'other',
	description: 'Replies with a mean insult',
	usage: '/insult',
	examples: ['/insult'],
	options: []
};

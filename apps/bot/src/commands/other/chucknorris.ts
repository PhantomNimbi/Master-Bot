import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<Command.Options>({
	name: 'chucknorris',
	description: 'Get a satirical fact about Chuck Norris!',
	preconditions: ['isCommandDisabled']
})
export class ChuckNorrisCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder.setName(this.name).setDescription(this.description)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();
		try {
			const response = await fetch('https://api.chucknorris.io/jokes/random');
			const joke = (await response.json()) as any;

			if (!joke || !joke.value) {
				return await interaction.editReply({
					content: ':x: An error occurred, Chuck is investigating this!'
				});
			}

			const embed = new EmbedBuilder()
				.setColor('Orange')
				.setAuthor({
					name: 'Chuck Norris',
					url: 'https://chucknorris.io',
					iconURL: joke.icon_url || 'https://i.imgur.com/bOVpNAX.png'
				})
				.setDescription(joke.value)
				.setTimestamp()
				.setFooter({
					text: 'Powered by chucknorris.io'
				});
			return await interaction.editReply({ embeds: [embed] });
		} catch {
			return await interaction.editReply({
				content: ':x: An error occurred, Chuck is investigating this!'
			});
		}
	}
}

export const help: CommandHelp = {
	name: 'chucknorris',
	category: 'other',
	description: 'Get a satirical fact about Chuck Norris!',
	usage: '/chucknorris',
	examples: ['/chucknorris'],
	options: []
};

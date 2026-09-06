import type { CommandHelp } from '../../lib/structures/CommandHelp.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import Logger from '../../lib/logger.js';

@ApplyOptions<CommandOptions>({
	name: 'urban',
	description: 'Get definitions from urban dictionary',
	preconditions: ['GuildOnly', 'isCommandDisabled']
})
export class UrbanCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName('query')
						.setDescription('What term do you want to look up?')
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();
		const query = interaction.options.getString('query', true);
		try {
			const response = await axios.get(
				`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`
			);
			const list = response.data?.list;
			if (!Array.isArray(list) || list.length === 0) {
				return await interaction.editReply({
					content: `:x: No definitions found for "**${query}**".`
				});
			}

			const item = list[0];
			const definition =
				item.definition?.slice(0, 2048) || 'No definition available.';
			const embed = new EmbedBuilder()
				.setColor('DarkOrange')
				.setAuthor({
					name: 'Urban Dictionary',
					url: 'https://urbandictionary.com',
					iconURL: 'https://i.imgur.com/vdoosDm.png'
				})
				.setTitle(item.word || query)
				.setDescription(definition)
				.setURL(item.permalink || 'https://urbandictionary.com')
				.setTimestamp()
				.setFooter({
					text: 'Powered by UrbanDictionary'
				});

			return await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			Logger.error(error);
			return await interaction.editReply({
				content: ':x: Failed to deliver definition. Please try again later.'
			});
		}
	}
}

export const help: CommandHelp = {
	name: 'urban',
	category: 'other',
	description: 'Get definitions from urban dictionary',
	usage: '/urban <query>',
	examples: ['/urban query: salty'],
	options: [
		{
			name: 'query',
			description: 'What term do you want to look up?',
			required: true
		}
	]
};

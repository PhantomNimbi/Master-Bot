import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { searchGif } from '../../lib/gifs/searchGif';

@ApplyOptions<Command.Options>({
	name: 'gif',
	description: 'Search for any GIF or get a trending random GIF',
	preconditions: ['isCommandDisabled']
})
export class GifCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder => {
			builder.setName(this.name).setDescription(this.description);
			builder.addStringOption(option =>
				option
					.setName('query')
					.setDescription('Search keyword for the GIF (optional)')
					.setRequired(false)
			);
			return builder;
		});
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();
		const searchKeyword = interaction.options.getString('query') || 'trending';
		const gifUrl = await searchGif(searchKeyword);

		if (!gifUrl) {
			return await interaction.editReply({
				content: `:warning: No GIFs found for "**${searchKeyword}**".`
			});
		}

		const embed = new EmbedBuilder()
			.setColor(0x5865f2)
			.setTitle(`🎬 GIF: ${searchKeyword}`)
			.setImage(gifUrl)
			.setFooter({
				text: `Requested by ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL()
			});

		return await interaction.editReply({ embeds: [embed] });
	}
}

export const help: CommandHelp = {
	name: 'gif',
	category: 'gifs',
	description: 'Search for any GIF or get a trending random GIF',
	usage: '/gif [query: Keyword]',
	examples: ['/gif', '/gif query: cat dance'],
	options: [
		{
			name: 'query',
			description: 'Search keyword for the GIF',
			required: false
		}
	]
};

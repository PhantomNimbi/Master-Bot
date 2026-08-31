import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';
import { trpcNode } from '../../trpc';

@ApplyOptions<CommandOptions>({
	name: 'display-playlist',
	description: 'Display a saved playlist',
	preconditions: [
		'GuildOnly',
		'isCommandDisabled',
		'userInDB',
		'playlistExists'
	]
})
export class DisplayPlaylistCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName('playlist-name')
						.setDescription(
							'What is the name of the playlist you want to display?'
						)
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();
		const playlistName = interaction.options.getString('playlist-name', true);

		const interactionMember = interaction.member?.user;

		if (!interactionMember) {
			return await interaction.editReply({
				content: ':x: Something went wrong! Please try again later'
			});
		}

		const playlistQuery = await trpcNode.playlist.getPlaylist.query({
			name: playlistName,
			userId: interactionMember.id
		});

		const { playlist } = playlistQuery;

		if (!playlist) {
			return await interaction.editReply(
				':x: Something went wrong! Please try again soon'
			);
		}

		const baseEmbed = new EmbedBuilder().setColor('Purple').setAuthor({
			name: interaction.user.username,
			iconURL: interaction.user.displayAvatarURL()
		});

		new PaginatedFieldMessageEmbed()
			.setTitleField(`${playlistName} - Songs`)
			.setTemplate(baseEmbed)
			.setItems(playlist.songs)
			.formatItems((item: any) => `[${item.title}](${item.uri})`)
			.setItemsPerPage(5)
			.make()
			.run(interaction);

		return;
	}
}

export const help: CommandHelp = {
	name: 'display-playlist',
	category: 'music',
	description: 'Display a saved playlist',
	usage: '/display-playlist <playlist-name>',
	examples: ['/display-playlist playlist-name: Vibes'],
	options: [
		{
			name: 'playlist-name',
			description: 'What is the name of the playlist you want to display?',
			required: true
		}
	]
};

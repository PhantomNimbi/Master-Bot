import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';
import { EmbedBuilder } from 'discord.js';
import { trpcNode } from '../../trpc';

@ApplyOptions<CommandOptions>({
	name: 'my-playlists',
	description: "Display your custom playlists' names",
	preconditions: ['GuildOnly', 'isCommandDisabled', 'userInDB']
})
export class MyPlaylistsCommand extends Command {
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
		const interactionMember = interaction.member?.user;

		if (!interactionMember) {
			return await interaction.editReply({
				content: ':x: Something went wrong! Please try again later'
			});
		}

		const baseEmbed = new EmbedBuilder().setColor('Purple').setAuthor({
			name: interaction.user.username,
			iconURL: interaction.user.displayAvatarURL()
		});

		const playlistsQuery = await trpcNode.playlist.getAll.query({
			userId: interactionMember.id
		});

		if (!playlistsQuery || !playlistsQuery.playlists.length) {
			return await interaction.editReply(':x: You have no custom playlists');
		}

		new PaginatedFieldMessageEmbed()
			.setTitleField('Custom Playlists')
			.setTemplate(baseEmbed)
			.setItems(playlistsQuery.playlists)
			.formatItems((playlist: any) => playlist.name)
			.setItemsPerPage(5)
			.make()
			.run(interaction);

		return;
	}
}

export const help: CommandHelp = {
	name: 'my-playlists',
	category: 'music',
	description: 'Display your custom playlists',
	usage: '/my-playlists',
	examples: ['/my-playlists'],
	options: []
};

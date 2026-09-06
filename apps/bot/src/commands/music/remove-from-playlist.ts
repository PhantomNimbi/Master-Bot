import type { CommandHelp } from '../../lib/structures/CommandHelp.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { dataService } from '../../dataService.js';

@ApplyOptions<CommandOptions>({
	name: 'remove-from-playlist',
	description: 'Remove a song from a saved playlist',
	preconditions: [
		'GuildOnly',
		'isCommandDisabled',
		'userInDB',
		'playlistExists'
	]
})
export class RemoveFromPlaylistCommand extends Command {
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
							'What is the name of the playlist you want to remove from?'
						)
						.setRequired(true)
				)
				.addIntegerOption(option =>
					option
						.setName('location')
						.setDescription(
							'What is the index of the video you would like to delete from your saved playlist?'
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
		const location = interaction.options.getInteger('location', true);

		const interactionMember = interaction.member?.user;

		if (!interactionMember) {
			return await interaction.editReply(
				':x: Something went wrong! Please try again later'
			);
		}

		let playlist;
		try {
			const playlistQuery = await dataService.playlist.getPlaylist({
				name: playlistName,
				userId: interactionMember.id
			});

			playlist = playlistQuery.playlist;
		} catch (error) {
			return await interaction.editReply(':x: Something went wrong!');
		}

		const songs = playlist?.songs;

		if (!songs?.length) {
			return await interaction.editReply(`:x: **${playlistName}** is empty!`);
		}

		if (location > songs.length || location < 1) {
			return await interaction.editReply(':x: Please enter a valid index!');
		}

		const id = songs[location - 1].id;

		const song = await dataService.song.delete({
			id
		});

		if (!song?.song) {
			return await interaction.editReply(':x: Something went wrong!');
		}

		await interaction.editReply(
			`:wastebasket: Deleted **${song.song.title}** from **${playlistName}**`
		);
		return;
	}
}

export const help: CommandHelp = {
	name: 'remove-from-playlist',
	category: 'music',
	description: 'Remove a song from a saved playlist',
	usage: '/remove-from-playlist <playlist-name> <location>',
	examples: ['/remove-from-playlist playlist-name: Vibes location: 1'],
	options: [
		{
			name: 'playlist-name',
			description: 'What is the name of the playlist you want to remove from?',
			required: true
		},
		{
			name: 'location',
			description:
				'What is the index of the video you would like to delete from your saved playlist?',
			required: true
		}
	]
};

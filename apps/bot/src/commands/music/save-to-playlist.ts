import type { CommandHelp } from '../../lib/structures/CommandHelp.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import searchSong from '../../lib/music/searchSong.js';
import { dataService } from '../../dataService.js';
import Logger from '../../lib/logger.js';

@ApplyOptions<CommandOptions>({
	name: 'save-to-playlist',
	description: 'Save a song or a playlist to a custom playlist',
	preconditions: [
		'GuildOnly',
		'isCommandDisabled',
		'userInDB',
		'playlistExists'
	]
})
export class SaveToPlaylistCommand extends Command {
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
							'What is the name of the playlist you want to save to?'
						)
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName('url')
						.setDescription('What do you want to save to the custom playlist?')
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();
		const playlistName = interaction.options.getString('playlist-name', true);
		const url = interaction.options.getString('url', true);

		const interactionMember = interaction.member?.user;

		if (!interactionMember) {
			return await interaction.editReply(
				':x: Something went wrong! Please try again later'
			);
		}

		const playlistQuery = await dataService.playlist.getPlaylist({
			name: playlistName,
			userId: interactionMember.id
		});

		if (!playlistQuery.playlist) {
			return await interaction.editReply('Playlist does not exist');
		}

		const playlistId = playlistQuery.playlist.id;

		const songTuple = await searchSong(url, interaction.user);
		if (!songTuple[1].length) {
			return await interaction.editReply(songTuple[0]);
		}

		const songArray = songTuple[1];
		const songsToAdd = songArray.map((song: any) => ({
			length: song.length || 0,
			track: song.track || '',
			identifier: song.identifier || '',
			author: song.author || 'Unknown',
			isStream: Boolean(song.isStream),
			position: song.position || 0,
			title: song.title || 'Untitled',
			uri: song.uri || '',
			isSeekable: Boolean(song.isSeekable),
			sourceName: song.sourceName || 'youtube',
			thumbnail: song.thumbnail || '',
			added: Date.now(),
			playlistId: Number(playlistId)
		}));

		try {
			await dataService.song.createMany({
				songs: songsToAdd
			});

			return await interaction.editReply(`Added tracks to **${playlistName}**`);
		} catch (error) {
			Logger.error(error);
			return await interaction.editReply(':x: Something went wrong!');
		}
	}
}

export const help: CommandHelp = {
	name: 'save-to-playlist',
	category: 'music',
	description: 'Save a song or a playlist to a custom playlist',
	usage: '/save-to-playlist <playlist-name> <url>',
	examples: [
		'/save-to-playlist playlist-name: Vibes url: https://youtube.com/...'
	],
	options: [
		{
			name: 'playlist-name',
			description: 'What is the name of the playlist you want to save to?',
			required: true
		},
		{
			name: 'url',
			description: 'What do you want to save to the custom playlist?',
			required: true
		}
	]
};

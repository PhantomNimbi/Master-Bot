import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { container } from '@sapphire/framework';
import searchSong from '../../lib/music/searchSong';
import { updatePlayerEmbed } from '../../lib/music/buttonHandler';
import { Song } from '../../lib/music/classes/Song';
import { trpcNode } from '../../trpc';
import { GuildMember } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'play',
	description: 'Play any song or playlist from YouTube, Spotify and more!',
	preconditions: [
		'GuildOnly',
		'isCommandDisabled',
		'inVoiceChannel',
		'inPlayerVoiceChannel'
	]
})
export class PlayCommand extends Command {
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
						.setDescription(
							'What song or playlist would you like to listen to?'
						)
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName('is-custom-playlist')
						.setDescription('Is it a custom playlist?')
						.addChoices(
							{
								name: 'Yes',
								value: 'Yes'
							},
							{
								name: 'No',
								value: 'No'
							}
						)
				)
				.addStringOption(option =>
					option
						.setName('shuffle-playlist')
						.setDescription('Would you like to shuffle the playlist?')
						.addChoices(
							{
								name: 'Yes',
								value: 'Yes'
							},
							{
								name: 'No',
								value: 'No'
							}
						)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply().catch(() => {});

		const reply = async (payload: any) => {
			if (interaction.deferred || interaction.replied) {
				return await interaction.editReply(payload).catch(() => {});
			}
			return await interaction.reply(payload).catch(() => {});
		};

		const { client } = container;

		const query = interaction.options.getString('query', true);
		const isCustomPlaylist =
			interaction.options.getString('is-custom-playlist');

		const shufflePlaylist = interaction.options.getString('shuffle-playlist');

		const interactionMember = interaction.member?.user;

		if (!interactionMember) {
			return await reply(':x: Something went wrong! Please try again later');
		}

		const { music } = client;

		const voiceChannel = (interaction.member as GuildMember).voice.channel;

		// edge case - someone initiated the command but left the voice channel
		if (!voiceChannel) {
			return await reply({
				content: ':x: You need to be in a voice channel to use this command!'
			});
		}

		let queue = music.queues.get(interaction.guildId!);
		await queue.setTextChannelID(interaction.channel!.id);

		if (!queue.player || !queue.player.connected) {
			await queue.connect(voiceChannel.id);
		}

		let tracks: Song[] = [];
		let message: string = '';

		if (isCustomPlaylist == 'Yes') {
			const data = await trpcNode.playlist.getPlaylist.query({
				userId: interactionMember.id,
				name: query
			});

			const { playlist } = data;

			if (!playlist) {
				return await reply(`:x: You have no such playlist!`);
			}
			if (!playlist.songs.length) {
				return await reply(`:x: **${query}** is empty!`);
			}

			const { songs } = playlist;
			tracks.push(...songs.map(song => new Song(song)));
			message = `Added songs from **${playlist.name}** to the queue!`;
		} else {
			const trackTuple = await searchSong(query, interaction.user);
			if (!trackTuple[1].length) {
				return await reply({ content: trackTuple[0] as string });
			}
			message = trackTuple[0];
			tracks.push(...trackTuple[1]);
		}

		const currentTrack = await queue.getCurrentTrack();
		const isPlaying = Boolean(currentTrack);

		await queue.add(tracks);
		if (shufflePlaylist == 'Yes') {
			await queue.shuffleTracks();
		}

		if (isPlaying) {
			await updatePlayerEmbed(queue);
			return await reply({
				content: message,
				flags: ['SuppressEmbeds']
			});
		}

		await queue.next();
		return await reply({
			content: message,
			flags: ['SuppressEmbeds']
		});
	}
}

export const help: CommandHelp = {
	name: 'play',
	category: 'music',
	description: 'Play any song or playlist from YouTube, Spotify and more!',
	usage: '/play <query> [is-custom-playlist] [shuffle-playlist]',
	examples: [
		'/play query: value is-custom-playlist: value shuffle-playlist: value'
	],
	options: [
		{
			name: 'query',
			description: 'What song or playlist would you like to listen to?',
			required: true
		},
		{
			name: 'is-custom-playlist',
			description: 'Is it a custom playlist?',
			required: false
		},
		{
			name: 'shuffle-playlist',
			description: 'Would you like to shuffle the playlist?',
			required: false
		}
	]
};

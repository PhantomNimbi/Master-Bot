import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { container } from '@sapphire/framework';
import { NowPlayingEmbed } from '../../lib/music/nowPlayingEmbed';
import { embedButtons } from '../../lib/music/buttonHandler';

@ApplyOptions<CommandOptions>({
	name: 'now-playing',
	description: 'Display the currently playing song and interactive music controls',
	preconditions: [
		'GuildOnly',
		'isCommandDisabled',
		'inVoiceChannel',
		'playerIsPlaying',
		'inPlayerVoiceChannel'
	]
})
export class NowPlayingCommand extends Command {
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
		await interaction.deferReply({ ephemeral: true });

		const { client } = container;
		const queue = client.music.queues.get(interaction.guildId!);
		if (!queue) {
			return await interaction.editReply({
				content: ':x: There is no active music queue in this server.'
			});
		}

		const currentTrack = await queue.getCurrentTrack();
		if (!currentTrack) {
			return await interaction.editReply({
				content: ':information_source: No song is currently playing.'
			});
		}

		const tracks = await queue.tracks();
		const nowPlaying = new NowPlayingEmbed(
			currentTrack,
			queue.player?.position ?? 0,
			currentTrack.length ?? 0,
			queue.player?.volume ?? 100,
			tracks,
			tracks.at(-1),
			queue.paused
		);

		const embed = await nowPlaying.NowPlayingEmbed();

		// Post/refresh the interactive player embed with buttons
		await embedButtons(embed, queue, currentTrack);

		return await interaction.editReply({
			content: ':white_check_mark: Reposted Now Playing embed with interactive controls.'
		});
	}
}

export const help: CommandHelp = {
	name: 'now-playing',
	category: 'music',
	description: 'Display the currently playing song and interactive music controls',
	usage: '/now-playing',
	examples: ['/now-playing'],
	options: []
};

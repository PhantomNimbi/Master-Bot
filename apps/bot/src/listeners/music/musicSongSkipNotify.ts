import type { Song } from '../../lib/music/classes/Song';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, type ListenerOptions } from '@sapphire/framework';
import { ChatInputCommandInteraction } from 'discord.js';

@ApplyOptions<ListenerOptions>({
	name: 'musicSongSkipNotify'
})
export class MusicSongSkipNotifyListener extends Listener {
	public override async run(
		interaction: ChatInputCommandInteraction,
		track: Song
	): Promise<void> {
		if (interaction.replied || interaction.deferred) return;
		const message = track
			? `:white_check_mark: Skipped [**${track.title}**](<${track.uri}>).`
			: ':white_check_mark: Skipped the current track.';
		await interaction.reply({ content: message });
	}
}

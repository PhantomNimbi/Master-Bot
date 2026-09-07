import { ApplyOptions } from '@sapphire/decorators';
import {
	AsyncPreconditionResult,
	Precondition,
	PreconditionOptions
} from '@sapphire/framework';
import type { ChatInputCommandInteraction, GuildMember } from 'discord.js';

@ApplyOptions<PreconditionOptions>({
	name: 'playlistExists'
})
export class PlaylistExists extends Precondition {
	public override async chatInputRun(
		interaction: ChatInputCommandInteraction
	): AsyncPreconditionResult {
		const playlistName = interaction.options.getString('playlist-name', true);

		const guildMember = interaction.member as GuildMember;

		const { playlist } = this.container.client.session.playlists.getPlaylist({
			name: playlistName,
			guildId: interaction.guildId ?? '',
			userId: guildMember.id
		});

		return playlist
			? this.ok()
			: this.error({
					message: `You have no playlist named **${playlistName}**`
				});
	}
}

declare module '@sapphire/framework' {
	export interface Preconditions {
		playlistExists: never;
	}
}


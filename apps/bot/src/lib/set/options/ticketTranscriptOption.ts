import { container } from '@sapphire/framework';
import type { TextChannel } from 'discord.js';
import type { SetOption } from './types';

export const ticketTranscriptOption: SetOption = {
	name: 'ticket-transcript',
	label: 'Ticket Transcript',
	description: 'Set dedicated channel to archive ticket transcripts when closed',
	execute: async interaction => {
		const channel = interaction.options.getChannel('channel') as TextChannel | null;
		if (!channel) {
			return await interaction.editReply({
				content:
					':x: Please provide the `channel` option.\n> Example: `/set setting: ticket-transcript channel: #ticket-transcripts`'
			});
		}

		await container.client.session.tickets.setTranscriptChannel({
			guildId: interaction.guildId!,
			channelId: channel.id
		});

		return await interaction.editReply({
			content: `:white_check_mark: Support ticket transcripts will be archived in <#${channel.id}>.`
		});
	}
};

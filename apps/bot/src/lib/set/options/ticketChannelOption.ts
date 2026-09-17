import { container } from '@sapphire/framework';
import type { TextChannel } from 'discord.js';
import type { SetOption } from './types';

export const ticketChannelOption: SetOption = {
	name: 'ticket-channel',
	label: 'Ticket Channel',
	description: 'Set channel where support ticket threads or panels are hosted',
	execute: async interaction => {
		const channel = interaction.options.getChannel('channel') as TextChannel | null;
		if (!channel) {
			return await interaction.editReply({
				content:
					':x: Please provide the `channel` option.\n> Example: `/set setting: ticket-channel channel: #support`'
			});
		}

		await container.client.session.tickets.setChannel({
			guildId: interaction.guildId!,
			channelId: channel.id
		});

		return await interaction.editReply({
			content: `:white_check_mark: Support ticket panel channel set to <#${channel.id}>.`
		});
	}
};

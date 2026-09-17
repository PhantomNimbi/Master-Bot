import { container } from '@sapphire/framework';
import type { SetOption } from './types';

export const logChannelOption: SetOption = {
	name: 'log-channel',
	label: 'Log Channel',
	description: 'Set audit/moderation log channel',
	execute: async interaction => {
		const channel = interaction.options.getChannel('channel');
		if (!channel) {
			return await interaction.editReply({
				content:
					':x: Please provide the `channel` option.\n> Example: `/set setting: log-channel channel: #mod-logs`'
			});
		}

		await container.client.session.guildData.setLogChannel({
			guildId: interaction.guildId!,
			channelId: channel.id
		});

		return await interaction.editReply({
			content: `:white_check_mark: Server audit & moderation logs enabled and routed to <#${channel.id}>.`
		});
	}
};

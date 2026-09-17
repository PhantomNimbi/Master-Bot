import { container } from '@sapphire/framework';
import type { SetOption } from './types';

export const welcomeChannelOption: SetOption = {
	name: 'welcome-channel',
	label: 'Welcome Channel',
	description: 'Set the text channel for welcome greetings',
	execute: async interaction => {
		const channel = interaction.options.getChannel('channel');
		if (!channel) {
			return await interaction.editReply({
				content:
					':x: Please provide the channel option.\n> Example: /set setting: welcome-channel channel: #welcome'
			});
		}

		await container.client.session.welcomeMessages.setChannel({
			guildId: interaction.guildId!,
			channelId: channel.id
		});

		return await interaction.editReply({
			content: `:white_check_mark: Welcome messages will now be sent in <#${channel.id}>.`
		});
	}
};

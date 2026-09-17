import { container } from '@sapphire/framework';
import type { SetOption } from './types';

export const welcomeMessageOption: SetOption = {
	name: 'welcome-message',
	label: 'Welcome Message',
	description: 'Set custom greeting message (variables: {user}, {server}, {memberCount})',
	execute: async interaction => {
		const message =
			interaction.options.getString('value') ??
			interaction.options.getString('message');

		if (!message) {
			return await interaction.editReply({
				content:
					':x: Please provide the `value` option with your custom welcome message.\n> Example: `/set setting: welcome-message value: Welcome {user} to {server}!`'
			});
		}

		await container.client.session.welcomeMessages.setMessage({
			guildId: interaction.guildId!,
			message
		});

		return await interaction.editReply({
			content: `:white_check_mark: Custom welcome message updated!\n\n**Preview:**\n> ${message}`
		});
	}
};

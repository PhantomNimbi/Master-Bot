import { container } from '@sapphire/framework';
import type { SetOption } from './types';

export const welcomeToggleOption: SetOption = {
	name: 'welcome-toggle',
	label: 'Welcome Toggle',
	description: 'Enable or disable welcome greeting messages',
	execute: async interaction => {
		const enabled = interaction.options.getBoolean('enabled');
		if (enabled === null || enabled === undefined) {
			return await interaction.editReply({
				content:
					':x: Please provide the `enabled` option (`True` or `False`).\n> Example: `/set setting: welcome-toggle enabled: True`'
			});
		}

		await container.client.session.welcomeMessages.toggle({
			guildId: interaction.guildId!,
			status: enabled
		});

		return await interaction.editReply({
			content: `:white_check_mark: Welcome message system is now **${
				enabled ? 'ENABLED' : 'DISABLED'
			}**.`
		});
	}
};

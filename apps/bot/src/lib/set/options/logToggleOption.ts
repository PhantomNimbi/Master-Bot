import { container } from '@sapphire/framework';
import type { SetOption } from './types';

export const logToggleOption: SetOption = {
	name: 'log-toggle',
	label: 'Log Toggle',
	description: 'Toggle server audit and moderation logging',
	execute: async interaction => {
		const enabled = interaction.options.getBoolean('enabled');
		if (enabled === null || enabled === undefined) {
			return await interaction.editReply({
				content:
					':x: Please provide the `enabled` option (`True` or `False`).\n> Example: `/set setting: log-toggle enabled: True`'
			});
		}

		await container.client.session.guildData.toggleLogChannel({
			guildId: interaction.guildId!,
			status: enabled
		});

		return await interaction.editReply({
			content: `:white_check_mark: Server audit & moderation logging is now **${
				enabled ? 'ENABLED' : 'DISABLED'
			}**.`
		});
	}
};

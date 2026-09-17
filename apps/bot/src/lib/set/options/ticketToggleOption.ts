import { container } from '@sapphire/framework';
import type { SetOption } from './types';

export const ticketToggleOption: SetOption = {
	name: 'ticket-toggle',
	label: 'Ticket Toggle',
	description: 'Enable or disable the support ticket system',
	execute: async interaction => {
		const enabled = interaction.options.getBoolean('enabled');
		if (enabled === null || enabled === undefined) {
			return await interaction.editReply({
				content:
					':x: Please provide the `enabled` option (`True` or `False`).\n> Example: `/set setting: ticket-toggle enabled: True`'
			});
		}

		await container.client.session.tickets.toggle({
			guildId: interaction.guildId!,
			status: enabled
		});

		return await interaction.editReply({
			content: `:white_check_mark: Support ticket system is now **${
				enabled ? 'ENABLED' : 'DISABLED'
			}**.`
		});
	}
};

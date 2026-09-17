import { container } from '@sapphire/framework';
import type { Role } from 'discord.js';
import type { SetOption } from './types';

export const ticketRoleOption: SetOption = {
	name: 'ticket-role',
	label: 'Ticket Role',
	description: 'Assign staff/moderator role with ticket management permissions',
	execute: async interaction => {
		const role = interaction.options.getRole('role') as Role | null;
		if (!role) {
			return await interaction.editReply({
				content:
					':x: Please provide the `role` option.\n> Example: `/set setting: ticket-role role: @SupportTeam`'
			});
		}

		await container.client.session.tickets.setRole({
			guildId: interaction.guildId!,
			roleId: role.id
		});

		return await interaction.editReply({
			content: `:white_check_mark: Support ticket manager role set to <@&${role.id}>.`
		});
	}
};

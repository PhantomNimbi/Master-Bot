import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import {
	createDashboardEmbed,
	createDashboardUnavailableEmbed
} from '../../lib/embeds/commands/other/dashboardEmbed';
import { getApplicationOwnerUser } from '../../lib/structures/owner';

@ApplyOptions<Command.Options>({
	name: 'dashboard',
	description: 'Get a link to the web dashboard',
	preconditions: ['isCommandDisabled']
})
export class DashboardCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const publicUrl = process.env.PUBLIC_URL?.trim() || '';
		const rawInternal = process.env.INTERNAL_URL?.trim() || '';
		const internalUrl = rawInternal
			? rawInternal.startsWith('http://') || rawInternal.startsWith('https://')
				? rawInternal
				: `http://${rawInternal}`
			: '';

		if (!publicUrl && !internalUrl) {
			const errorEmbed = createDashboardUnavailableEmbed(interaction.user);
			return interaction.reply({
				embeds: [errorEmbed],
				ephemeral: true
			});
		}

		let isOwner = false;
		if (internalUrl) {
			const ownerUser = await getApplicationOwnerUser(this.container.client);
			isOwner = Boolean(ownerUser && interaction.user.id === ownerUser.id);
		}

		const embed = createDashboardEmbed({
			publicUrl,
			internalUrl,
			user: interaction.user,
			isOwner
		});

		return interaction.reply({ embeds: [embed] });
	}
}

export const help: CommandHelp = {
	name: 'dashboard',
	category: 'other',
	description: 'Get a link to the web dashboard',
	usage: '/dashboard',
	examples: ['/dashboard'],
	options: []
};

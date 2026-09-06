import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { getApplicationOwnerUser } from '../../lib/music/youtubeOAuth';

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
		const publicUrl = process.env.NEXTAUTH_URL || '';
		const internalUrl = process.env.NEXTAUTH_URL_INTERNAL || '';

		if (!publicUrl && !internalUrl) {
			return interaction.reply({
				content:
					':information_source: The dashboard is not configured for this bot instance.',
				ephemeral: true
			});
		}

		const fields: { name: string; value: string; inline?: boolean }[] = [];

		if (publicUrl) {
			fields.push({
				name: '🔗 Open the Dashboard',
				value: `[Click here to open the dashboard](${publicUrl})`,
				inline: false
			});
		}

		if (internalUrl) {
			const ownerUser = await getApplicationOwnerUser(this.container.client);
			if (ownerUser && interaction.user.id === ownerUser.id) {
				fields.push({
					name: '🏠 Internal Link (Owner)',
					value: `[Open internal dashboard](${internalUrl})`,
					inline: false
				});
			}
		}

		const embed = new EmbedBuilder()
			.setTitle('🌐 Dashboard')
			.setDescription(
				'Manage your server settings, view logs, and more through the web dashboard.'
			)
			.setColor('Purple')
			.addFields(fields)
			.setFooter({
				text: `Requested by ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL()
			})
			.setTimestamp();

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

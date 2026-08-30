import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

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
		const dashboardUrl =
			process.env.NEXTAUTH_URL ||
			process.env.NEXTAUTH_URL_INTERNAL ||
			'';

		if (!dashboardUrl) {
			return interaction.reply({
				content:
					':information_source: The dashboard is not configured for this bot instance.',
				ephemeral: true
			});
		}

		const embed = new EmbedBuilder()
			.setTitle('🌐 Dashboard')
			.setDescription(
				'Manage your server settings, view logs, and more through the web dashboard.'
			)
			.setColor('Purple')
			.addFields({
				name: '🔗 Link',
				value: dashboardUrl,
				inline: false
			})
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

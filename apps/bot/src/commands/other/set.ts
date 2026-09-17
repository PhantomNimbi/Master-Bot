import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import {
	ChannelType,
	PermissionFlagsBits,
	type ChatInputCommandInteraction,
	type GuildMember
} from 'discord.js';
import Logger from '../../lib/logger';
import { getSetOption, getAllSetOptions } from '../../lib/set/options/registry';

@ApplyOptions<CommandOptions>({
	name: 'set',
	description:
		'Configure server settings (Welcome, Twitch, YouTube, Logging, Tickets, Volume)',
	preconditions: ['GuildOnly', 'isCommandDisabled']
})
export class SetCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder => {
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(opt => {
					opt
						.setName('setting')
						.setDescription('Setting to configure or view (defaults to view)')
						.setRequired(false);

					for (const setting of getAllSetOptions()) {
						opt.addChoices({
							name: `${setting.label} - ${setting.description}`.slice(0, 100),
							value: setting.name
						});
					}
					return opt;
				})
				.addChannelOption(opt =>
					opt
						.setName('channel')
						.setDescription('Target text or forum channel')
						.setRequired(false)
						.addChannelTypes(
							ChannelType.GuildText,
							ChannelType.GuildForum
						)
				)
				.addStringOption(opt =>
					opt
						.setName('value')
						.setDescription('Text value (welcome message, Twitch streamer, YouTube handle)')
						.setRequired(false)
				)
				.addBooleanOption(opt =>
					opt
						.setName('enabled')
						.setDescription('Enable or disable setting (for toggles)')
						.setRequired(false)
				)
				.addRoleOption(opt =>
					opt
						.setName('role')
						.setDescription('Staff/moderator role (for ticket system)')
						.setRequired(false)
				)
				.addIntegerOption(opt =>
					opt
						.setName('number')
						.setDescription('Numeric value (e.g. volume 1-100)')
						.setRequired(false)
						.setMinValue(1)
						.setMaxValue(100)
				)
				.addStringOption(opt =>
					opt
						.setName('alerts')
						.setDescription('YouTube alert type')
						.setRequired(false)
						.addChoices(
							{ name: 'All (Streams & Uploads)', value: 'all' },
							{ name: 'Live Streams Only', value: 'streams' },
							{ name: 'Video Uploads Only', value: 'uploads' }
						)
				);
			return builder;
		});
	}

	public override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const member = interaction.member as GuildMember;

		if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
			return await interaction.reply({
				content:
					':x: You must have the `Manage Server` permission to configure bot settings.',
				ephemeral: true
			});
		}

		await interaction.deferReply();

		const settingKey = interaction.options.getString('setting') ?? 'view';
		const optionHandler = getSetOption(settingKey);

		try {
			if (optionHandler) {
				return await optionHandler.execute(interaction);
			}
			return await interaction.editReply({
				content: `:warning: Unknown setting option: \`${settingKey}\`. Use \`/set\` to view settings.`
			});
		} catch (error) {
			Logger.error(error);
			if (interaction.deferred || interaction.replied) {
				return await interaction.editReply({
					content: ':x: An error occurred while processing settings.'
				});
			}
			return await interaction.reply({
				content: ':x: An error occurred while processing settings.',
				ephemeral: true
			});
		}
	}
}

export const help: CommandHelp = {
	name: 'set',
	category: 'other',
	description:
		'Configure server settings (Welcome, Twitch, YouTube, Logging, Tickets, Volume)',
	usage:
		'/set [setting: Setting] [channel: #channel] [value: Text] [enabled: True/False] [role: @Role] [number: 1-100] [alerts: Type]',
	examples: [
		'/set',
		'/set setting: view',
		'/set setting: welcome-channel channel: #welcome',
		'/set setting: welcome-message value: Welcome {user} to {server}!',
		'/set setting: welcome-toggle enabled: True',
		'/set setting: twitch-add value: shroud channel: #streams',
		'/set setting: youtube-add value: @MrBeast channel: #videos alerts: all',
		'/set setting: log-channel channel: #mod-logs',
		'/set setting: ticket-channel channel: #support',
		'/set setting: ticket-panel',
		'/set setting: ticket-role role: @SupportTeam',
		'/set setting: default-volume number: 80'
	],
	options: [
		{
			name: 'setting',
			description: 'Setting to view or configure (defaults to view)',
			required: false
		},
		{
			name: 'channel',
			description: 'Target text or forum channel',
			required: false
		},
		{
			name: 'value',
			description:
				'Text parameter (e.g. welcome message, streamer name, YouTube handle)',
			required: false
		},
		{
			name: 'enabled',
			description: 'Enable or disable toggle setting',
			required: false
		},
		{
			name: 'role',
			description: 'Staff/moderator role for ticket system',
			required: false
		},
		{
			name: 'number',
			description: 'Numeric value (e.g. volume 1-100)',
			required: false
		},
		{
			name: 'alerts',
			description: 'YouTube alert type (all, streams, uploads)',
			required: false
		}
	]
};

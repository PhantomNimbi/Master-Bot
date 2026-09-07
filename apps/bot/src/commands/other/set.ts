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
import { checkTwitchEnabled } from '../../lib/set/twitch';
import {
	handleWelcomeChannel,
	handleWelcomeMessage,
	handleWelcomeToggle,
	handleWelcomeTest
} from '../../lib/set/welcome';
import {
	handleTwitchAdd,
	handleTwitchRemove,
	handleTwitchList
} from '../../lib/set/twitch';
import {
	handleLogChannel,
	handleLogToggle,
	handleLogDisable
} from '../../lib/set/logging';
import {
	handleTicketChannel,
	handleTicketToggle,
	handleTicketPanel,
	handleTicketTranscript,
	handleTicketTranscriptDisable,
	handleTicketRole,
	handleTicketRoleDisable
} from '../../lib/set/tickets';
import { handleDefaultVolume } from '../../lib/set/volume';
import { handleView } from '../../lib/set/view';

const subcommandHandlers: Record<string, (interaction: ChatInputCommandInteraction) => Promise<unknown>> = {
	'welcome-channel': handleWelcomeChannel,
	'welcome-message': handleWelcomeMessage,
	'welcome-toggle': handleWelcomeToggle,
	'welcome-test': handleWelcomeTest,
	'twitch-add': handleTwitchAdd,
	'twitch-remove': handleTwitchRemove,
	'twitch-list': handleTwitchList,
	'log-channel': handleLogChannel,
	'log-toggle': handleLogToggle,
	'log-disable': handleLogDisable,
	'ticket-channel': handleTicketChannel,
	'ticket-toggle': handleTicketToggle,
	'ticket-panel': handleTicketPanel,
	'ticket-transcript': handleTicketTranscript,
	'ticket-transcript-disable': handleTicketTranscriptDisable,
	'ticket-role': handleTicketRole,
	'ticket-role-disable': handleTicketRoleDisable,
	'default-volume': handleDefaultVolume,
	view: handleView
};

@ApplyOptions<CommandOptions>({
	name: 'set',
	description: 'Configure server settings (Welcome, Twitch, Logging, Volume)',
	preconditions: ['GuildOnly', 'isCommandDisabled']
})
export class SetCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		const twitchEnabled = checkTwitchEnabled();

		registry.registerChatInputCommand(builder => {
			builder
				.setName(this.name)
				.setDescription(this.description)
				// Welcome Settings
				.addSubcommand(sub =>
					sub
						.setName('welcome-channel')
						.setDescription('Set the text channel for welcome greetings')
						.addChannelOption(opt =>
							opt
								.setName('channel')
								.setDescription('Target text channel')
								.setRequired(true)
								.addChannelTypes(ChannelType.GuildText)
						)
				)
				.addSubcommand(sub =>
					sub
						.setName('welcome-message')
						.setDescription(
							'Set custom welcome text ({user}, {username}, {server}, {position})'
						)
						.addStringOption(opt =>
							opt
								.setName('message')
								.setDescription('Custom message text')
								.setRequired(true)
								.setMinLength(4)
								.setMaxLength(500)
						)
				)
				.addSubcommand(sub =>
					sub
						.setName('welcome-toggle')
						.setDescription('Enable or disable automatic welcome messages')
						.addBooleanOption(opt =>
							opt
								.setName('enabled')
								.setDescription('True to enable, False to disable')
								.setRequired(true)
						)
				)
				.addSubcommand(sub =>
					sub
						.setName('welcome-test')
						.setDescription(
							'Send a test welcome message to preview your settings'
						)
				)
				// Logging Settings
				.addSubcommand(sub =>
					sub
						.setName('log-channel')
						.setDescription(
							'Set the text channel for server audit / moderation logs'
						)
						.addChannelOption(opt =>
							opt
								.setName('channel')
								.setDescription('Target text channel')
								.setRequired(true)
								.addChannelTypes(ChannelType.GuildText)
						)
				)
				.addSubcommand(sub =>
					sub
						.setName('log-toggle')
						.setDescription('Enable or disable server audit / event logging')
						.addBooleanOption(opt =>
							opt
								.setName('enabled')
								.setDescription('Set logging active or inactive')
								.setRequired(true)
						)
				)
				.addSubcommand(sub =>
					sub
						.setName('log-disable')
						.setDescription('Disable server audit / event logging')
				)
				// Ticket System Settings
				.addSubcommand(sub =>
					sub
						.setName('ticket-channel')
						.setDescription(
							'Set the text channel where the ticket panel will be located'
						)
						.addChannelOption(opt =>
							opt
								.setName('channel')
								.setDescription('Target text channel')
								.setRequired(true)
								.addChannelTypes(ChannelType.GuildText)
						)
				)
				.addSubcommand(sub =>
					sub
						.setName('ticket-toggle')
						.setDescription('Enable or disable the support ticket system')
						.addBooleanOption(opt =>
							opt
								.setName('enabled')
								.setDescription('Set ticket system active or inactive')
								.setRequired(true)
						)
				)
				.addSubcommand(sub =>
					sub
						.setName('ticket-panel')
						.setDescription(
							'Post the interactive support ticket panel embed with button'
						)
				)
				.addSubcommand(sub =>
					sub
						.setName('ticket-transcript')
						.setDescription(
							'Set channel where closed ticket transcript logs are archived'
						)
						.addChannelOption(opt =>
							opt
								.setName('channel')
								.setDescription('Target transcript channel')
								.setRequired(true)
								.addChannelTypes(ChannelType.GuildText)
						)
				)
				.addSubcommand(sub =>
					sub
						.setName('ticket-transcript-disable')
						.setDescription('Disable automatic ticket transcript archival')
				)
				.addSubcommand(sub =>
					sub
						.setName('ticket-role')
						.setDescription('Set the ticket manager role for support tickets')
						.addRoleOption(opt =>
							opt
								.setName('role')
								.setDescription('Role that manages support tickets')
								.setRequired(true)
						)
				)
				.addSubcommand(sub =>
					sub
						.setName('ticket-role-disable')
						.setDescription('Remove/disable the ticket manager role')
				)
				// Volume Setting
				.addSubcommand(sub =>
					sub
						.setName('default-volume')
						.setDescription('Set default music playback volume for this server')
						.addIntegerOption(opt =>
							opt
								.setName('volume')
								.setDescription('Default volume level (1 - 100)')
								.setRequired(true)
								.setMinValue(1)
								.setMaxValue(100)
						)
				)
				// View Setting Overview
				.addSubcommand(sub =>
					sub
						.setName('view')
						.setDescription('View all current server configuration settings')
				);

			// Conditionally register Twitch subcommands only if Twitch is enabled
			if (twitchEnabled) {
				builder
					.addSubcommand(sub =>
						sub
							.setName('twitch-add')
							.setDescription('Add a Twitch streamer live alert to a channel')
							.addStringOption(opt =>
								opt
									.setName('streamer')
									.setDescription('Twitch streamer login/username')
									.setRequired(true)
							)
							.addChannelOption(opt =>
								opt
									.setName('channel')
									.setDescription('Channel to send live alerts to')
									.setRequired(true)
									.addChannelTypes(ChannelType.GuildText)
							)
					)
					.addSubcommand(sub =>
						sub
							.setName('twitch-remove')
							.setDescription(
								'Remove a Twitch streamer live alert from a channel'
							)
							.addStringOption(opt =>
								opt
									.setName('streamer')
									.setDescription('Twitch streamer login/username')
									.setRequired(true)
							)
							.addChannelOption(opt =>
								opt
									.setName('channel')
									.setDescription('Channel to remove alert from')
									.setRequired(true)
									.addChannelTypes(ChannelType.GuildText)
							)
					)
					.addSubcommand(sub =>
						sub
							.setName('twitch-list')
							.setDescription(
								'View all active Twitch streamer alerts for this server'
							)
					);
			}

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

		const subcommand = interaction.options.getSubcommand(true);
		const handler = subcommandHandlers[subcommand];

		try {
			if (handler) {
				return await handler(interaction);
			}
			return await interaction.editReply({
				content: ':warning: Unknown `/set` subcommand.'
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
		'Configure server settings (Welcome, Twitch, Logging, Tickets, Volume)',
	usage: '/set <subcommand>',
	examples: [
		'/set welcome-channel channel: #welcome',
		'/set welcome-message message: Welcome {user} to {server}!',
		'/set welcome-toggle enabled: True',
		'/set twitch-add streamer: shroud channel: #streams',
		'/set log-channel channel: #mod-logs',
		'/set log-toggle enabled: True',
		'/set ticket-channel channel: #support',
		'/set ticket-toggle enabled: True',
		'/set ticket-panel',
		'/set ticket-role role: @SupportTeam',
		'/set default-volume volume: 80',
		'/set view'
	],
	options: [
		{
			name: 'welcome-channel',
			description: 'Set welcome channel',
			required: false
		},
		{
			name: 'welcome-message',
			description: 'Set custom welcome message',
			required: false
		},
		{
			name: 'welcome-toggle',
			description: 'Toggle welcome greetings on/off',
			required: false
		},
		{
			name: 'welcome-test',
			description: 'Send preview welcome message',
			required: false
		},
		{
			name: 'twitch-add',
			description: 'Add streamer alert (if Twitch enabled)',
			required: false
		},
		{
			name: 'twitch-remove',
			description: 'Remove streamer alert (if Twitch enabled)',
			required: false
		},
		{
			name: 'twitch-list',
			description: 'List monitored streamers (if Twitch enabled)',
			required: false
		},
		{
			name: 'log-channel',
			description: 'Set audit/moderation log channel',
			required: false
		},
		{
			name: 'log-disable',
			description: 'Disable server event logging',
			required: false
		},
		{
			name: 'ticket-channel',
			description: 'Set support ticket panel channel',
			required: false
		},
		{
			name: 'ticket-toggle',
			description: 'Toggle support ticket system',
			required: false
		},
		{
			name: 'ticket-panel',
			description: 'Post support ticket embed panel',
			required: false
		},
		{
			name: 'ticket-transcript',
			description: 'Set ticket transcript archive channel',
			required: false
		},
		{
			name: 'ticket-transcript-disable',
			description: 'Disable ticket transcript archiving',
			required: false
		},
		{
			name: 'ticket-role',
			description: 'Set ticket manager role',
			required: false
		},
		{
			name: 'ticket-role-disable',
			description: 'Disable ticket manager role',
			required: false
		},
		{
			name: 'default-volume',
			description: 'Set default playback volume',
			required: false
		},
		{
			name: 'view',
			description: 'View current settings overview',
			required: false
		}
	]
};
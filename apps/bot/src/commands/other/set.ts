import type { CommandHelp } from '../../lib/structures/CommandHelp.js';
import { MessageChannel } from '../../lib/structures/ExtendedClient.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions, container } from '@sapphire/framework';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	EmbedBuilder,
	PermissionFlagsBits,
	type ChatInputCommandInteraction,
	type GuildMember,
	type TextChannel
} from 'discord.js';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';
import { notify } from '../../lib/twitch/notifyChannels.js';
import { dataService } from '../../dataService.js';
import Logger from '../../lib/logger.js';

function checkTwitchEnabled(): boolean {
	const enabled = (process.env.TWITCH_ENABLED || '').toLowerCase() !== 'false';
	return (
		enabled &&
		Boolean(process.env.TWITCH_CLIENT_ID) &&
		Boolean(process.env.TWITCH_CLIENT_SECRET)
	);
}

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
		const guildId = interaction.guildId!;
		const member = interaction.member as GuildMember;
		const { client } = container;

		if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
			return await interaction.reply({
				content:
					':x: You must have the `Manage Server` permission to configure bot settings.',
				ephemeral: true
			});
		}

		await interaction.deferReply();

		const subcommand = interaction.options.getSubcommand(true);

		try {
			switch (subcommand) {
				// --- WELCOME ---
				case 'welcome-channel': {
					const channel = interaction.options.getChannel('channel', true);
					await dataService.welcome.setChannel({
						guildId,
						channelId: channel.id
					});
					return await interaction.editReply({
						content: `:white_check_mark: Welcome messages will now be sent in <#${channel.id}>.`
					});
				}

				case 'welcome-message': {
					const message = interaction.options.getString('message', true);
					await dataService.welcome.setMessage({
						guildId,
						message
					});
					return await interaction.editReply({
						content: `:white_check_mark: Custom welcome message updated!\n\n**Preview:**\n> ${message}`
					});
				}

				case 'welcome-toggle': {
					const enabled = interaction.options.getBoolean('enabled', true);
					await dataService.welcome.toggle({
						guildId,
						status: enabled
					});
					return await interaction.editReply({
						content: `:white_check_mark: Welcome message system is now **${
							enabled ? 'ENABLED' : 'DISABLED'
						}**.`
					});
				}

				case 'welcome-test': {
					const guildData = await dataService.guild.getGuild({
						id: guildId
					});
					const welcomeChannelId = guildData?.guild?.welcomeMessageChannel;
					const rawMessage =
						guildData?.guild?.welcomeMessage ||
						'👋 Welcome {user} to **{server}**! You are member #{memberCount}.';

					if (!welcomeChannelId) {
						return await interaction.editReply({
							content:
								':x: No welcome channel configured yet. Use `/set welcome-channel` first.'
						});
					}

					const targetChannel = (await interaction.guild?.channels.fetch(
						welcomeChannelId
					)) as TextChannel;
					if (!targetChannel) {
						return await interaction.editReply({
							content: ':x: Configured welcome channel could not be found.'
						});
					}

					const formatted = rawMessage
						.replace(/\{user\}|\{mention\}/g, `<@${interaction.user.id}>`)
						.replace(/\{username\}/g, interaction.user.username)
						.replace(
							/\{server\}|\{guild\}/g,
							interaction.guild?.name || 'this server'
						)
						.replace(
							/\{memberCount\}|\{position\}/g,
							String(interaction.guild?.memberCount || 1)
						);

					await targetChannel.send({ content: formatted });
					return await interaction.editReply({
						content: `:white_check_mark: Sent a test welcome message to <#${welcomeChannelId}>!`
					});
				}

				// --- TWITCH ---
				case 'twitch-add': {
					if (!checkTwitchEnabled()) {
						return await interaction.editReply({
							content:
								':warning: Twitch features are currently disabled in configuration.'
						});
					}
					const streamerName = interaction.options.getString('streamer', true);
					const channelData = interaction.options.getChannel('channel', true);

					let user: any;
					try {
						user = await client.twitch.api.getUser({
							login: streamerName,
							token: client.twitch.auth.access_token
						});
					} catch {
						return await interaction.editReply({
							content: `:x: Could not lookup streamer '${streamerName}'. Please check the name.`
						});
					}

					if (!user) {
						return await interaction.editReply({
							content: `:x: Streamer **${streamerName}** was not found on Twitch.`
						});
					}

					const guildDB = await dataService.guild.getGuild({
						id: guildId
					});
					if (!guildDB.guild) {
						return await interaction.editReply({
							content: ':x: Server data not found.'
						});
					}

					const currentNotifyList: string[] = Array.isArray(
						guildDB.guild.notifyList
					)
						? guildDB.guild.notifyList
						: (JSON.parse(guildDB.guild.notifyList || '[]') as string[]);

					if (currentNotifyList.includes(user.id)) {
						return await interaction.editReply({
							content: `:x: **${user.display_name}** is already on your alert list.`
						});
					}

					const existingSendTo =
						client.twitch.notifyList[user.id]?.sendTo || [];
					const updatedSendTo = Array.from(
						new Set([...existingSendTo, channelData.id])
					);

					client.twitch.notifyList[user.id] = {
						sendTo: updatedSendTo,
						live: false,
						logo: user.profile_image_url,
						messageSent: false,
						messageHandler: {}
					};

					await dataService.twitch.create({
						userId: user.id,
						userImage: user.profile_image_url,
						channelId: channelData.id,
						sendTo: updatedSendTo
					});

					const concatedArray = Array.from(
						new Set([...currentNotifyList, user.id])
					);
					await dataService.twitch.createViaTwitchNotification({
						name: interaction.guild?.name || '',
						guildId,
						notifyList: concatedArray,
						ownerId: guildDB.guild.ownerId,
						userId: interaction.user.id
					});

					await notify(Object.keys(client.twitch.notifyList));
					return await interaction.editReply({
						content: `:white_check_mark: Stream alerts for **${user.display_name}** will be sent to <#${channelData.id}>.`
					});
				}

				case 'twitch-remove': {
					if (!checkTwitchEnabled()) {
						return await interaction.editReply({
							content:
								':warning: Twitch features are currently disabled in configuration.'
						});
					}
					const streamerName = interaction.options.getString('streamer', true);
					const channelData = interaction.options.getChannel('channel', true);

					let user: any;
					try {
						user = await client.twitch.api.getUser({
							login: streamerName,
							token: client.twitch.auth.access_token
						});
					} catch {
						return await interaction.editReply({
							content: `:x: Could not lookup streamer '${streamerName}'. Please check the name.`
						});
					}

					if (!user) {
						return await interaction.editReply({
							content: `:x: Streamer **${streamerName}** was not found on Twitch.`
						});
					}

					const guildDB = await dataService.guild.getGuild({
						id: guildId
					});
					const removeNotifyList: string[] = Array.isArray(
						guildDB.guild?.notifyList
					)
						? (guildDB.guild?.notifyList as string[])
						: (JSON.parse(guildDB.guild?.notifyList || '[]') as string[]);

					if (!guildDB.guild || !removeNotifyList.includes(user.id)) {
						return await interaction.editReply({
							content: `:x: **${user.display_name}** is not in this server's alert list.`
						});
					}

					const filteredTwitchIds = removeNotifyList.filter(
						id => id !== user.id
					);
					await dataService.twitch.updateTwitchNotifications({
						guildId,
						notifyList: filteredTwitchIds
					});

					const notifyDB = await dataService.twitch.findUserById({
						id: user.id
					});
					if (notifyDB?.notification) {
						const filteredChannels = notifyDB.notification.channelIds.filter(
							id => id !== channelData.id
						);
						if (filteredChannels.length === 0) {
							await dataService.twitch.delete({
								userId: user.id
							});
							delete client.twitch.notifyList[user.id];
						} else {
							await dataService.twitch.updateNotification({
								userId: user.id,
								channelIds: filteredChannels
							});
							if (client.twitch.notifyList[user.id]) {
								client.twitch.notifyList[user.id].sendTo = filteredChannels;
							}
						}
					}

					return await interaction.editReply({
						content: `:white_check_mark: Removed **${user.display_name}** alerts from <#${channelData.id}>.`
					});
				}

				case 'twitch-list': {
					if (!checkTwitchEnabled()) {
						return await interaction.editReply({
							content:
								':warning: Twitch features are currently disabled in configuration.'
						});
					}
					const guildDB = await dataService.guild.getGuild({
						id: guildId
					});
					const listNotifyList: string[] = Array.isArray(
						guildDB.guild?.notifyList
					)
						? (guildDB.guild?.notifyList as string[])
						: (JSON.parse(guildDB.guild?.notifyList || '[]') as string[]);

					if (!guildDB?.guild || listNotifyList.length === 0) {
						return await interaction.editReply({
							content:
								':information_source: No Twitch streamers configured for alerts in this server.'
						});
					}

					const users = await client.twitch.api.getUsers({
						ids: listNotifyList,
						token: client.twitch.auth.access_token
					});

					const myList: object[] = [];
					for (const streamer of users || []) {
						const sendTo = client.twitch.notifyList[streamer.id]?.sendTo || [];
						for (const chId of sendTo) {
							const ch = client.channels.cache.get(chId) as MessageChannel;
							if (ch && ch.guild.id === guildId) {
								myList.push({
									name: streamer.display_name,
									channel: ch.name
								});
							}
						}
					}

					const baseEmbed = new EmbedBuilder().setColor('Purple').setAuthor({
						name: `${interaction.guild?.name} - Twitch Alerts`,
						iconURL: interaction.guild?.iconURL() || undefined
					});

					new PaginatedFieldMessageEmbed()
						.setTitleField('Streamers')
						.setTemplate(baseEmbed)
						.setItems(myList)
						.formatItems(
							(item: any) => `• **${item.name}** ➔ **#${item.channel}**`
						)
						.setItemsPerPage(10)
						.make()
						.run(interaction);
					return;
				}

				// --- LOGGING ---
				case 'log-channel': {
					const channel = interaction.options.getChannel('channel', true);
					await dataService.guild.setLogChannel({
						guildId,
						channelId: channel.id
					});
					return await interaction.editReply({
						content: `:white_check_mark: Server audit & moderation logs enabled and routed to <#${channel.id}>.`
					});
				}

				case 'log-toggle': {
					const enabled = interaction.options.getBoolean('enabled', true);
					await dataService.guild.toggleLogChannel({
						guildId,
						status: enabled
					});
					return await interaction.editReply({
						content: `:white_check_mark: Server audit & moderation logging is now **${
							enabled ? 'ENABLED' : 'DISABLED'
						}**.`
					});
				}

				case 'log-disable': {
					await dataService.guild.setLogChannel({
						guildId,
						channelId: null
					});
					return await interaction.editReply({
						content:
							':white_check_mark: Server audit & moderation logging has been **DISABLED**.'
					});
				}

				// --- TICKETS ---
				case 'ticket-channel': {
					const channel = interaction.options.getChannel(
						'channel',
						true
					) as TextChannel;
					await dataService.tickets.setChannel({
						guildId,
						channelId: channel.id
					});

					const ticketConfig = await dataService.tickets.getConfig({
						guildId
					});
					const template =
						ticketConfig.guild?.ticketMessage &&
						ticketConfig.guild.ticketMessage.trim().length > 0
							? ticketConfig.guild.ticketMessage
							: '👋 Welcome to **{server}** Support!\n\n' +
								'Need assistance, have an inquiry, or want to speak with server staff?\n' +
								'• Please have any relevant screenshots, error logs, or details ready.\n' +
								'• A support representative or moderator will assist you shortly.\n\n' +
								'Click the **Open Ticket** button below to create your private support thread.';

					const formatted = template
						.replace(
							/\{server\}|\{guild\}/g,
							interaction.guild?.name || 'Server'
						)
						.replace(/\{user\}|\{mention\}|\{username\}/g, 'you');

					// Automatically send the ticket panel message to the configured channel
					const panelEmbed = new EmbedBuilder()
						.setTitle(
							`🎫 ${interaction.guild?.name || 'Server'} Support Tickets`
						)
						.setDescription(formatted)
						.setColor(0x5865f2)
						.setFooter({
							text: 'Support Ticket System • Master-Bot',
							iconURL: interaction.guild?.iconURL() || undefined
						})
						.setTimestamp();

					const openButton = new ButtonBuilder()
						.setCustomId('ticket_create')
						.setLabel('Open Ticket')
						.setStyle(ButtonStyle.Primary)
						.setEmoji('🎫');

					const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
						openButton
					);

					await channel
						.send({
							embeds: [panelEmbed],
							components: [row]
						})
						.catch(() => {});

					return await interaction.editReply({
						content: `:white_check_mark: Support ticket channel set to <#${channel.id}> and the interactive ticket panel has been posted!`
					});
				}

				case 'ticket-toggle': {
					const enabled = interaction.options.getBoolean('enabled', true);
					await dataService.tickets.toggle({
						guildId,
						status: enabled
					});

					if (enabled && interaction.guild) {
						const ticketConfig = await dataService.tickets.getConfig({
							guildId
						});
						const channelId = ticketConfig.guild?.ticketChannel;

						if (channelId) {
							const targetChannel = (await interaction.guild.channels
								.fetch(channelId)
								.catch(() => null)) as TextChannel | null;

							if (targetChannel) {
								const template =
									ticketConfig.guild?.ticketMessage &&
									ticketConfig.guild.ticketMessage.trim().length > 0
										? ticketConfig.guild.ticketMessage
										: '👋 Welcome to **{server}** Support!\n\n' +
											'Need assistance, have an inquiry, or want to speak with server staff?\n' +
											'• Please have any relevant screenshots, error logs, or details ready.\n' +
											'• A support representative or moderator will assist you shortly.\n\n' +
											'Click the **Open Ticket** button below to create your private support thread.';

								const formatted = template
									.replace(/\{server\}|\{guild\}/g, interaction.guild.name)
									.replace(/\{user\}|\{mention\}|\{username\}/g, 'you');

								const panelEmbed = new EmbedBuilder()
									.setTitle(`🎫 ${interaction.guild.name} Support Tickets`)
									.setDescription(formatted)
									.setColor(0x5865f2)
									.setFooter({
										text: 'Support Ticket System • Master-Bot',
										iconURL: interaction.guild.iconURL() || undefined
									})
									.setTimestamp();

								const openButton = new ButtonBuilder()
									.setCustomId('ticket_create')
									.setLabel('Open Ticket')
									.setStyle(ButtonStyle.Primary)
									.setEmoji('🎫');

								const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
									openButton
								);

								await targetChannel
									.send({
										embeds: [panelEmbed],
										components: [row]
									})
									.catch(() => {});
							}
						}
					}

					return await interaction.editReply({
						content: `:white_check_mark: Support ticket system is now **${
							enabled ? 'ENABLED' : 'DISABLED'
						}**${enabled ? ' and the ticket panel has been posted to the ticket channel.' : '.'}`
					});
				}

				case 'ticket-panel': {
					const ticketConfig = await dataService.tickets.getConfig({
						guildId
					});
					const channelId = ticketConfig.guild?.ticketChannel;

					if (!channelId) {
						return await interaction.editReply({
							content:
								':x: No ticket channel configured yet. Use `/set ticket-channel` first.'
						});
					}

					const targetChannel = (await interaction.guild?.channels.fetch(
						channelId
					)) as TextChannel;
					if (!targetChannel) {
						return await interaction.editReply({
							content: ':x: Configured ticket channel could not be found.'
						});
					}

					const template =
						ticketConfig.guild?.ticketMessage &&
						ticketConfig.guild.ticketMessage.trim().length > 0
							? ticketConfig.guild.ticketMessage
							: '👋 Welcome to **{server}** Support!\n\n' +
								'Need assistance, have an inquiry, or want to speak with server staff?\n' +
								'• Please have any relevant screenshots, error logs, or details ready.\n' +
								'• A support representative or moderator will assist you shortly.\n\n' +
								'Click the **Open Ticket** button below to create your private support thread.';

					const formatted = template
						.replace(
							/\{server\}|\{guild\}/g,
							interaction.guild?.name || 'Server'
						)
						.replace(/\{user\}|\{mention\}|\{username\}/g, 'you');

					const panelEmbed = new EmbedBuilder()
						.setTitle(
							`🎫 ${interaction.guild?.name || 'Server'} Support Tickets`
						)
						.setDescription(formatted)
						.setColor(0x5865f2)
						.setFooter({
							text: 'Support Ticket System • Master-Bot',
							iconURL: interaction.guild?.iconURL() || undefined
						})
						.setTimestamp();

					const openButton = new ButtonBuilder()
						.setCustomId('ticket_create')
						.setLabel('Open Ticket')
						.setStyle(ButtonStyle.Primary)
						.setEmoji('🎫');

					const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
						openButton
					);

					await targetChannel.send({
						embeds: [panelEmbed],
						components: [row]
					});

					return await interaction.editReply({
						content: `:white_check_mark: Interactive ticket panel has been posted in <#${channelId}>!`
					});
				}

				case 'ticket-transcript': {
					const channel = interaction.options.getChannel('channel', true);
					await dataService.tickets.setTranscriptChannel({
						guildId,
						channelId: channel.id
					});
					return await interaction.editReply({
						content: `:white_check_mark: Ticket transcripts will now be saved and posted to <#${channel.id}> when tickets are closed.`
					});
				}

				case 'ticket-transcript-disable': {
					await dataService.tickets.setTranscriptChannel({
						guildId,
						channelId: null
					});
					return await interaction.editReply({
						content:
							':white_check_mark: Ticket transcript archival has been **DISABLED**.'
					});
				}

				case 'ticket-role': {
					const role = interaction.options.getRole('role', true);
					await dataService.tickets.setRole({
						guildId,
						roleId: role.id
					});
					return await interaction.editReply({
						content: `:white_check_mark: Ticket manager role set to <@&${role.id}>. Members with this role will be added to newly created support tickets.`
					});
				}

				case 'ticket-role-disable': {
					await dataService.tickets.setRole({
						guildId,
						roleId: null
					});
					return await interaction.editReply({
						content:
							':white_check_mark: Ticket manager role has been **DISABLED**.'
					});
				}

				// --- VOLUME ---
				case 'default-volume': {
					const volume = interaction.options.getInteger('volume', true);
					await dataService.guild.updateVolume({
						guildId,
						volume
					});
					return await interaction.editReply({
						content: `:white_check_mark: Default playback volume for this server set to **${volume}%**.`
					});
				}

				// --- VIEW ---
				case 'view': {
					const guildData = await dataService.guild.getGuild({
						id: guildId
					});
					const ticketConfig = await dataService.tickets.getConfig({
						guildId
					});
					const g = guildData?.guild;
					const t = ticketConfig?.guild;
					const twitchActive = checkTwitchEnabled();

					const embed = new EmbedBuilder()
						.setTitle(`⚙️ Server Settings - ${interaction.guild?.name}`)
						.setColor('Blue')
						.addFields(
							{
								name: '👋 Welcome System',
								value: g?.welcomeMessageEnabled
									? '🟢 **Enabled**'
									: '🔴 **Disabled**',
								inline: true
							},
							{
								name: '📢 Welcome Channel',
								value: g?.welcomeMessageChannel
									? `<#${g.welcomeMessageChannel}>`
									: '*Not set*',
								inline: true
							},
							{
								name: '📜 Log Channel',
								value:
									g?.logChannelEnabled && g?.logChannel
										? `🟢 <#${g.logChannel}>`
										: g?.logChannel
											? `🔴 <#${g.logChannel}> *(Paused)*`
											: '*Disabled*',
								inline: true
							},
							{
								name: '🎫 Support Tickets',
								value:
									t?.ticketEnabled && t?.ticketChannel
										? `🟢 <#${t.ticketChannel}>`
										: t?.ticketChannel
											? `🔴 <#${t.ticketChannel}> *(Disabled)*`
											: '*Not configured*',
								inline: true
							},
							{
								name: '📑 Transcript Channel',
								value: t?.ticketTranscriptChannel
									? `🟢 <#${t.ticketTranscriptChannel}>`
									: '*Not set*',
								inline: true
							},
							{
								name: '🛡️ Ticket Manager Role',
								value: t?.ticketRoleId ? `<@&${t.ticketRoleId}>` : '*Not set*',
								inline: true
							},
							{
								name: '🔊 Default Music Volume',
								value: `${g?.volume ?? 100}%`,
								inline: true
							},
							{
								name: '🟣 Twitch Alerts',
								value: twitchActive
									? `${g?.notifyList?.length || 0} streamer(s) monitored`
									: '*Disabled in config*',
								inline: true
							},
							{
								name: '📝 Welcome Template',
								value: g?.welcomeMessage
									? `> ${g.welcomeMessage}`
									: '> 👋 Welcome {user} to **{server}**! You are member #{memberCount}. *(Default)*',
								inline: false
							}
						)
						.setFooter({
							text: 'Use /set <subcommand> to configure settings'
						})
						.setTimestamp();

					return await interaction.editReply({ embeds: [embed] });
				}
			}
			return;
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

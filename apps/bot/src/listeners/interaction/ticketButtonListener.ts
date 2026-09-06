import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChannelType,
	EmbedBuilder,
	Interaction,
	TextChannel,
	ThreadAutoArchiveDuration,
	ThreadChannel
} from 'discord.js';
import { dataService } from '../../dataService.js';

export const DEFAULT_TICKET_MESSAGE =
	'👋 Hello {user}, thank you for contacting support in **{server}**!\n\n' +
	'A support representative or moderator will be with you shortly. In the meantime, please provide as much detail as possible:\n' +
	'• A clear description of your question, inquiry, or issue\n' +
	'• Any relevant screenshots, error messages, or transaction IDs\n' +
	'• Any steps you have already tried to resolve the problem\n\n' +
	'To close this ticket once your inquiry is resolved, click the **Close Ticket** button below.';

@ApplyOptions<ListenerOptions>({
	event: Events.InteractionCreate
})
export class TicketButtonListener extends Listener {
	public override async run(interaction: Interaction): Promise<void> {
		if (!interaction.isButton()) return;
		const buttonInteraction = interaction as ButtonInteraction;

		if (buttonInteraction.customId === 'ticket_create') {
			await this.handleCreateTicket(buttonInteraction);
		} else if (buttonInteraction.customId === 'ticket_close') {
			await this.handleCloseTicket(buttonInteraction);
		}
	}

	private async handleCreateTicket(interaction: ButtonInteraction) {
		const guild = interaction.guild;
		const user = interaction.user;
		const channel = interaction.channel as TextChannel;

		if (!guild || !channel) {
			return await interaction.reply({
				content: ':x: This button can only be used in a server channel.',
				ephemeral: true
			});
		}

		await interaction.deferReply({ ephemeral: true });

		try {
			const config = await dataService.tickets.getConfig({
				guildId: guild.id
			});

			if (!config.guild?.ticketEnabled) {
				return await interaction.editReply({
					content:
						':warning: The ticket system is currently disabled for this server.'
				});
			}

			// Clean username for thread name
			const sanitizedUsername = user.username
				.toLowerCase()
				.replace(/[^a-z0-9_-]/g, '')
				.slice(0, 20);
			const threadName = `🎫・ticket-${sanitizedUsername || user.id.slice(0, 6)}`;

			// Create a private thread if bot/server supports it, otherwise public thread
			let thread: ThreadChannel;
			try {
				thread = await channel.threads.create({
					name: threadName,
					autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
					type: ChannelType.PrivateThread,
					reason: `Support ticket created by ${user.tag}`
				});
			} catch {
				// Fallback to public thread if server does not support private threads
				thread = await channel.threads.create({
					name: threadName,
					autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
					type: ChannelType.PublicThread,
					reason: `Support ticket created by ${user.tag}`
				});
			}

			// Add member to the thread
			await thread.members.add(user.id).catch(() => {});

			// Add staff / ticket manager role members to the thread if configured
			const ticketRoleId = config.guild?.ticketRoleId;
			if (ticketRoleId) {
				try {
					const role =
						guild.roles.cache.get(ticketRoleId) ||
						(await guild.roles.fetch(ticketRoleId).catch(() => null));
					if (role) {
						for (const [memberId] of role.members) {
							await thread.members.add(memberId).catch(() => {});
						}
					}
				} catch (roleErr) {
					this.container.logger.error(
						'Failed to add ticket role members to thread:',
						roleErr
					);
				}
			}

			// Register in database
			await dataService.tickets.createTicket({
				guildId: guild.id,
				threadId: thread.id,
				creatorId: user.id
			});

			// Format welcome message
			const customMessage = config.guild?.ticketMessage;
			const rawTemplate =
				customMessage && customMessage.trim().length > 0
					? customMessage
					: DEFAULT_TICKET_MESSAGE;

			const formattedMessage = rawTemplate
				.replace(/\{user\}|\{mention\}/g, `<@${user.id}>`)
				.replace(/\{username\}/g, user.username)
				.replace(/\{server\}|\{guild\}/g, guild.name);

			const ticketEmbed = new EmbedBuilder()
				.setTitle(`🎫 Support Ticket: ${user.username}`)
				.setDescription(formattedMessage)
				.setColor(0x5865f2)
				.addFields(
					{
						name: '👤 Opened By',
						value: `${user.tag} (<@${user.id}>)`,
						inline: true
					},
					{
						name: '🕒 Opened At',
						value: `<t:${Math.floor(Date.now() / 1000)}:f>`,
						inline: true
					}
				);

			if (ticketRoleId) {
				ticketEmbed.addFields({
					name: '🛡️ Support Role',
					value: `<@&${ticketRoleId}>`,
					inline: true
				});
			}

			ticketEmbed
				.setFooter({
					text: `Ticket ID: ${thread.id} • Master-Bot Support`,
					iconURL: guild.iconURL() || undefined
				})
				.setTimestamp();

			const closeButton = new ButtonBuilder()
				.setCustomId('ticket_close')
				.setLabel('Close Ticket')
				.setStyle(ButtonStyle.Danger)
				.setEmoji('🔒');

			const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
				closeButton
			);

			const mentionContent = ticketRoleId
				? `<@${user.id}> <@&${ticketRoleId}>`
				: `<@${user.id}>`;

			await thread.send({
				content: mentionContent,
				embeds: [ticketEmbed],
				components: [actionRow]
			});

			return await interaction.editReply({
				content: `:white_check_mark: Your support ticket has been created: <#${thread.id}>`
			});
		} catch (error) {
			this.container.logger.error('Failed to create ticket thread:', error);
			return await interaction.editReply({
				content:
					':x: An error occurred while creating your ticket thread. Please make sure the bot has permission to create and manage threads.'
			});
		}
	}

	private async handleCloseTicket(interaction: ButtonInteraction) {
		const thread = interaction.channel;
		const guild = interaction.guild;

		if (!thread || !thread.isThread() || !guild) {
			return await interaction.reply({
				content: ':x: This button can only be used inside a ticket thread.',
				ephemeral: true
			});
		}

		await interaction.deferReply();

		try {
			// Record closed in database
			await dataService.tickets.closeTicket({
					threadId: thread.id
				})
				.catch(() => {});

			// Query guild ticket configuration to check transcript channel
			const ticketConfig = await dataService.tickets.getConfig({
					guildId: guild.id
				})
				.catch(() => null);

			const transcriptChannelId = ticketConfig?.guild?.ticketTranscriptChannel;

			if (transcriptChannelId) {
				try {
					const transcriptChannel = (await guild.channels.fetch(
						transcriptChannelId
					)) as TextChannel;

					if (transcriptChannel) {
						// Fetch thread messages for transcript
						const messages = await thread.messages.fetch({ limit: 100 });
						const sortedMessages = Array.from(messages.values()).sort(
							(a, b) => a.createdTimestamp - b.createdTimestamp
						);

						let transcriptContent = `====================================================\n`;
						transcriptContent += `TICKET TRANSCRIPT: ${thread.name} (${thread.id})\n`;
						transcriptContent += `Server: ${guild.name} (${guild.id})\n`;
						transcriptContent += `Closed By: ${interaction.user.tag} (${interaction.user.id})\n`;
						transcriptContent += `Timestamp: ${new Date().toISOString()}\n`;
						transcriptContent += `====================================================\n\n`;

						for (const msg of sortedMessages) {
							const timestamp = new Date(msg.createdTimestamp)
								.toISOString()
								.replace('T', ' ')
								.slice(0, 19);
							const author = `${msg.author.tag} (${msg.author.id})`;
							const text =
								msg.cleanContent ||
								(msg.embeds.length ? '[Embed content]' : '[No text content]');
							transcriptContent += `[${timestamp}] ${author}:\n${text}\n\n`;
						}

						const buffer = Buffer.from(transcriptContent, 'utf-8');
						const attachment = new AttachmentBuilder(buffer, {
							name: `transcript-${thread.id}.txt`
						});

						const transcriptEmbed = new EmbedBuilder()
							.setTitle(`📜 Ticket Transcript: ${thread.name}`)
							.setColor(0x3498db)
							.addFields(
								{
									name: '🎫 Thread',
									value: `${thread.name} (\`${thread.id}\`)`,
									inline: true
								},
								{
									name: '🛡️ Closed By',
									value: `${interaction.user.tag} (<@${interaction.user.id}>)`,
									inline: true
								},
								{
									name: '💬 Total Messages',
									value: `${sortedMessages.length}`,
									inline: true
								}
							)
							.setFooter({
								text: `Master-Bot Ticket Transcripts • ${guild.name}`,
								iconURL: guild.iconURL() || undefined
							})
							.setTimestamp();

						await transcriptChannel.send({
							embeds: [transcriptEmbed],
							files: [attachment]
						});
					}
				} catch (transcriptError) {
					this.container.logger.error(
						'Failed to send ticket transcript:',
						transcriptError
					);
				}
			}

			const closeEmbed = new EmbedBuilder()
				.setTitle('🔒 Ticket Closed')
				.setDescription(
					`This ticket was closed by ${interaction.user.tag} (<@${interaction.user.id}>).\n\n` +
						'This thread will now be locked and archived. If you require further assistance, please open a new ticket from the support channel.'
				)
				.setColor(0x95a5a6)
				.setTimestamp();

			await interaction.editReply({ embeds: [closeEmbed] });

			// Lock and archive the thread
			await thread.setLocked(true, `Ticket closed by ${interaction.user.tag}`);
			return await thread.setArchived(
				true,
				`Ticket closed by ${interaction.user.tag}`
			);
		} catch (error) {
			this.container.logger.error('Failed to close ticket thread:', error);
			return await interaction.editReply({
				content: ':x: An error occurred while closing this ticket thread.'
			});
		}
	}
}

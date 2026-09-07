import { container } from '@sapphire/framework';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	type ChatInputCommandInteraction,
	type TextChannel
} from 'discord.js';
import type { SetHandler } from './types';

const DEFAULT_TICKET_MESSAGE =
	'👋 Welcome to **{server}** Support!\n\n' +
	'Need assistance, have an inquiry, or want to speak with server staff?\n' +
	'• Please have any relevant screenshots, error logs, or details ready.\n' +
	'• A support representative or moderator will assist you shortly.\n\n' +
	'Click the **Open Ticket** button below to create your private support thread.';

function getTicketPanel(
	interaction: ChatInputCommandInteraction,
	ticketMessage: string | null | undefined
) {
	const template =
		ticketMessage && ticketMessage.trim().length > 0
			? ticketMessage
			: DEFAULT_TICKET_MESSAGE;

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

	return {
		embeds: [panelEmbed],
		components: [row]
	};
}

export const handleTicketChannel: SetHandler = async interaction => {
	const { client } = container;
	const guildId = interaction.guildId!;
	const channel = interaction.options.getChannel(
		'channel',
		true
	) as TextChannel;
	await client.session.tickets.setChannel({
		guildId,
		channelId: channel.id
	});

	const ticketConfig = await client.session.tickets.getConfig({
		guildId
	});
	const panel = getTicketPanel(
		interaction,
		ticketConfig.guild?.ticketMessage
	);

	await channel.send(panel).catch(() => {});

	return await interaction.editReply({
		content: `:white_check_mark: Support ticket channel set to <#${channel.id}> and the interactive ticket panel has been posted!`
	});
};

export const handleTicketToggle: SetHandler = async interaction => {
	const { client } = container;
	const guildId = interaction.guildId!;
	const enabled = interaction.options.getBoolean('enabled', true);
	await client.session.tickets.toggle({
		guildId,
		status: enabled
	});

	if (enabled && interaction.guild) {
		const ticketConfig = await client.session.tickets.getConfig({
			guildId
		});
		const channelId = ticketConfig.guild?.ticketChannel;

		if (channelId) {
			const targetChannel = (await interaction.guild.channels
				.fetch(channelId)
				.catch(() => null)) as TextChannel | null;

			if (targetChannel) {
				const panel = getTicketPanel(
					interaction,
					ticketConfig.guild?.ticketMessage
				);
				await targetChannel.send(panel).catch(() => {});
			}
		}
	}

	return await interaction.editReply({
		content: `:white_check_mark: Support ticket system is now **${
			enabled ? 'ENABLED' : 'DISABLED'
		}**${enabled ? ' and the ticket panel has been posted to the ticket channel.' : '.'}`
	});
};

export const handleTicketPanel: SetHandler = async interaction => {
	const { client } = container;
	const guildId = interaction.guildId!;
	const ticketConfig = await client.session.tickets.getConfig({
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

	const panel = getTicketPanel(
		interaction,
		ticketConfig.guild?.ticketMessage
	);

	await targetChannel.send(panel);

	return await interaction.editReply({
		content: `:white_check_mark: Interactive ticket panel has been posted in <#${channelId}>!`
	});
};

export const handleTicketTranscript: SetHandler = async interaction => {
	const channel = interaction.options.getChannel('channel', true);
	await container.client.session.tickets.setTranscriptChannel({
		guildId: interaction.guildId!,
		channelId: channel.id
	});
	return await interaction.editReply({
		content: `:white_check_mark: Ticket transcripts will now be saved and posted to <#${channel.id}> when tickets are closed.`
	});
};

export const handleTicketTranscriptDisable: SetHandler = async interaction => {
	await container.client.session.tickets.setTranscriptChannel({
		guildId: interaction.guildId!,
		channelId: null
	});
	return await interaction.editReply({
		content:
			':white_check_mark: Ticket transcript archival has been **DISABLED**.'
	});
};

export const handleTicketRole: SetHandler = async interaction => {
	const role = interaction.options.getRole('role', true);
	await container.client.session.tickets.setRole({
		guildId: interaction.guildId!,
		roleId: role.id
	});
	return await interaction.editReply({
		content: `:white_check_mark: Ticket manager role set to <@&${role.id}>. Members with this role will be added to newly created support tickets.`
	});
};

export const handleTicketRoleDisable: SetHandler = async interaction => {
	await container.client.session.tickets.setRole({
		guildId: interaction.guildId!,
		roleId: null
	});
	return await interaction.editReply({
		content: ':white_check_mark: Ticket manager role has been **DISABLED**.'
	});
};
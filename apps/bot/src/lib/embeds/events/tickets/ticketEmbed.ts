import {
	EmbedBuilder,
	type Guild,
	type ThreadChannel,
	type User
} from 'discord.js';
import { EmbedHandler } from '../../embedHandler';

export interface TicketCreatedEmbedOptions {
	user: User;
	guild: Guild;
	thread: ThreadChannel;
	message: string;
	ticketRoleId?: string | null;
}

export function createTicketCreatedEmbed(
	options: TicketCreatedEmbedOptions
): EmbedBuilder {
	const embed = EmbedHandler.create({
		title: `🎫 Support Ticket: ${options.user.username}`,
		description: options.message,
		variant: 'brand',
		fields: [
			EmbedHandler.field(
				'👤 Opened By',
				`${options.user.tag ?? options.user.username} (<@${options.user.id}>)`,
				true
			),
			EmbedHandler.field('🕒 Opened At', EmbedHandler.timestamp(new Date(), 'f'), true),
			...(options.ticketRoleId
				? [EmbedHandler.field('🛡️ Support Role', `<@&${options.ticketRoleId}>`, true)]
				: [])
		],
		footer: {
			text: `Ticket ID: ${options.thread.id} • Master-Bot Support`,
			iconURL: options.guild.iconURL() || undefined
		},
		timestamp: true
	});

	return embed;
}

export interface TicketTranscriptEmbedOptions {
	thread: ThreadChannel;
	closedBy: User;
}

export function createTicketTranscriptEmbed(
	options: TicketTranscriptEmbedOptions
): EmbedBuilder {
	return EmbedHandler.create({
		title: `📜 Ticket Transcript: ${options.thread.name}`,
		variant: 'info',
		fields: [
			EmbedHandler.field(
				'🎫 Thread',
				`${options.thread.name} (` + EmbedHandler.code(options.thread.id) + `)`,
				true
			),
			EmbedHandler.field(
				'🛡️ Closed By',
				`${options.closedBy.tag ?? options.closedBy.username} (<@${options.closedBy.id}>)`,
				true
			)
		],
		footer: 'A text copy of the ticket conversation is attached above.',
		timestamp: true
	});
}

export interface TicketClosedEmbedOptions {
	thread: ThreadChannel;
	closedBy: User;
}

export function createTicketClosedEmbed(
	options: TicketClosedEmbedOptions
): EmbedBuilder {
	return EmbedHandler.warning({
		title: 'Ticket Closed',
		description: `This support ticket has been closed by <@${options.closedBy.id}>.`,
		fields: [
			EmbedHandler.field('🎫 Ticket', options.thread.name, true),
			EmbedHandler.field(
				'🛡️ Closed By',
				options.closedBy.tag ?? options.closedBy.username,
				true
			)
		],
		timestamp: true
	});
}

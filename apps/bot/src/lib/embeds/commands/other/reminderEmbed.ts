import { EmbedBuilder, type User } from 'discord.js';
import { EmbedHandler } from '../../embedHandler';

export interface ReminderCreatedEmbedOptions {
	reminderText: string;
	dueTimestampMs: number;
	user: User;
}

export function createReminderCreatedEmbed(
	options: ReminderCreatedEmbedOptions
): EmbedBuilder {
	return EmbedHandler.success({
		title: 'Reminder Set',
		description: `I will remind you: ${EmbedHandler.quote(options.reminderText)}`,
		fields: [
			EmbedHandler.field(
				'⏰ Reminding At',
				EmbedHandler.timestamp(options.dueTimestampMs, 'F'),
				true
			),
			EmbedHandler.field(
				'⏳ In',
				EmbedHandler.timestamp(options.dueTimestampMs, 'R'),
				true
			)
		],
		user: options.user
	});
}

export interface ReminderNotificationEmbedOptions {
	reminderText: string;
	createdAt?: Date | number;
	user: User;
}

export function createReminderNotificationEmbed(
	options: ReminderNotificationEmbedOptions
): EmbedBuilder {
	return EmbedHandler.info({
		title: '⏰ Reminder Alert',
		description: `Here is your scheduled reminder:\n\n${EmbedHandler.quote(options.reminderText)}`,
		fields: options.createdAt
			? [
					EmbedHandler.field(
						'📅 Originally Set',
						EmbedHandler.timestamp(options.createdAt, 'R'),
						false
					)
				]
			: undefined,
		user: options.user
	});
}

import { EmbedBuilder, type Client, type User } from 'discord.js';
import { trpcNode } from '../../trpc';
import Logger from '../logger';

export interface FormatContext {
	userId: string;
	user?: User | null;
	event: string;
	dateTime: string;
}

export function formatReminderText(template: string, ctx: FormatContext): string {
	if (!template) return '';

	const date = new Date(ctx.dateTime);
	const unix = !isNaN(date.getTime()) ? Math.floor(date.getTime() / 1000) : Math.floor(Date.now() / 1000);

	const dateStr = !isNaN(date.getTime())
		? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
		: 'Unknown Date';

	const timeStr = !isNaN(date.getTime())
		? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
		: 'Unknown Time';

	const username = ctx.user?.username || 'Member';
	const mention = `<@${ctx.userId}>`;

	return template
		.replace(/\{user\}|\{mention\}/gi, mention)
		.replace(/\{username\}/gi, username)
		.replace(/\{event\}/gi, ctx.event)
		.replace(/\{date\}/gi, dateStr)
		.replace(/\{time\}/gi, timeStr)
		.replace(/\{countdown\}|\{relative\}|\{timestamp\}/gi, `<t:${unix}:R>`);
}

export class ReminderManager {
	private static client: Client | null = null;
	private static interval: NodeJS.Timeout | null = null;
	private static isProcessing = false;

	public static start(client: Client): void {
		this.client = client;
		if (this.interval) clearInterval(this.interval);

		// Run check immediately and then every 30 seconds
		this.checkDueReminders().catch(err => Logger.error('Initial reminder check error: ', err));
		this.interval = setInterval(() => {
			this.checkDueReminders().catch(err => Logger.error('Interval reminder check error: ', err));
		}, 30 * 1000);

		Logger.info('ReminderManager background scheduler initialized (30s interval).');
	}

	public static stop(): void {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}

	public static async checkDueReminders(): Promise<void> {
		if (!this.client || this.isProcessing) return;
		this.isProcessing = true;

		try {
			const nowIso = new Date().toISOString();
			const result = await trpcNode.reminder.getDueReminders.mutate({
				beforeIsoDate: nowIso
			});
			const dueReminders = result.reminders || [];

			if (dueReminders.length === 0) {
				this.isProcessing = false;
				return;
			}

			for (const reminder of dueReminders) {
				try {
					const user = await this.client.users.fetch(reminder.userId).catch(() => null);
					const date = new Date(reminder.dateTime);
					const unix = !isNaN(date.getTime()) ? Math.floor(date.getTime() / 1000) : Math.floor(Date.now() / 1000);

					const formattedDescription = reminder.description
						? formatReminderText(reminder.description, {
								userId: reminder.userId,
								user,
								event: reminder.event,
								dateTime: reminder.dateTime
						  })
						: null;

					const formattedEvent = formatReminderText(reminder.event, {
						userId: reminder.userId,
						user,
						event: reminder.event,
						dateTime: reminder.dateTime
					});

					const embed = new EmbedBuilder()
						.setTitle('🔔 Scheduled Reminder')
						.setColor(0xfee75c)
						.setDescription(
							`Hey ${user ? user : `<@${reminder.userId}>`}, here is your reminder for **${formattedEvent}**!`
						)
						.addFields(
							{ name: '📝 Event', value: formattedEvent, inline: true },
							{ name: '⏰ Scheduled For', value: `<t:${unix}:F> (<t:${unix}:R>)`, inline: true }
						)
						.setFooter({
							text: 'Master-Bot Reminder System',
							iconURL: this.client.user?.displayAvatarURL()
						})
						.setTimestamp();

					if (formattedDescription) {
						embed.addFields({ name: '📄 Notes', value: formattedDescription, inline: false });
					}

					let delivered = false;
					if (user) {
						delivered = await user
							.send({ embeds: [embed] })
							.then(() => true)
							.catch(() => false);
					}

					// If DM failed (DMs closed), attempt to notify in a mutual guild text channel if available
					if (!delivered && user) {
						for (const guild of this.client.guilds.cache.values()) {
							const member = guild.members.cache.get(user.id);
							if (member) {
								const systemChannel = guild.systemChannel || guild.channels.cache.find(c => c.isTextBased() && 'send' in c);
								if (systemChannel && 'send' in systemChannel) {
									await (systemChannel as any).send({
										content: `🔔 <@${user.id}> (Your DMs are closed)`,
										embeds: [embed]
									}).catch(() => {});
									break;
								}
							}
						}
					}

					// Delete dispatched reminder
					await trpcNode.reminder.delete.mutate({
						userId: reminder.userId,
						event: reminder.event
					}).catch(() => {});
				} catch (reminderErr) {
					Logger.error(`Error processing reminder #${reminder.id}: `, reminderErr);
				}
			}
		} catch (err) {
			Logger.error('ReminderManager execution failed: ', err);
		} finally {
			this.isProcessing = false;
		}
	}
}

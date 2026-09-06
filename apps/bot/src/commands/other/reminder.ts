import type { CommandHelp } from '../../lib/structures/CommandHelp.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { dataService } from '../../dataService.js';
import { formatReminderText } from '../../lib/reminders/ReminderManager.js';
import Logger from '../../lib/logger.js';

function parseDurationMs(input: string): number | null {
	const regex =
		/(\d+)\s*(s|sec|seconds?|m|min|minutes?|h|hrs?|hours?|d|days?|w|weeks?)/gi;
	let totalMs = 0;
	let match: RegExpExecArray | null;
	let matchedAny = false;

	while ((match = regex.exec(input)) !== null) {
		matchedAny = true;
		const val = parseInt(match[1], 10);
		const unit = match[2].toLowerCase();

		if (unit.startsWith('s')) totalMs += val * 1000;
		else if (unit.startsWith('m')) totalMs += val * 60 * 1000;
		else if (unit.startsWith('h')) totalMs += val * 60 * 60 * 1000;
		else if (unit.startsWith('d')) totalMs += val * 24 * 60 * 60 * 1000;
		else if (unit.startsWith('w')) totalMs += val * 7 * 24 * 60 * 60 * 1000;
	}

	if (!matchedAny) {
		const pureNum = parseInt(input, 10);
		if (!isNaN(pureNum) && pureNum > 0) {
			totalMs = pureNum * 60 * 1000; // default to minutes if pure number
		} else {
			return null;
		}
	}

	return totalMs > 0 ? totalMs : null;
}

function formatDuration(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const days = Math.floor(totalSeconds / 86400);
	const hours = Math.floor((totalSeconds % 86400) / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	const parts: string[] = [];
	if (days > 0) parts.push(`${days}d`);
	if (hours > 0) parts.push(`${hours}h`);
	if (minutes > 0) parts.push(`${minutes}m`);
	if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
	return parts.join(' ');
}

@ApplyOptions<CommandOptions>({
	name: 'reminder',
	description: 'Create and manage your reminders',
	preconditions: ['isCommandDisabled']
})
export class ReminderCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand(subcommand =>
					subcommand
						.setName('set')
						.setDescription('Schedule a new reminder')
						.addStringOption(option =>
							option
								.setName('time')
								.setDescription('When to remind you (e.g. 10m, 1h, 2d, 30s)')
								.setRequired(true)
						)
						.addStringOption(option =>
							option
								.setName('event')
								.setDescription('What you want to be reminded about')
								.setRequired(true)
						)
						.addStringOption(option =>
							option
								.setName('description')
								.setDescription('Optional extra notes or details')
								.setRequired(false)
						)
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName('list')
						.setDescription('View all of your upcoming scheduled reminders')
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName('delete')
						.setDescription('Delete an existing reminder by event name')
						.addStringOption(option =>
							option
								.setName('event')
								.setDescription('The event name of the reminder to delete')
								.setRequired(true)
						)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();
		const subcommand = interaction.options.getSubcommand(true);
		const userId = interaction.user.id;

		switch (subcommand) {
			case 'set': {
				const timeInput = interaction.options.getString('time', true);
				const event = interaction.options.getString('event', true);
				const description =
					interaction.options.getString('description') || null;

				const durationMs = parseDurationMs(timeInput);
				if (!durationMs || durationMs < 5000) {
					return interaction.editReply({
						content:
							':x: Please provide a valid future time duration (e.g. `10m`, `1h30m`, `2d`). Minimum duration is 5 seconds.'
					});
				}

				if (durationMs > 30 * 24 * 60 * 60 * 1000) {
					return interaction.editReply({
						content:
							':x: Reminders cannot be set further than 30 days in advance.'
					});
				}

				const targetDate = new Date(Date.now() + durationMs);

				try {
					await dataService.reminder.create({
						userId,
						event,
						description,
						dateTime: targetDate.toISOString(),
						repeat: null,
						timeOffset: 0
					});
				} catch (err) {
					Logger.error('Failed to save reminder to DB: ', err);
				}

				const formattedEvent = formatReminderText(event, {
					userId,
					user: interaction.user,
					event,
					dateTime: targetDate.toISOString()
				});

				const formattedNotes = description
					? formatReminderText(description, {
							userId,
							user: interaction.user,
							event,
							dateTime: targetDate.toISOString()
						})
					: null;

				const embed = new EmbedBuilder()
					.setTitle('⏰ Reminder Scheduled')
					.setColor(0x5865f2)
					.setDescription(
						`I'll remind you about **${formattedEvent}** in **${formatDuration(durationMs)}** (<t:${Math.floor(targetDate.getTime() / 1000)}:R>).`
					)
					.addFields(
						{ name: '📝 Event', value: formattedEvent, inline: true },
						{
							name: '⏱️ Remind At',
							value: `<t:${Math.floor(targetDate.getTime() / 1000)}:F>`,
							inline: true
						}
					)
					.setFooter({
						text: `Requested by ${interaction.user.username}`,
						iconURL: interaction.user.displayAvatarURL()
					})
					.setTimestamp();

				if (formattedNotes) {
					embed.addFields({
						name: '📄 Notes',
						value: formattedNotes,
						inline: false
					});
				}

				await interaction.editReply({ embeds: [embed] });

				// Schedule notification timeout
				setTimeout(async () => {
					try {
						const reminderEmbed = new EmbedBuilder()
							.setTitle('🔔 Reminder Notification')
							.setColor(0xfee75c)
							.setDescription(
								`Hey ${interaction.user}, here is your scheduled reminder for **${event}**!`
							)
							.addFields(
								{ name: '📝 Event', value: event, inline: true },
								{
									name: '⏰ Scheduled For',
									value: `<t:${Math.floor(targetDate.getTime() / 1000)}:R>`,
									inline: true
								}
							)
							.setFooter({
								text: 'Master-Bot Reminder System',
								iconURL: interaction.client.user?.displayAvatarURL()
							})
							.setTimestamp();

						if (description) {
							reminderEmbed.addFields({
								name: '📄 Notes',
								value: description,
								inline: false
							});
						}

						// Attempt to send DM; if DMs closed, send to original channel
						await interaction.user
							.send({ embeds: [reminderEmbed] })
							.catch(async () => {
								if (interaction.channel && 'send' in interaction.channel) {
									await (interaction.channel as any)
										.send({
											content: `🔔 ${interaction.user}`,
											embeds: [reminderEmbed]
										})
										.catch(() => {});
								}
							});

						// Clean up from database
						await dataService.reminder.delete({ userId, event })
							.catch(() => {});
					} catch (notifyErr) {
						Logger.error('Reminder notification delivery error: ', notifyErr);
					}
				}, durationMs);

				return;
			}

			case 'list': {
				try {
					const result = await dataService.reminder.getByUserId({ userId });
					const reminders = result.reminders || [];

					if (reminders.length === 0) {
						return interaction.editReply({
							content: '📭 You do not have any active scheduled reminders.'
						});
					}

					const embed = new EmbedBuilder()
						.setTitle(`⏰ Your Reminders (${reminders.length})`)
						.setColor(0x5865f2)
						.setDescription(
							reminders
								.map((r, i) => {
									const date = new Date(r.dateTime);
									const unix = Math.floor(date.getTime() / 1000);
									const desc = r.description ? `\n  > *${r.description}*` : '';
									return `**${i + 1}. ${r.event}** — <t:${unix}:R> (<t:${unix}:d>)${desc}`;
								})
								.join('\n\n')
						)
						.setFooter({
							text: 'Use /reminder delete [event] to cancel a reminder',
							iconURL: interaction.user.displayAvatarURL()
						})
						.setTimestamp();

					return interaction.editReply({ embeds: [embed] });
				} catch (err) {
					Logger.error('Failed to query reminders: ', err);
					return interaction.editReply({
						content: ':x: An error occurred while retrieving your reminders.'
					});
				}
			}

			case 'delete': {
				const event = interaction.options.getString('event', true);
				try {
					const del = await dataService.reminder.delete({ userId, event });
					if (del.reminder?.count === 0) {
						return interaction.editReply({
							content: `:warning: No active reminder matching **${event}** was found.`
						});
					}

					return interaction.editReply({
						content: `:white_check_mark: Successfully deleted reminder **${event}**.`
					});
				} catch (err) {
					Logger.error('Failed to delete reminder: ', err);
					return interaction.editReply({
						content: ':x: An error occurred while deleting your reminder.'
					});
				}
			}
		}

		return;
	}
}

export const help: CommandHelp = {
	name: 'reminder',
	category: 'other',
	description: 'Create and manage your reminders',
	usage: '/reminder <set | list | delete>',
	examples: [
		'/reminder set time: 10m event: Take out pizza',
		'/reminder set time: 2h event: Team Sync description: Bring notes',
		'/reminder list',
		'/reminder delete event: Take out pizza'
	],
	options: [
		{
			name: 'set',
			description:
				'Schedule a new reminder with time, event title, and optional notes.',
			required: false
		},
		{
			name: 'list',
			description: 'View all of your upcoming scheduled reminders.',
			required: false
		},
		{
			name: 'delete',
			description: 'Delete an active scheduled reminder by event name.',
			required: false
		}
	]
};

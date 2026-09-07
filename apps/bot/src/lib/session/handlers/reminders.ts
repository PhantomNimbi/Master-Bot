import type { Reminder } from '../types';
import type { SessionStore } from '../SessionStore';

export function createRemindersHandlers(store: SessionStore) {
	return {
		create: (input: {
			userId: string;
			guildId: string;
			event: string;
			description: string | null;
			dateTime: string;
			repeat?: string | null;
			timeOffset: number;
		}): Reminder => {
			const reminder: Reminder = {
				id: store.nextReminderId++,
				createdAt: new Date(),
				repeat: input.repeat ?? null,
				event: input.event,
				description: input.description || '',
				dateTime: input.dateTime,
				userId: input.userId,
				guildId: input.guildId,
				timeOffset: input.timeOffset
			};
			store.remindersMap.set(
				store.buildReminderKey(input.guildId, input.userId, input.event),
				reminder
			);
			store.persist(async () => {
				const guild = store.getOrCreateGuild(input.guildId);
				await store.ensureGuildRow(guild);
				await store.db.reminder.create({
					data: {
						id: reminder.id,
						event: input.event,
						description: input.description,
						dateTime: input.dateTime,
						userId: input.userId,
						guildId: input.guildId,
						repeat: reminder.repeat,
						timeOffset: input.timeOffset
					}
				});
			});
			return reminder;
		},
		getByUserId: (input: {
			guildId: string;
			userId: string;
		}): { reminders: Reminder[] } => ({
			reminders: Array.from(store.remindersMap.values()).filter(
				r => r.userId === input.userId && r.guildId === input.guildId
			)
		}),
		delete: (input: {
			userId: string;
			guildId: string;
			event: string;
		}): { reminder: { count: number } } => {
			const reminder = store.remindersMap.get(
				store.buildReminderKey(input.guildId, input.userId, input.event)
			);
			if (reminder) {
				store.remindersMap.delete(
					store.buildReminderKey(input.guildId, input.userId, input.event)
				);
				store.persist(() =>
					store.db.reminder.deleteMany({
						where: {
							userId: input.userId,
							guildId: input.guildId,
							event: input.event
						}
					})
				);
				return { reminder: { count: 1 } };
			}
			return { reminder: { count: 0 } };
		},
		getDueReminders: (input: {
			beforeIsoDate: string;
		}): { reminders: Reminder[] } => {
			const before = new Date(input.beforeIsoDate).getTime();
			return {
				reminders: Array.from(store.remindersMap.values()).filter(r => {
					const time = new Date(r.dateTime).getTime();
					return !isNaN(time) && time <= before;
				})
			};
		}
	};
}
import type { GuildRecord, TwitchNotification } from '../types';
import type { SessionStore } from '../SessionStore';
import type { createGuildDataHandlers } from './guildData';

type GuildDataHandlers = ReturnType<typeof createGuildDataHandlers>;

export function createTwitchConfigHandlers(
	store: SessionStore,
	guildData: GuildDataHandlers
) {
	return {
		create: (input: {
			userId: string;
			userImage: string;
			channelId: string;
			sendTo: string[];
		}): TwitchNotification => {
			let notification = store.twitchNotifications.get(input.userId);
			if (!notification) {
				notification = {
					userId: input.userId,
					logo: input.userImage,
					channelIds: [],
					live: false,
					sent: false
				};
				store.twitchNotifications.set(input.userId, notification);
			} else {
				notification.logo = input.userImage;
			}
			notification.channelIds = Array.from(
				new Set([...notification.channelIds, input.channelId])
			);
			store.persist(async () => {
				await store.ensureTwitchRow(notification);
			});
			return notification;
		},
		createViaTwitchNotification: (input: {
			name: string;
			guildId: string;
			notifyList: string[];
			ownerId: string;
			userId: string;
		}): GuildRecord => {
			store.persist(async () => {
				await store.getUserDbId(input.ownerId);
				await store.ensureTwitchRow({
					userId: input.userId,
					channelIds: [],
					live: false,
					sent: false
				});
				await store.ensureGuildRow(
					store.getOrCreateGuild(input.guildId)
				);
			});
			return guildData.create({
				id: input.guildId,
				name: input.name,
				ownerId: input.ownerId
			});
		},
		updateTwitchNotifications: (input: {
			guildId: string;
			notifyList: string[];
		}): GuildRecord => {
			const guild = store.getOrCreateGuild(input.guildId);
			guild.notifyList = input.notifyList;
			store.persist(async () => {
				await store.ensureGuildRow(guild);
			});
			return guild;
		},
		findUserById: (input: {
			id: string;
		}): { notification: { channelIds: string[] } | null } => {
			const notification = store.twitchNotifications.get(input.id);
			return {
				notification: notification
					? { channelIds: notification.channelIds }
					: null
			};
		},
		delete: (input: { userId: string }): boolean => {
			const deleted = store.twitchNotifications.delete(input.userId);
			if (deleted) {
				store.persist(() =>
					store.db.twitchNotify.delete({ where: { twitchId: input.userId } })
				);
			}
			return deleted;
		},
		updateNotification: (input: {
			userId: string;
			channelIds: string[];
		}): TwitchNotification => {
			const notification = store.getOrCreateTwitchNotification(input.userId);
			notification.channelIds = input.channelIds;
			store.persist(async () => {
				await store.ensureTwitchRow(notification);
			});
			return notification;
		},
		updateNotificationStatus: (input: {
			userId: string;
			sent: boolean;
			live: boolean;
		}): TwitchNotification => {
			const notification = store.getOrCreateTwitchNotification(input.userId);
			notification.sent = input.sent;
			notification.live = input.live;
			store.persist(async () => {
				await store.ensureTwitchRow(notification);
			});
			return notification;
		}
	};
}
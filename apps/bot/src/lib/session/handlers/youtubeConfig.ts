import type { YouTubeNotification, YouTubeAlertType } from '../types';
import type { SessionStore } from '../SessionStore';

export function createYouTubeConfigHandlers(store: SessionStore) {
	return {
		addSubscription: (input: {
			channelId: string;
			channelTitle: string;
			logo?: string;
			discordChannelId: string;
			alertType: YouTubeAlertType;
		}): YouTubeNotification => {
			const notification = store.getOrCreateYouTubeNotification(
				input.channelId,
				input.channelTitle
			);

			notification.channelTitle = input.channelTitle;
			if (input.logo) notification.logo = input.logo;

			// Add or update the discord channel target
			const existingIdx = notification.channelIds.findIndex(
				c => c.channelId === input.discordChannelId
			);

			if (existingIdx >= 0) {
				notification.channelIds[existingIdx].alertType = input.alertType;
			} else {
				notification.channelIds.push({
					channelId: input.discordChannelId,
					alertType: input.alertType
				});
			}

			store.persist(async () => {
				await store.ensureYouTubeRow(notification);
			});

			return notification;
		},

		removeSubscription: (input: {
			channelId: string;
			discordChannelId: string;
		}): { success: boolean; remainingCount: number } => {
			const notification = store.youtubeNotifications.get(input.channelId);
			if (!notification) {
				return { success: false, remainingCount: 0 };
			}

			notification.channelIds = notification.channelIds.filter(
				c => c.channelId !== input.discordChannelId
			);

			if (notification.channelIds.length === 0) {
				store.youtubeNotifications.delete(input.channelId);
				store.persist(async () => {
					await store.db.youTubeNotify.delete({
						where: { channelId: input.channelId }
					}).catch(() => null);
				});
				return { success: true, remainingCount: 0 };
			} else {
				store.persist(async () => {
					await store.ensureYouTubeRow(notification);
				});
				return { success: true, remainingCount: notification.channelIds.length };
			}
		},

		getSubscription: (channelId: string): YouTubeNotification | null => {
			return store.youtubeNotifications.get(channelId) ?? null;
		},

		getAllSubscriptions: (): YouTubeNotification[] => {
			return Array.from(store.youtubeNotifications.values());
		},

		updateStatus: (input: {
			channelId: string;
			lastVideoId?: string;
			lastStreamId?: string;
			isLive: boolean;
		}): YouTubeNotification | null => {
			const notification = store.youtubeNotifications.get(input.channelId);
			if (!notification) return null;

			if (input.lastVideoId !== undefined) {
				notification.lastVideoId = input.lastVideoId;
			}
			if (input.lastStreamId !== undefined) {
				notification.lastStreamId = input.lastStreamId;
			}
			notification.isLive = input.isLive;

			store.persist(async () => {
				await store.ensureYouTubeRow(notification);
			});

			return notification;
		}
	};
}

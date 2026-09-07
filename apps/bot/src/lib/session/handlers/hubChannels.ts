import type { TempChannel } from '../types';
import type { SessionStore } from '../SessionStore';

export function createHubChannelsHandlers(store: SessionStore) {
	return {
		getTempChannel: (input: {
			guildId: string;
			ownerId: string;
		}): { tempChannel: TempChannel | null } => {
			for (const channel of store.tempChannels.values()) {
				if (
					channel.guildId === input.guildId &&
					channel.ownerId === input.ownerId
				) {
					return { tempChannel: channel };
				}
			}
			return { tempChannel: null };
		},
		createTempChannel: (input: {
			guildId: string;
			ownerId: string;
			channelId: string;
		}): TempChannel => {
			const existing = store.tempChannels.get(input.channelId);
			if (existing?.id === input.channelId) return existing;

			for (const [id, channel] of store.tempChannels) {
				if (channel.ownerId === input.ownerId) {
					store.tempChannels.delete(id);
					store.persist(async () => {
						try {
							await store.db.tempChannel.delete({ where: { id } });
						} catch {
							// row may not exist yet; deletes are best-effort
						}
					});
				}
			}

			const channel: TempChannel = {
				guildId: input.guildId,
				ownerId: input.ownerId,
				id: input.channelId
			};
			store.tempChannels.set(input.channelId, channel);
			store.persist(() =>
				store.db.tempChannel.create({
					data: {
						id: input.channelId,
						guildId: input.guildId,
						ownerId: input.ownerId
					}
				})
			);
			return channel;
		},
		deleteTempChannel: (input: { channelId: string }): boolean => {
			const deleted = store.tempChannels.delete(input.channelId);
			if (deleted) {
				store.persist(async () => {
					try {
						await store.db.tempChannel.delete({
							where: { id: input.channelId }
						});
					} catch {
						// row may not exist yet; deletes are best-effort
					}
				});
			}
			return deleted;
		}
	};
}
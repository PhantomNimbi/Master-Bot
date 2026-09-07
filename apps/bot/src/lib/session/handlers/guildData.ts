import type { GuildRecord } from '../types';
import type { SessionStore } from '../SessionStore';

export function createGuildDataHandlers(store: SessionStore) {
	return {
		create: (input: {
			id: string;
			name: string;
			ownerId: string;
		}): GuildRecord => {
			const guild = store.getOrCreateGuild(input.id);
			guild.name = input.name;
			guild.ownerId = input.ownerId;
			store.persist(async () => {
				await store.ensureGuildRow(guild);
			});
			return guild;
		},
		getGuild: (input: {
			id: string;
		}): { guild: GuildRecord | null } => ({
			guild: store.guilds.get(input.id) || null
		}),
		delete: (input: { id: string }): boolean => {
			const deleted = store.guilds.delete(input.id);
			if (deleted) {
				store.persist(() => store.db.guild.delete({ where: { id: input.id } }));
			}
			return deleted;
		},
		updateVolume: (input: {
			guildId: string;
			volume: number;
		}): GuildRecord => {
			const guild = store.getOrCreateGuild(input.guildId);
			guild.volume = input.volume;
			store.persist(async () => {
				await store.ensureGuildRow(guild);
			});
			return guild;
		},
		setLogChannel: (input: {
			guildId: string;
			channelId: string | null;
		}): GuildRecord => {
			const guild = store.getOrCreateGuild(input.guildId);
			if (input.channelId === null) {
				guild.logChannel = undefined;
				guild.logChannelEnabled = false;
			} else {
				guild.logChannel = input.channelId;
				guild.logChannelEnabled = true;
			}
			store.persist(async () => {
				await store.ensureGuildRow(guild);
			});
			return guild;
		},
		toggleLogChannel: (input: {
			guildId: string;
			status: boolean;
		}): GuildRecord => {
			const guild = store.getOrCreateGuild(input.guildId);
			guild.logChannelEnabled = input.status;
			store.persist(async () => {
				await store.ensureGuildRow(guild);
			});
			return guild;
		}
	};
}
import type { GuildRecord } from '../types';
import type { SessionStore } from '../SessionStore';

export function createWelcomeMessagesHandlers(store: SessionStore) {
	return {
		setChannel: (input: {
			guildId: string;
			channelId: string;
		}): GuildRecord => {
			const guild = store.getOrCreateGuild(input.guildId);
			guild.welcomeMessageChannel = input.channelId;
			store.persist(async () => {
				await store.ensureGuildRow(guild);
			});
			return guild;
		},
		setMessage: (input: {
			guildId: string;
			message: string;
		}): GuildRecord => {
			const guild = store.getOrCreateGuild(input.guildId);
			guild.welcomeMessage = input.message;
			store.persist(async () => {
				await store.ensureGuildRow(guild);
			});
			return guild;
		},
		toggle: (input: { guildId: string; status: boolean }): GuildRecord => {
			const guild = store.getOrCreateGuild(input.guildId);
			guild.welcomeMessageEnabled = input.status;
			store.persist(async () => {
				await store.ensureGuildRow(guild);
			});
			return guild;
		}
	};
}
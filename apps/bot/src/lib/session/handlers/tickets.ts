import type { GuildRecord, Ticket } from '../types';
import type { SessionStore } from '../SessionStore';

export function createTicketsHandlers(store: SessionStore) {
	return {
		getConfig: (input: {
			guildId: string;
		}): { guild: GuildRecord | null } => ({
			guild: store.guilds.get(input.guildId) || null
		}),
		setChannel: (input: {
			guildId: string;
			channelId: string;
		}): GuildRecord => {
			const guild = store.getOrCreateGuild(input.guildId);
			guild.ticketChannel = input.channelId;
			store.persist(async () => {
				await store.ensureGuildRow(guild);
			});
			return guild;
		},
		toggle: (input: { guildId: string; status: boolean }): GuildRecord => {
			const guild = store.getOrCreateGuild(input.guildId);
			guild.ticketEnabled = input.status;
			store.persist(async () => {
				await store.ensureGuildRow(guild);
			});
			return guild;
		},
		setTranscriptChannel: (input: {
			guildId: string;
			channelId: string | null;
		}): GuildRecord => {
			const guild = store.getOrCreateGuild(input.guildId);
			guild.ticketTranscriptChannel = input.channelId || undefined;
			store.persist(async () => {
				await store.ensureGuildRow(guild);
			});
			return guild;
		},
		setRole: (input: {
			guildId: string;
			roleId: string | null;
		}): GuildRecord => {
			const guild = store.getOrCreateGuild(input.guildId);
			guild.ticketRoleId = input.roleId || undefined;
			store.persist(async () => {
				await store.ensureGuildRow(guild);
			});
			return guild;
		},
		createTicket: (input: {
			guildId: string;
			threadId: string;
			creatorId: string;
		}): Ticket => {
			const ticket: Ticket = {
				threadId: input.threadId,
				guildId: input.guildId,
				creatorId: input.creatorId,
				createdAt: new Date(),
				closed: false
			};
			store.ticketsMap.set(input.threadId, ticket);
			store.persist(() =>
				store.db.ticket.create({
					data: {
						guildId: input.guildId,
						threadId: input.threadId,
						creatorId: input.creatorId
					}
				})
			);
			return ticket;
		},
		closeTicket: (input: { threadId: string }): Ticket | null => {
			const ticket = store.ticketsMap.get(input.threadId);
			if (!ticket) return null;
			ticket.closed = true;
			store.persist(() =>
				store.db.ticket.update({
					where: { threadId: input.threadId },
					data: { closed: true, closedAt: new Date() }
				})
			);
			return ticket;
		}
	};
}
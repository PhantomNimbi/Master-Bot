import { PrismaClient } from '@prisma/client';
import type { GuildRecord } from './types';
import { SessionStore } from './SessionStore';
import { createUsersHandlers } from './handlers/users';
import { createGuildDataHandlers } from './handlers/guildData';
import { createWelcomeMessagesHandlers } from './handlers/welcomeMessages';
import { createTicketsHandlers } from './handlers/tickets';
import { createTwitchConfigHandlers } from './handlers/twitchConfig';
import { createHubChannelsHandlers } from './handlers/hubChannels';
import { createPlaylistsHandlers } from './handlers/playlists';
import { createSongsHandlers } from './handlers/songs';
import { createRemindersHandlers } from './handlers/reminders';
import { createCommandsHandlers } from './handlers/commands';
import { createMembersHandlers } from './handlers/members';

export type {
	UserRecord,
	SongRecord,
	Playlist,
	Reminder,
	MemberRecord,
	Ticket,
	TempChannel,
	TwitchNotification,
	GuildRecord
} from './types';

/**
 * Facade over the session namespaces. Each namespace is built by a dedicated
 * handler factory operating on a shared `SessionStore` (see `handlers/`).
 */
export class SessionManager {
	public readonly store: SessionStore;

	public readonly users: ReturnType<typeof createUsersHandlers>;
	public readonly guildData: ReturnType<typeof createGuildDataHandlers>;
	public readonly welcomeMessages: ReturnType<typeof createWelcomeMessagesHandlers>;
	public readonly tickets: ReturnType<typeof createTicketsHandlers>;
	public readonly twitchConfig: ReturnType<typeof createTwitchConfigHandlers>;
	public readonly hubChannels: ReturnType<typeof createHubChannelsHandlers>;
	public readonly playlists: ReturnType<typeof createPlaylistsHandlers>;
	public readonly songs: ReturnType<typeof createSongsHandlers>;
	public readonly reminders: ReturnType<typeof createRemindersHandlers>;
	public readonly commands: ReturnType<typeof createCommandsHandlers>;
	public readonly members: ReturnType<typeof createMembersHandlers>;

	public constructor(db?: PrismaClient) {
		this.store = new SessionStore(db);
		this.users = createUsersHandlers(this.store);
		const guildData = createGuildDataHandlers(this.store);
		this.guildData = guildData;
		this.welcomeMessages = createWelcomeMessagesHandlers(this.store);
		this.tickets = createTicketsHandlers(this.store);
		this.twitchConfig = createTwitchConfigHandlers(this.store, guildData);
		this.hubChannels = createHubChannelsHandlers(this.store);
		this.playlists = createPlaylistsHandlers(this.store);
		this.songs = createSongsHandlers(this.store);
		this.reminders = createRemindersHandlers(this.store);
		this.commands = createCommandsHandlers(this.store);
		this.members = createMembersHandlers(this.store);
	}

	/**
	 * Hydrates all in-memory stores from the SQLite database so persisted
	 * per-guild settings survive bot restarts.
	 */
	public async init(): Promise<void> {
		await this.store.init();
	}

	public get guilds(): Map<string, GuildRecord> {
		return this.store.guilds;
	}

	public getAllTwitchConfig(): {
		notifications: Array<{
			twitchId: string;
			channelIds: string[];
			logo?: string;
			live: boolean;
			sent: boolean;
		}>;
	} {
		return {
			notifications: Array.from(this.store.twitchNotifications.values()).map(
				notification => ({
					twitchId: notification.userId,
					channelIds: notification.channelIds,
					logo: notification.logo,
					live: notification.live,
					sent: notification.sent
				})
			)
		};
	}

	/**
	 * Drops a member's guild-scoped records (tickets, temp channels,
	 * playlists, reminders, notify list membership) when they leave the guild.
	 */
	public clearUserGuildData(guildId: string, userId: string): void {
		this.members.delete({ guildId, userId });

		for (const [id, ticket] of this.store.ticketsMap) {
			if (ticket.guildId === guildId && ticket.creatorId === userId) {
				this.store.ticketsMap.delete(id);
				this.store.persist(() =>
					this.store.db.ticket.delete({ where: { threadId: id } })
				);
			}
		}

		for (const [id, channel] of this.store.tempChannels) {
			if (channel.guildId === guildId && channel.ownerId === userId) {
				this.store.tempChannels.delete(id);
				this.store.persist(async () => {
					try {
						await this.store.db.tempChannel.delete({ where: { id } });
					} catch {
						// best-effort
					}
				});
			}
		}

		const playlistsKey = this.store.playerKey(guildId, userId);
		if (this.store.playlistsMap.delete(playlistsKey)) {
			this.store.persist(async () => {
				const dbId = await this.store.getUserDbId(userId);
				await this.store.db.playlist.deleteMany({
					where: { guildId, userId: dbId }
				});
			});
		}

		const remindersToDelete = Array.from(this.store.remindersMap.values()).filter(
			r => r.guildId === guildId && r.userId === userId
		);
		for (const reminder of remindersToDelete) {
			this.store.remindersMap.delete(
				this.store.buildReminderKey(guildId, userId, reminder.event)
			);
		}
		if (remindersToDelete.length > 0) {
			this.store.persist(() =>
				this.store.db.reminder.deleteMany({ where: { guildId, userId } })
			);
		}

		const guild = this.store.guilds.get(guildId);
		if (guild) {
			const updated = guild.notifyList.filter(id => id !== userId);
			if (updated.length !== guild.notifyList.length) {
				guild.notifyList = updated;
				this.store.persist(async () => {
					await this.store.ensureGuildRow(guild);
				});
			}
		}
	}
}
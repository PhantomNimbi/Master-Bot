import { PrismaClient } from '@prisma/client';
import type {
	GuildRecord,
	MemberRecord,
	Playlist,
	Reminder,
	SongRecord,
	TempChannel,
	Ticket,
	TwitchNotification,
	UserRecord
} from './types';
import {
	DEFAULT_TICKET_MESSAGE,
	DEFAULT_WELCOME_MESSAGE
} from './types';

/**
 * Owns all in-memory session state plus the persistence layer. Handlers in
 * `handlers/` are thin domain objects that read/write through this store.
 */
export class SessionStore {
	public readonly db: PrismaClient;

	public usersMap: Map<string, UserRecord> = new Map();
	public guilds: Map<string, GuildRecord> = new Map();
	public ticketsMap: Map<string, Ticket> = new Map();
	public tempChannels: Map<string, TempChannel> = new Map();
	public twitchNotifications: Map<string, TwitchNotification> = new Map();
	public playlistsMap: Map<string, Map<string, Playlist>> = new Map();
	public remindersMap: Map<string, Reminder> = new Map();
	public membersMap: Map<string, MemberRecord> = new Map();

	public nextPlaylistId = 1;
	public nextSongId = 1;
	public nextReminderId = 1;

	public constructor(db?: PrismaClient) {
		this.db = db ?? new PrismaClient();
	}

	/**
	 * Hydrates all in-memory stores from the SQLite database so persisted
	 * per-guild settings survive bot restarts.
	 */
	public async init(): Promise<void> {
		const dbUsers = await this.db.user.findMany();
		for (const u of dbUsers) {
			if (!u.discordId) continue;
			this.usersMap.set(u.discordId, {
				id: u.discordId,
				dbId: u.id,
				name: u.name ?? 'Unknown',
				createdAt: new Date()
			});
		}

		const dbGuilds = await this.db.guild.findMany();
		for (const g of dbGuilds) {
			this.guilds.set(g.id, {
				id: g.id,
				name: g.name,
				ownerId: g.ownerId,
				volume: g.volume,
				notifyList: this.parseArray(g.notifyList),
				logEvents: g.logEvents || '',
				disabledCommands: this.parseArray(g.disabledCommands),
				logChannel: g.logChannel ?? undefined,
				logChannelEnabled: g.logChannelEnabled,
				welcomeMessage: g.welcomeMessage ?? DEFAULT_WELCOME_MESSAGE,
				welcomeMessageChannel: g.welcomeMessageChannel ?? undefined,
				welcomeMessageEnabled: g.welcomeMessageEnabled,
				ticketChannel: g.ticketChannel ?? undefined,
				ticketTranscriptChannel: g.ticketTranscriptChannel ?? undefined,
				ticketRoleId: g.ticketRoleId ?? undefined,
				ticketEnabled: g.ticketEnabled,
				ticketMessage: g.ticketMessage ?? DEFAULT_TICKET_MESSAGE,
				hub: g.hub ?? undefined,
				hubChannel: g.hubChannel ?? undefined
			});
		}

		const dbTickets = await this.db.ticket.findMany();
		for (const t of dbTickets) {
			this.ticketsMap.set(t.threadId, {
				threadId: t.threadId,
				guildId: t.guildId,
				creatorId: t.creatorId,
				createdAt: t.createdAt,
				closed: t.closed
			});
		}

		const dbTempChannels = await this.db.tempChannel.findMany();
		for (const tc of dbTempChannels) {
			this.tempChannels.set(tc.id, {
				guildId: tc.guildId,
				ownerId: tc.ownerId,
				id: tc.id
			});
		}

		const dbMembers = await this.db.guildMember.findMany();
		for (const m of dbMembers) {
			this.membersMap.set(this.memberKey(m.guildId, m.userId), {
				guildId: m.guildId,
				userId: m.userId,
				joinedAt: m.joinedAt
			});
		}

		const dbTwitch = await this.db.twitchNotify.findMany();
		for (const tn of dbTwitch) {
			this.twitchNotifications.set(tn.twitchId, {
				userId: tn.twitchId,
				logo: tn.logo || undefined,
				channelIds: this.parseArray(tn.channelIds),
				live: tn.live,
				sent: tn.sent
			});
		}

		const dbPlaylists = await this.db.playlist.findMany({
			include: { songs: true }
		});
		const dbIdToDiscord = new Map(
			dbUsers.map(u => [u.id, u.discordId] as const)
		);
		for (const p of dbPlaylists) {
			const discordId = p.userId
				? (dbIdToDiscord.get(p.userId) ?? p.userId)
				: 'unknown';
			const userPlaylists = this.getUserPlaylists(p.guildId, discordId);
			userPlaylists.set(p.name, {
				id: p.id,
				name: p.name,
				userId: discordId,
				guildId: p.guildId,
				songs: p.songs.map(s => ({ ...s }))
			});
			if (p.id >= this.nextPlaylistId) this.nextPlaylistId = p.id + 1;
			for (const s of p.songs) {
				if (s.id >= this.nextSongId) this.nextSongId = s.id + 1;
			}
		}

		const dbReminders = await this.db.reminder.findMany();
		for (const r of dbReminders) {
			this.remindersMap.set(
				this.buildReminderKey(r.guildId, r.userId, r.event),
				{
					id: r.id,
					createdAt: r.createdAt,
					repeat: r.repeat ?? null,
					event: r.event,
					description: r.description ?? '',
					dateTime: r.dateTime,
					userId: r.userId,
					guildId: r.guildId,
					timeOffset: r.timeOffset
				}
			);
			if (r.id >= this.nextReminderId) this.nextReminderId = r.id + 1;
		}
	}

	/**
	 * Queues a database write. The in-memory session always returns
	 * immediately; persistence is durable but fire-and-forget. Operations run
	 * serially in call order so foreign keys (e.g. user -> guild) are satisfied.
	 */
	private persistQueue: Promise<unknown> = Promise.resolve();

	public persist(operation: () => Promise<unknown>): void {
		this.persistQueue = this.persistQueue
			.then(() => operation())
			.catch(error => {
				console.error(
					'[SessionManager] DB persist failed: ',
					error instanceof Error ? error.message : error
				);
			});
	}

	public parseArray(raw: string): string[] {
		if (!raw) return [];
		try {
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed.map(String) : [];
		} catch {
			return raw.split(',').map(s => s.trim()).filter(Boolean);
		}
	}

	public toJson(value: string[]): string {
		return JSON.stringify(value);
	}

	public async ensureGuildRow(guild: GuildRecord): Promise<void> {
		if (guild.ownerId) {
			await this.getUserDbId(guild.ownerId);
		}
		await this.db.guild.upsert({
			where: { id: guild.id },
			create: {
				id: guild.id,
				name: guild.name,
				ownerId: guild.ownerId,
				volume: guild.volume,
				notifyList: this.toJson(guild.notifyList),
				logEvents: guild.logEvents,
				disabledCommands: this.toJson(guild.disabledCommands),
				logChannel: guild.logChannel ?? null,
				logChannelEnabled: guild.logChannelEnabled,
				welcomeMessage: guild.welcomeMessage,
				welcomeMessageChannel: guild.welcomeMessageChannel ?? null,
				welcomeMessageEnabled: guild.welcomeMessageEnabled,
				ticketChannel: guild.ticketChannel ?? null,
				ticketTranscriptChannel: guild.ticketTranscriptChannel ?? null,
				ticketRoleId: guild.ticketRoleId ?? null,
				ticketEnabled: guild.ticketEnabled,
				ticketMessage: guild.ticketMessage,
				hub: guild.hub ?? null,
				hubChannel: guild.hubChannel ?? null
			},
			update: {
				name: guild.name,
				ownerId: guild.ownerId,
				volume: guild.volume,
				notifyList: this.toJson(guild.notifyList),
				logEvents: guild.logEvents,
				disabledCommands: this.toJson(guild.disabledCommands),
				logChannel: guild.logChannel ?? null,
				logChannelEnabled: guild.logChannelEnabled,
				welcomeMessage: guild.welcomeMessage,
				welcomeMessageChannel: guild.welcomeMessageChannel ?? null,
				welcomeMessageEnabled: guild.welcomeMessageEnabled,
				ticketChannel: guild.ticketChannel ?? null,
				ticketTranscriptChannel: guild.ticketTranscriptChannel ?? null,
				ticketRoleId: guild.ticketRoleId ?? null,
				ticketEnabled: guild.ticketEnabled,
				ticketMessage: guild.ticketMessage,
				hub: guild.hub ?? null,
				hubChannel: guild.hubChannel ?? null
			}
		});
	}

	public async getUserDbId(discordId: string): Promise<string | null> {
		const cached = this.usersMap.get(discordId)?.dbId;
		if (cached) return cached;
		try {
			const user = await this.db.user.findUnique({
				where: { discordId }
			});
			if (user) return user.id;
			const created = await this.db.user.create({
				data: { discordId, name: 'Unknown' }
			});
			return created.id;
		} catch {
			return null;
		}
	}

	public getOrCreateGuild(guildId: string): GuildRecord {
		let guild = this.guilds.get(guildId);
		if (!guild) {
			guild = {
				id: guildId,
				name: guildId,
				ownerId: '',
				volume: 100,
				notifyList: [],
				logEvents: '',
				welcomeMessage: DEFAULT_WELCOME_MESSAGE,
				welcomeMessageEnabled: false,
				logChannelEnabled: false,
				ticketEnabled: false,
				ticketMessage: DEFAULT_TICKET_MESSAGE,
				disabledCommands: []
			};
			this.guilds.set(guildId, guild);
		}
		return guild;
	}

	public playerKey(guildId: string, userId: string): string {
		return `${guildId}:${userId}`;
	}

	public memberKey(guildId: string, userId: string): string {
		return `${guildId}:${userId}`;
	}

	public getUserPlaylists(guildId: string, userId: string): Map<string, Playlist> {
		const key = this.playerKey(guildId, userId);
		let userPlaylists = this.playlistsMap.get(key);
		if (!userPlaylists) {
			userPlaylists = new Map();
			this.playlistsMap.set(key, userPlaylists);
		}
		return userPlaylists;
	}

	public buildReminderKey(guildId: string, userId: string, event: string): string {
		return `${guildId}:${userId}:${event}`;
	}

	public addSongToPlaylist(song: SongRecord): void {
		for (const userPlaylists of this.playlistsMap.values()) {
			for (const playlist of userPlaylists.values()) {
				if (playlist.id === song.playlistId) {
					playlist.songs.push(song);
					return;
				}
			}
		}
	}

	public removeSongById(id: number): SongRecord | null {
		for (const userPlaylists of this.playlistsMap.values()) {
			for (const playlist of userPlaylists.values()) {
				const index = playlist.songs.findIndex(s => s.id === id);
				if (index !== -1) {
					const [song] = playlist.songs.splice(index, 1);
					return song;
				}
			}
		}
		return null;
	}

	public async ensureTwitchRow(
		notification: TwitchNotification
	): Promise<void> {
		await this.db.twitchNotify.upsert({
			where: { twitchId: notification.userId },
			create: {
				twitchId: notification.userId,
				logo: notification.logo ?? '',
				live: notification.live,
				channelIds: this.toJson(notification.channelIds),
				sent: notification.sent
			},
			update: {
				logo: notification.logo ?? '',
				live: notification.live,
				channelIds: this.toJson(notification.channelIds),
				sent: notification.sent
			}
		});
	}

	public getOrCreateTwitchNotification(userId: string): TwitchNotification {
		let notification = this.twitchNotifications.get(userId);
		if (!notification) {
			notification = {
				userId,
				channelIds: [],
				live: false,
				sent: false
			};
			this.twitchNotifications.set(userId, notification);
		}
		return notification;
	}
}
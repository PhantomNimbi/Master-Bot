import { DatabaseSync, type SupportedValueType } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import type {
	Account,
	Guild,
	Playlist,
	Reminder,
	Session,
	Song,
	SongInput,
	TempChannel,
	Ticket,
	TwitchNotify,
	User
} from './types.js';

let configuredDbPath: string | null = null;

/**
 * Configure the absolute path of the SQLite database file. Must be called once
 * before the database is first accessed (e.g. from the bot's env layer).
 */
export function setDatabasePath(dbPath: string): void {
	configuredDbPath = dbPath;
}

function resolveDbPath(): string {
	if (configuredDbPath) return configuredDbPath;
	const envPath = process.env.DATABASE_PATH ?? process.env.SQLITE_PATH;
	if (envPath) return envPath;
	return path.resolve(process.cwd(), 'db.sqlite');
}

/**
 * Hand-rolled SQLite data layer for Master-Bot.
 *
 * Synchronous, dependency-free node:sqlite database. The schema is defined
 * inline in `initSchema()` below (previously Prisma `prisma/schema.prisma`).
 * Follows the HELIX BotDatabase pattern: a single process-wide singleton
 * exposing typed CRUD methods. The bot selects the file path via env.ts
 * `getDbPath()` (DISCORD_DB_PATH or `<root>/data/bot.sqlite`) and calls
 * `setDatabasePath()` before first access.
 */
export class BotDatabase {
	private static instance: BotDatabase | null = null;
	private db: DatabaseSync;

	private constructor() {
		const dbPath = resolveDbPath();
		const dir = path.dirname(dbPath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		this.db = new DatabaseSync(dbPath);
		this.db.exec('PRAGMA journal_mode = WAL;');
		this.db.exec('PRAGMA foreign_keys = ON;');
		this.migrate();
	}

	public static getInstance(): BotDatabase {
		if (!BotDatabase.instance) {
			BotDatabase.instance = new BotDatabase();
		}
		return BotDatabase.instance;
	}

	public static resetInstance(): void {
		if (BotDatabase.instance) {
			BotDatabase.instance.close();
			BotDatabase.instance = null;
		}
	}

	private migrate(): void {
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS "Account" (
				"id" TEXT NOT NULL PRIMARY KEY,
				"userId" TEXT NOT NULL UNIQUE,
				"type" TEXT NOT NULL,
				"provider" TEXT NOT NULL,
				"providerAccountId" TEXT NOT NULL,
				"refresh_token" TEXT,
				"access_token" TEXT,
				"expires_at" INTEGER,
				"token_type" TEXT,
				"scope" TEXT,
				"id_token" TEXT,
				"session_state" TEXT,
				UNIQUE("provider", "providerAccountId")
			);
			CREATE TABLE IF NOT EXISTS "Session" (
				"id" TEXT NOT NULL PRIMARY KEY,
				"sessionToken" TEXT NOT NULL UNIQUE,
				"userId" TEXT NOT NULL,
				"expires" DATETIME NOT NULL
			);
			CREATE TABLE IF NOT EXISTS "User" (
				"id" TEXT NOT NULL PRIMARY KEY,
				"name" TEXT,
				"discordId" TEXT NOT NULL UNIQUE,
				"email" TEXT UNIQUE,
				"emailVerified" DATETIME,
				"image" TEXT,
				"timeOffset" INTEGER
			);
			CREATE TABLE IF NOT EXISTS "VerificationToken" (
				"identifier" TEXT NOT NULL,
				"token" TEXT NOT NULL UNIQUE,
				"expires" DATETIME NOT NULL,
				UNIQUE("identifier", "token")
			);
			CREATE TABLE IF NOT EXISTS "Song" (
				"id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
				"length" INTEGER NOT NULL,
				"track" TEXT NOT NULL,
				"identifier" TEXT NOT NULL,
				"author" TEXT NOT NULL,
				"isStream" BOOLEAN NOT NULL,
				"position" INTEGER NOT NULL,
				"title" TEXT NOT NULL,
				"uri" TEXT NOT NULL,
				"isSeekable" BOOLEAN NOT NULL,
				"sourceName" TEXT NOT NULL,
				"thumbnail" TEXT NOT NULL,
				"added" INTEGER NOT NULL,
				"playlistId" INTEGER NOT NULL,
				FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE CASCADE
			);
			CREATE TABLE IF NOT EXISTS "Playlist" (
				"id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
				"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
				"name" TEXT NOT NULL,
				"userId" TEXT,
				FOREIGN KEY ("userId") REFERENCES "User" ("id")
			);
			CREATE TABLE IF NOT EXISTS "Guild" (
				"id" TEXT NOT NULL PRIMARY KEY,
				"name" TEXT NOT NULL,
				"added" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
				"volume" INTEGER NOT NULL DEFAULT 100,
				"notifyList" TEXT NOT NULL DEFAULT '[]',
				"ownerId" TEXT NOT NULL,
				"disabledCommands" TEXT NOT NULL DEFAULT '[]',
				"logChannel" TEXT,
				"logChannelEnabled" BOOLEAN NOT NULL DEFAULT 0,
				"logEvents" TEXT NOT NULL DEFAULT '[]',
				"welcomeMessageChannel" TEXT,
				"welcomeMessage" TEXT,
				"welcomeMessageEnabled" BOOLEAN NOT NULL DEFAULT 0,
				"ticketChannel" TEXT,
				"ticketTranscriptChannel" TEXT,
				"ticketRoleId" TEXT,
				"ticketEnabled" BOOLEAN NOT NULL DEFAULT 0,
				"ticketMessage" TEXT,
				"ticketMessageEnabled" BOOLEAN NOT NULL DEFAULT 0,
				"hub" TEXT,
				"hubChannel" TEXT
			);
			CREATE TABLE IF NOT EXISTS "Ticket" (
				"id" TEXT NOT NULL PRIMARY KEY,
				"guildId" TEXT NOT NULL,
				"threadId" TEXT NOT NULL UNIQUE,
				"creatorId" TEXT NOT NULL,
				"closed" BOOLEAN NOT NULL DEFAULT 0,
				"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
				"closedAt" DATETIME,
				FOREIGN KEY ("guildId") REFERENCES "Guild" ("id")
			);
			CREATE TABLE IF NOT EXISTS "TempChannel" (
				"id" TEXT NOT NULL PRIMARY KEY,
				"guildId" TEXT NOT NULL,
				"ownerId" TEXT NOT NULL UNIQUE,
				FOREIGN KEY ("guildId") REFERENCES "Guild" ("id")
			);
			CREATE TABLE IF NOT EXISTS "TwitchNotify" (
				"twitchId" TEXT NOT NULL PRIMARY KEY,
				"logo" TEXT NOT NULL,
				"live" BOOLEAN NOT NULL DEFAULT 0,
				"channelIds" TEXT NOT NULL DEFAULT '[]',
				"sent" BOOLEAN NOT NULL DEFAULT 0
			);
			CREATE TABLE IF NOT EXISTS "Reminder" (
				"id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
				"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
				"repeat" TEXT,
				"event" TEXT NOT NULL,
				"description" TEXT,
				"dateTime" TEXT NOT NULL,
				"userId" TEXT NOT NULL,
				"timeOffset" INTEGER NOT NULL
			);
		`);
	}

	// ─── generic mapping helpers ────────────────────────────────────────────

	private all<T>(sql: string, ...params: SupportedValueType[]): T[] {
		return this.db.prepare(sql).all(...params) as T[];
	}

	private get<T>(sql: string, ...params: SupportedValueType[]): T | undefined {
		return this.db.prepare(sql).get(...params) as T | undefined;
	}

	private run(sql: string, ...params: SupportedValueType[]): { lastInsertRowid: number | bigint; changes: number | bigint } {
		return this.db.prepare(sql).run(...params);
	}

	// ─── User ───────────────────────────────────────────────────────────────

	getUserByDiscordId(discordId: string): User | null {
		const row = this.get<any>(
			'SELECT * FROM "User" WHERE "discordId" = ?',
			discordId
		);
		return row ? this.mapUser(row) : null;
	}

	getUserById(id: string): User | null {
		const row = this.get<any>('SELECT * FROM "User" WHERE "id" = ?', id);
		return row ? this.mapUser(row) : null;
	}

	upsertUser(discordId: string, name: string): User {
		const existing = this.getUserByDiscordId(discordId);
		if (existing) {
			this.run(
				'UPDATE "User" SET "name" = ? WHERE "discordId" = ?',
				name,
				discordId
			);
			return this.getUserByDiscordId(discordId)!;
		}
		const id = this.generateCuid();
		this.run(
			'INSERT INTO "User" ("id", "name", "discordId") VALUES (?, ?, ?)',
			id,
			name,
			discordId
		);
		return this.getUserByDiscordId(discordId)!;
	}

	deleteUserByDiscordId(discordId: string): User | null {
		const existing = this.getUserByDiscordId(discordId);
		if (!existing) return null;
		this.run('DELETE FROM "User" WHERE "discordId" = ?', discordId);
		return existing;
	}

	updateTimeOffset(discordId: string, timeOffset: number): number {
		this.run(
			'UPDATE "User" SET "timeOffset" = ? WHERE "discordId" = ?',
			timeOffset,
			discordId
		);
		const user = this.getUserByDiscordId(discordId);
		return user?.timeOffset ?? timeOffset;
	}

	// ─── Account (NextAuth/OAuth tokens) ────────────────────────────────────

	getAccountsByUserId(userId: string): Account[] {
		return this.all<any>(
			'SELECT * FROM "Account" WHERE "userId" = ?',
			userId
		).map(this.mapAccount);
	}

	getAccountByUserId(userId: string): Account | null {
		const row = this.get<any>('SELECT * FROM "Account" WHERE "userId" = ?', userId);
		return row ? this.mapAccount(row) : null;
	}

	createAccount(data: Omit<Account, 'id'>): Account {
		const id = this.generateCuid();
		this.run(
			`INSERT INTO "Account" (
				"id", "userId", "type", "provider", "providerAccountId",
				"refresh_token", "access_token", "expires_at", "token_type",
				"scope", "id_token", "session_state"
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			id,
			data.userId,
			data.type,
			data.provider,
			data.providerAccountId,
			data.refresh_token,
			data.access_token,
			data.expires_at,
			data.token_type,
			data.scope,
			data.id_token,
			data.session_state
		);
		return this.getAccountByUserId(data.userId)!;
	}

	updateAccountTokens(
		userId: string,
		data: {
			access_token?: string | null;
			refresh_token?: string | null;
			expires_at?: number | null;
			id_token?: string | null;
			scope?: string | null;
			token_type?: string | null;
		}
	): void {
		const sets: string[] = [];
		const params: SupportedValueType[] = [];
		for (const [key, value] of Object.entries(data)) {
			sets.push(`"${key}" = ?`);
			params.push(value);
		}
		if (sets.length > 0) {
			params.push(userId);
			this.run(`UPDATE "Account" SET ${sets.join(', ')} WHERE "userId" = ?`, ...params);
		}
	}

	// ─── Session ────────────────────────────────────────────────────────────

	getSessionByToken(sessionToken: string): Session | null {
		const row = this.get<any>(
			'SELECT * FROM "Session" WHERE "sessionToken" = ?',
			sessionToken
		);
		return row ? this.mapSession(row) : null;
	}

	createSession(sessionToken: string, userId: string, expires: Date): Session {
		const id = this.generateCuid();
		this.run(
			'INSERT INTO "Session" ("id", "sessionToken", "userId", "expires") VALUES (?, ?, ?, ?)',
			id,
			sessionToken,
			userId,
			expires.toISOString()
		);
		return this.getSessionByToken(sessionToken)!;
	}

	deleteSession(sessionToken: string): void {
		this.run('DELETE FROM "Session" WHERE "sessionToken" = ?', sessionToken);
	}

	// ─── Guild ──────────────────────────────────────────────────────────────

	getGuild(id: string): Guild | null {
		const row = this.get<any>('SELECT * FROM "Guild" WHERE "id" = ?', id);
		return row ? this.mapGuild(row) : null;
	}

	upsertGuild(id: string, ownerId: string, name: string): Guild {
		const existing = this.getGuild(id);
		if (existing) return existing;
		this.run(
			'INSERT INTO "Guild" ("id", "name", "volume", "ownerId") VALUES (?, ?, 100, ?)',
			id,
			name,
			ownerId
		);
		return this.getGuild(id)!;
	}

	upsertGuildFull(
		id: string,
		ownerId: string,
		name: string,
		notifyList: string[]
	): Guild {
		const existing = this.getGuild(id);
		if (existing) {
			this.run(
				'UPDATE "Guild" SET "notifyList" = ? WHERE "id" = ?',
				JSON.stringify(notifyList),
				id
			);
			return this.getGuild(id)!;
		}
		this.run(
			'INSERT INTO "Guild" ("id", "name", "volume", "ownerId", "notifyList") VALUES (?, ?, 100, ?, ?)',
			id,
			name,
			ownerId,
			JSON.stringify(notifyList)
		);
		return this.getGuild(id)!;
	}

	deleteGuild(id: string): Guild | null {
		const existing = this.getGuild(id);
		if (!existing) return null;
		this.run('DELETE FROM "Guild" WHERE "id" = ?', id);
		return existing;
	}

	getGuildsByOwner(ownerDiscordId: string): Guild[] {
		return this.all<any>(
			'SELECT * FROM "Guild" WHERE "ownerId" = ?',
			ownerDiscordId
		).map(this.mapGuild);
	}

	getAllGuilds(): Guild[] {
		return this.all<any>('SELECT * FROM "Guild"').map(this.mapGuild);
	}

	updateGuildVolume(guildId: string, volume: number): Guild | null {
		this.run('UPDATE "Guild" SET "volume" = ? WHERE "id" = ?', volume, guildId);
		return this.getGuild(guildId);
	}

	setGuildLogChannel(guildId: string, channelId: string | null): Guild | null {
		this.run(
			'UPDATE "Guild" SET "logChannel" = ?, "logChannelEnabled" = ? WHERE "id" = ?',
			channelId,
			channelId ? 1 : 0,
			guildId
		);
		return this.getGuild(guildId);
	}

	toggleGuildLogChannel(guildId: string, status: boolean): Guild | null {
		this.run(
			'UPDATE "Guild" SET "logChannelEnabled" = ? WHERE "id" = ?',
			status ? 1 : 0,
			guildId
		);
		return this.getGuild(guildId);
	}

	updateGuildLogEvents(guildId: string, events: string[]): Guild | null {
		this.run(
			'UPDATE "Guild" SET "logEvents" = ? WHERE "id" = ?',
			JSON.stringify(events),
			guildId
		);
		return this.getGuild(guildId);
	}

	// ─── Welcome ────────────────────────────────────────────────────────────

	setWelcomeMessage(guildId: string, message: string): Guild | null {
		this.run(
			'UPDATE "Guild" SET "welcomeMessage" = ? WHERE "id" = ?',
			message,
			guildId
		);
		return this.getGuild(guildId);
	}

	setWelcomeChannel(guildId: string, channelId: string): Guild | null {
		this.run(
			'UPDATE "Guild" SET "welcomeMessageChannel" = ? WHERE "id" = ?',
			channelId,
			guildId
		);
		return this.getGuild(guildId);
	}

	toggleWelcome(guildId: string, status: boolean): Guild | null {
		this.run(
			'UPDATE "Guild" SET "welcomeMessageEnabled" = ? WHERE "id" = ?',
			status ? 1 : 0,
			guildId
		);
		return this.getGuild(guildId);
	}

	// ─── Tickets ────────────────────────────────────────────────────────────

	setTicketChannel(guildId: string, channelId: string | null): Guild | null {
		this.run(
			'UPDATE "Guild" SET "ticketChannel" = ?, "ticketEnabled" = ? WHERE "id" = ?',
			channelId,
			channelId ? 1 : 0,
			guildId
		);
		return this.getGuild(guildId);
	}

	setTicketTranscriptChannel(guildId: string, channelId: string | null): Guild | null {
		this.run(
			'UPDATE "Guild" SET "ticketTranscriptChannel" = ? WHERE "id" = ?',
			channelId,
			guildId
		);
		return this.getGuild(guildId);
	}

	setTicketRole(guildId: string, roleId: string | null): Guild | null {
		this.run(
			'UPDATE "Guild" SET "ticketRoleId" = ? WHERE "id" = ?',
			roleId,
			guildId
		);
		return this.getGuild(guildId);
	}

	toggleTicket(guildId: string, status: boolean): Guild | null {
		this.run(
			'UPDATE "Guild" SET "ticketEnabled" = ? WHERE "id" = ?',
			status ? 1 : 0,
			guildId
		);
		return this.getGuild(guildId);
	}

	setTicketMessage(guildId: string, message: string): Guild | null {
		this.run(
			'UPDATE "Guild" SET "ticketMessage" = ? WHERE "id" = ?',
			message,
			guildId
		);
		return this.getGuild(guildId);
	}

	// ─── Hub / Temp Channels ────────────────────────────────────────────────

	setHub(guildId: string, hub: string | null, hubChannel: string | null): Guild | null {
		this.run(
			'UPDATE "Guild" SET "hub" = ?, "hubChannel" = ? WHERE "id" = ?',
			hub,
			hubChannel,
			guildId
		);
		return this.getGuild(guildId);
	}

	getTempChannel(guildId: string, ownerId: string): TempChannel | null {
		const row = this.get<any>(
			'SELECT * FROM "TempChannel" WHERE "guildId" = ? AND "ownerId" = ?',
			guildId,
			ownerId
		);
		return row ? this.mapTempChannel(row) : null;
	}

	createTempChannel(guildId: string, ownerId: string, channelId: string): TempChannel {
		this.run(
			'INSERT INTO "TempChannel" ("id", "guildId", "ownerId") VALUES (?, ?, ?)',
			channelId,
			guildId,
			ownerId
		);
		return this.getTempChannel(guildId, ownerId)!;
	}

	deleteTempChannelByChannelId(channelId: string): TempChannel | null {
		const row = this.get<any>(
			'SELECT * FROM "TempChannel" WHERE "id" = ?',
			channelId
		);
		if (!row) return null;
		this.run('DELETE FROM "TempChannel" WHERE "id" = ?', channelId);
		return this.mapTempChannel(row);
	}

	// ─── Playlists + Songs ──────────────────────────────────────────────────

	getPlaylist(userId: string, name: string): (Playlist & { songs: Song[] }) | null {
		const row = this.get<any>(
			'SELECT * FROM "Playlist" WHERE "name" = ? AND "userId" = ?',
			name,
			userId
		);
		if (!row) return null;
		const playlist = this.mapPlaylist(row);
		playlist.songs = this.getSongsForPlaylist(playlist.id);
		return playlist;
	}

	getAllPlaylists(userId: string): (Playlist & { songs: Song[] })[] {
		const rows = this.all<any>(
			'SELECT * FROM "Playlist" WHERE "userId" = ? ORDER BY "id" ASC',
			userId
		);
		return rows.map(row => {
			const playlist = this.mapPlaylist(row);
			playlist.songs = this.getSongsForPlaylist(playlist.id);
			return playlist;
		});
	}

	createPlaylist(userId: string, name: string): Playlist {
		const result = this.run(
			'INSERT INTO "Playlist" ("name", "userId") VALUES (?, ?)',
			name,
			userId
		);
		const id = Number(result.lastInsertRowid);
		return this.mapPlaylist(
			this.get<any>('SELECT * FROM "Playlist" WHERE "id" = ?', id)!
		);
	}

	deletePlaylist(userId: string, name: string): { count: number } {
		const result = this.run(
			'DELETE FROM "Playlist" WHERE "userId" = ? AND "name" = ?',
			userId,
			name
		);
		return { count: Number(result.changes) };
	}

	private getSongsForPlaylist(playlistId: number): Song[] {
		return this.all<any>(
			'SELECT * FROM "Song" WHERE "playlistId" = ? ORDER BY "position" ASC',
			playlistId
		).map(this.mapSong);
	}

	createSongs(songs: SongInput[]): { count: number } {
		const stmt = this.db.prepare(
			`INSERT INTO "Song" (
				"length", "track", "identifier", "author", "isStream", "position",
				"title", "uri", "isSeekable", "sourceName", "thumbnail", "added", "playlistId"
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		);
		let count = 0;
		for (const s of songs) {
			stmt.run(
				s.length,
				s.track,
				s.identifier,
				s.author,
				s.isStream ? 1 : 0,
				s.position,
				s.title,
				s.uri,
				s.isSeekable ? 1 : 0,
				s.sourceName,
				s.thumbnail,
				s.added,
				s.playlistId
			);
			count++;
		}
		return { count };
	}

	deleteSong(id: number): Song | null {
		const row = this.get<any>('SELECT * FROM "Song" WHERE "id" = ?', id);
		if (!row) return null;
		this.run('DELETE FROM "Song" WHERE "id" = ?', id);
		return this.mapSong(row);
	}

	getAllSongs(): Song[] {
		return this.all<any>('SELECT * FROM "Song"').map(this.mapSong);
	}

	// ─── Twitch Notify ──────────────────────────────────────────────────────

	getAllTwitchNotifications(): TwitchNotify[] {
		return this.all<any>('SELECT * FROM "TwitchNotify"').map(this.mapTwitchNotify);
	}

	getTwitchNotification(twitchId: string): TwitchNotify | null {
		const row = this.get<any>(
			'SELECT * FROM "TwitchNotify" WHERE "twitchId" = ?',
			twitchId
		);
		return row ? this.mapTwitchNotify(row) : null;
	}

	upsertTwitchNotification(
		twitchId: string,
		logo: string,
		sendTo: string[],
		initialChannelId?: string
	): void {
		const existing = this.getTwitchNotification(twitchId);
		if (existing) {
			this.run(
				'UPDATE "TwitchNotify" SET "channelIds" = ? WHERE "twitchId" = ?',
				JSON.stringify(sendTo),
				twitchId
			);
		} else {
			this.run(
				'INSERT INTO "TwitchNotify" ("twitchId", "logo", "channelIds", "sent") VALUES (?, ?, ?, 0)',
				twitchId,
				logo,
				JSON.stringify(initialChannelId ? [initialChannelId] : sendTo)
			);
		}
	}

	updateTwitchNotification(twitchId: string, channelIds: string[]): TwitchNotify | null {
		this.run(
			'UPDATE "TwitchNotify" SET "channelIds" = ? WHERE "twitchId" = ?',
			JSON.stringify(channelIds),
			twitchId
		);
		return this.getTwitchNotification(twitchId);
	}

	deleteTwitchNotification(twitchId: string): TwitchNotify | null {
		const existing = this.getTwitchNotification(twitchId);
		if (!existing) return null;
		this.run('DELETE FROM "TwitchNotify" WHERE "twitchId" = ?', twitchId);
		return existing;
	}

	updateTwitchNotificationStatus(twitchId: string, live: boolean, sent: boolean): TwitchNotify | null {
		this.run(
			'UPDATE "TwitchNotify" SET "live" = ?, "sent" = ? WHERE "twitchId" = ?',
			live ? 1 : 0,
			sent ? 1 : 0,
			twitchId
		);
		return this.getTwitchNotification(twitchId);
	}

	// ─── Tickets ────────────────────────────────────────────────────────────

	getRecentTickets(guildId: string, take = 10): Ticket[] {
		return this.all<any>(
			'SELECT * FROM "Ticket" WHERE "guildId" = ? ORDER BY "createdAt" DESC LIMIT ?',
			guildId,
			take
		).map(this.mapTicket);
	}

	getActiveTickets(guildId: string): Ticket[] {
		return this.all<any>(
			'SELECT * FROM "Ticket" WHERE "guildId" = ? AND "closed" = 0 ORDER BY "createdAt" DESC',
			guildId
		).map(this.mapTicket);
	}

	createTicket(guildId: string, threadId: string, creatorId: string): Ticket {
		const id = this.generateCuid();
		this.run(
			'INSERT INTO "Ticket" ("id", "guildId", "threadId", "creatorId") VALUES (?, ?, ?, ?)',
			id,
			guildId,
			threadId,
			creatorId
		);
		return this.getTicketByThreadId(threadId)!;
	}

	getTicketByThreadId(threadId: string): Ticket | null {
		const row = this.get<any>(
			'SELECT * FROM "Ticket" WHERE "threadId" = ?',
			threadId
		);
		return row ? this.mapTicket(row) : null;
	}

	closeTicket(threadId: string): Ticket | null {
		this.run(
			'UPDATE "Ticket" SET "closed" = 1, "closedAt" = ? WHERE "threadId" = ?',
			new Date().toISOString(),
			threadId
		);
		return this.getTicketByThreadId(threadId);
	}

	// ─── Reminders ──────────────────────────────────────────────────────────

	getAllReminders(): Reminder[] {
		return this.all<any>('SELECT * FROM "Reminder"').map(this.mapReminder);
	}

	getDueReminders(beforeIsoDate: string): Reminder[] {
		return this.all<any>(
			'SELECT * FROM "Reminder" WHERE "dateTime" <= ? ORDER BY "dateTime" ASC',
			beforeIsoDate
		).map(this.mapReminder);
	}

	getRemindersByUser(userId: string): Reminder[] {
		return this.all<any>(
			'SELECT * FROM "Reminder" WHERE "userId" = ? ORDER BY "dateTime" ASC',
			userId
		).map(this.mapReminder);
	}

	getReminderByUserAndEvent(userId: string, event: string): Reminder | null {
		const row = this.get<any>(
			'SELECT * FROM "Reminder" WHERE "userId" = ? AND "event" = ?',
			userId,
			event
		);
		return row ? this.mapReminder(row) : null;
	}

	createReminder(data: {
		userId: string;
		event: string;
		description: string | null;
		dateTime: string;
		repeat: string | null;
		timeOffset: number;
	}): Reminder {
		const result = this.run(
			'INSERT INTO "Reminder" ("event", "description", "dateTime", "repeat", "userId", "timeOffset") VALUES (?, ?, ?, ?, ?, ?)',
			data.event,
			data.description,
			data.dateTime,
			data.repeat,
			data.userId,
			data.timeOffset
		);
		const id = Number(result.lastInsertRowid);
		return this.mapReminder(
			this.get<any>('SELECT * FROM "Reminder" WHERE "id" = ?', id)!
		);
	}

	deleteRemindersByUserAndEvent(userId: string, event: string): { count: number } {
		const result = this.run(
			'DELETE FROM "Reminder" WHERE "userId" = ? AND "event" = ?',
			userId,
			event
		);
		return { count: Number(result.changes) };
	}

	deleteReminderById(id: number, userId: string): { count: number } {
		const result = this.run(
			'DELETE FROM "Reminder" WHERE "id" = ? AND "userId" = ?',
			id,
			userId
		);
		return { count: Number(result.changes) };
	}

	getRemindersByUserIdSelect(userId: string): { id: number; event: string; dateTime: string; description: string | null }[] {
		return this.all<any>(
			'SELECT "id", "event", "dateTime", "description" FROM "Reminder" WHERE "userId" = ? ORDER BY "dateTime" ASC',
			userId
		).map(row => ({
			id: Number(row.id),
			event: row.event,
			dateTime: row.dateTime,
			description: row.description
		}));
	}

	// ─── Command (disabled commands) ────────────────────────────────────────

	toggleDisabledCommand(guildId: string, commandId: string, status: boolean): Guild | null {
		const guild = this.getGuild(guildId);
		if (!guild) return null;
		const current: string[] = this.parseJsonArray(guild.disabledCommands);
		let updated: string[];
		if (status) {
			updated = Array.from(new Set([...current, commandId]));
		} else {
			updated = current.filter(cid => cid !== commandId);
		}
		this.run(
			'UPDATE "Guild" SET "disabledCommands" = ? WHERE "id" = ?',
			JSON.stringify(updated),
			guildId
		);
		return this.getGuild(guildId);
	}

	// ─── Stats / Health ─────────────────────────────────────────────────────

	getStats(): {
		guildCount: number;
		userCount: number;
		playlistCount: number;
		songCount: number;
		ticketCount: number;
		tempChannelCount: number;
		twitchNotifyCount: number;
		reminderCount: number;
		sizeBytes: number;
	} {
		return {
			guildCount: this.countRows('Guild'),
			userCount: this.countRows('User'),
			playlistCount: this.countRows('Playlist'),
			songCount: this.countRows('Song'),
			ticketCount: this.countRows('Ticket'),
			tempChannelCount: this.countRows('TempChannel'),
			twitchNotifyCount: this.countRows('TwitchNotify'),
			reminderCount: this.countRows('Reminder'),
			sizeBytes: this.fileSize()
		};
	}

	ping(): boolean {
		try {
			this.db.prepare('SELECT 1').get();
			return true;
		} catch {
			return false;
		}
	}

	private countRows(table: string): number {
		const row = this.get<any>(`SELECT COUNT(*) AS c FROM "${table}"`);
		return Number(row?.c ?? 0);
	}

	private fileSize(): number {
		try {
			return fs.statSync(resolveDbPath()).size;
		} catch {
			return 0;
		}
	}

	// ─── row mappers ────────────────────────────────────────────────────────

	private mapUser = (r: any): User => ({
		id: r.id,
		name: r.name,
		discordId: r.discordId,
		email: r.email,
		emailVerified: r.emailVerified,
		image: r.image,
		timeOffset: r.timeOffset
	});

	private mapAccount = (r: any): Account => ({
		id: r.id,
		userId: r.userId,
		type: r.type,
		provider: r.provider,
		providerAccountId: r.providerAccountId,
		refresh_token: r.refresh_token,
		access_token: r.access_token,
		expires_at: r.expires_at,
		token_type: r.token_type,
		scope: r.scope,
		id_token: r.id_token,
		session_state: r.session_state
	});

	private mapSession = (r: any): Session => ({
		id: r.id,
		sessionToken: r.sessionToken,
		userId: r.userId,
		expires: r.expires
	});

	private mapGuild = (r: any): Guild => ({
		id: r.id,
		name: r.name,
		added: r.added,
		volume: Number(r.volume),
		notifyList: r.notifyList,
		ownerId: r.ownerId,
		disabledCommands: r.disabledCommands,
		logChannel: r.logChannel,
		logChannelEnabled: Boolean(r.logChannelEnabled),
		logEvents: r.logEvents,
		welcomeMessageChannel: r.welcomeMessageChannel,
		welcomeMessage: r.welcomeMessage,
		welcomeMessageEnabled: Boolean(r.welcomeMessageEnabled),
		ticketChannel: r.ticketChannel,
		ticketTranscriptChannel: r.ticketTranscriptChannel,
		ticketRoleId: r.ticketRoleId,
		ticketEnabled: Boolean(r.ticketEnabled),
		ticketMessage: r.ticketMessage,
		ticketMessageEnabled: Boolean(r.ticketMessageEnabled),
		hub: r.hub,
		hubChannel: r.hubChannel
	});

	private mapSong = (r: any): Song => ({
		id: Number(r.id),
		length: Number(r.length),
		track: r.track,
		identifier: r.identifier,
		author: r.author,
		isStream: Boolean(r.isStream),
		position: Number(r.position),
		title: r.title,
		uri: r.uri,
		isSeekable: Boolean(r.isSeekable),
		sourceName: r.sourceName,
		thumbnail: r.thumbnail,
		added: Number(r.added),
		playlistId: Number(r.playlistId)
	});

	private mapPlaylist = (r: any): Playlist => ({
		id: Number(r.id),
		createdAt: r.createdAt,
		name: r.name,
		userId: r.userId,
		songs: []
	});

	private mapTicket = (r: any): Ticket => ({
		id: r.id,
		guildId: r.guildId,
		threadId: r.threadId,
		creatorId: r.creatorId,
		closed: Boolean(r.closed),
		createdAt: r.createdAt,
		closedAt: r.closedAt
	});

	private mapTempChannel = (r: any): TempChannel => ({
		id: r.id,
		guildId: r.guildId,
		ownerId: r.ownerId
	});

	private mapTwitchNotify = (r: any): TwitchNotify => ({
		twitchId: r.twitchId,
		logo: r.logo,
		live: Boolean(r.live),
		channelIds: r.channelIds,
		sent: Boolean(r.sent)
	});

	private mapReminder = (r: any): Reminder => ({
		id: Number(r.id),
		createdAt: r.createdAt,
		repeat: r.repeat,
		event: r.event,
		description: r.description,
		dateTime: r.dateTime,
		userId: r.userId,
		timeOffset: Number(r.timeOffset)
	});

	private parseJsonArray(raw: string): string[] {
		try {
			const parsed = JSON.parse(raw || '[]');
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}

	private generateCuid(): string {
		const ts = Date.now().toString(36);
		const rand = Math.random().toString(36).slice(2, 10);
		const rand2 = Math.random().toString(36).slice(2, 10);
		return `c${ts}${rand}${rand2}`;
	}

	public close(): void {
		try {
			this.db.close();
		} catch {
			// ignore
		}
	}
}

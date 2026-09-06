import { describe, expect, it } from 'vitest';
import { setDatabasePath, BotDatabase } from '@master-bot/db';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

describe('BotDatabase Module', () => {
	let db: BotDatabase;
	let dbPath: string;

	beforeEach(() => {
		dbPath = path.join(
			fs.mkdtempSync(path.join(os.tmpdir(), 'master-bot-db-')),
			'test.sqlite'
		);
		setDatabasePath(dbPath);
		BotDatabase.resetInstance();
		db = BotDatabase.getInstance();
	});

	afterEach(() => {
		BotDatabase.resetInstance();
		setDatabasePath('');
		fs.rmSync(path.dirname(dbPath), { recursive: true, force: true });
	});

	it('exposes a singleton instance and a reset hook', () => {
		expect(BotDatabase.getInstance()).toBe(db);
		BotDatabase.resetInstance();
		expect(BotDatabase.getInstance()).not.toBe(db);
	});

	it('round-trips a user through upsert and getters', () => {
		const user = db.upsertUser('discord-1', 'Tester');
		expect(user.discordId).toBe('discord-1');
		expect(db.getUserByDiscordId('discord-1')).toEqual(user);
		expect(db.getUserById(user.id)).toEqual(user);
	});

	it('creates, retrieves and deletes playlists', () => {
		db.upsertUser('discord-1', 'Tester');
		const user = db.getUserByDiscordId('discord-1')!;

		const playlist = db.createPlaylist(user.id, 'Vibes');
		expect(playlist.name).toBe('Vibes');
		expect(db.getPlaylist(user.id, 'Vibes')?.name).toBe('Vibes');
		expect(db.getAllPlaylists(user.id).length).toBe(1);

		const songs = db.createSongs([
			{
				length: 180,
				track: 'Song A',
				identifier: 'song-a',
				author: 'Artist',
				isStream: false,
				position: 1,
				title: 'Song A',
				uri: 'https://example.com/song-a',
				isSeekable: true,
				sourceName: 'https',
				thumbnail: '',
				added: Date.now(),
				playlistId: playlist.id
			}
		]);
		expect(songs.count).toBe(1);

		const withSongs = db.getPlaylist(user.id, 'Vibes');
		expect(withSongs?.songs.length).toBe(1);
		expect(withSongs?.songs[0]?.title).toBe('Song A');

		db.deletePlaylist(user.id, 'Vibes');
		expect(db.getPlaylist(user.id, 'Vibes')).toBeNull();
	});

	it('round-trips twitch notifications with channel lists', () => {
		db.upsertTwitchNotification('twitch-1', 'logo.png', ['c-1', 'c-2']);
		const note = db.getTwitchNotification('twitch-1');
		expect(note).not.toBeNull();
		expect(note!.channelIds).toBe('["c-1","c-2"]');
		expect(db.getAllTwitchNotifications().length).toBe(1);

		const removed = db.deleteTwitchNotification('twitch-1');
		expect(removed).not.toBeNull();
		expect(db.getTwitchNotification('twitch-1')).toBeNull();
	});

	it('creates and resolves temp channels for a guild', () => {
		db.upsertGuild('guild-1', 'owner-1', 'Guild 1');
		db.createTempChannel('guild-1', 'owner-1', 'channel-1');
		const found = db.getTempChannel('guild-1', 'owner-1');
		expect(found).not.toBeNull();
		expect(found!.id).toBe('channel-1');

		db.deleteTempChannelByChannelId('channel-1');
		expect(db.getTempChannel('guild-1', 'owner-1')).toBeNull();
	});
});
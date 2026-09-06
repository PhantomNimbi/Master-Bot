import { describe, expect, it } from 'vitest';
import { setDatabasePath, BotDatabase } from '@master-bot/db';
import { dataService } from '@master-bot/dataService';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

describe('Data Service API', () => {
	let dbPath: string;

	beforeEach(() => {
		dbPath = path.join(
			fs.mkdtempSync(path.join(os.tmpdir(), 'master-bot-ds-')),
			'test.sqlite'
		);
		setDatabasePath(dbPath);
		BotDatabase.resetInstance();
	});

	afterEach(() => {
		BotDatabase.resetInstance();
		setDatabasePath('');
		fs.rmSync(path.dirname(dbPath), { recursive: true, force: true });
	});

	it('exposes all core data service namespaces', () => {
		for (const ns of [
			'user',
			'playlist',
			'song',
			'guild',
			'hub',
			'twitch',
			'command',
			'tickets',
			'welcome',
			'reminder'
		]) {
			expect(dataService).toHaveProperty(ns);
		}
	});

	it('creates and retrieves playlists for a user', async () => {
		const { user } = await dataService.user.create({
			id: 'user-1',
			name: 'Tester'
		});
		const { playlist } = await dataService.playlist.create({
			userId: user.id,
			name: 'Vibes'
		});
		expect(playlist.name).toBe('Vibes');

		const { playlists } = await dataService.playlist.getAll({
			userId: user.id
		});
		expect(playlists.length).toBe(1);
	});

	it('avoids cross-user playlist leakage', async () => {
		const { user } = await dataService.user.create({
			id: 'user-1',
			name: 'Tester'
		});
		await dataService.playlist.create({ userId: user.id, name: 'Private' });
		const { playlists } = await dataService.playlist.getAll({
			userId: 'user-2'
		});
		expect(playlists.length).toBe(0);
	});

	it('round-trips a twitch notification through the twitch namespace', async () => {
		await dataService.twitch.create({
			userId: 'twitch-1',
			userImage: 'https://example.com/logo.png',
			channelId: 'channel-1',
			sendTo: ['channel-1', 'channel-2']
		});

		const { notification } = await dataService.twitch.findUserById({
			id: 'twitch-1'
		});
		expect(notification).not.toBeNull();
		expect(notification?.channelIds).toEqual(['channel-1']);
	});

	it('returns disabled commands for a guild', async () => {
		const { disabledCommands } = await dataService.command.getDisabledCommands({
			guildId: 'guild-1'
		});
		expect(disabledCommands).toEqual([]);
	});

	it('returns null for unknown guilds', async () => {
		const { guild } = await dataService.guild.getGuild({ id: 'guild-1' });
		expect(guild).toBeNull();
	});
});
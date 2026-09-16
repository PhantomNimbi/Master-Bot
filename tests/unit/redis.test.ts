import { describe, it, expect, beforeEach } from 'vitest';
import { getRedisClient, redis } from '../../packages/db/index';

describe('Zero-Binary In-Memory Redis (ioredis-mock)', () => {
	beforeEach(async () => {
		await redis.flushall();
	});

	it('should initialize and connect without an external Redis server binary', async () => {
		expect(redis).toBeDefined();
		const client = getRedisClient();
		expect(client).toBe(redis); // verify singleton
	});

	it('should perform basic key-value operations in memory', async () => {
		await redis.set('test:key', 'hello-world');
		const val = await redis.get('test:key');
		expect(val).toBe('hello-world');

		await redis.del('test:key');
		const missing = await redis.get('test:key');
		expect(missing).toBeNull();
	});

	it('should accurately handle guild hashes used by the bot and dashboard', async () => {
		const guildData = {
			id: '123456789012345678',
			name: 'Test Server',
			icon: null
		};

		// Bot syncs guild to Redis
		await redis.hset('guilds', guildData.id, JSON.stringify(guildData));

		// Dashboard reads single guild
		const singleRaw = await redis.hget('guilds', guildData.id);
		expect(singleRaw).toBeDefined();
		const singleParsed = JSON.parse(singleRaw!);
		expect(singleParsed.name).toBe('Test Server');

		// Dashboard reads all guilds
		const allGuilds = await redis.hgetall('guilds');
		expect(allGuilds[guildData.id]).toBeDefined();

		// Deletion
		await redis.hdel('guilds', guildData.id);
		const afterDel = await redis.hget('guilds', guildData.id);
		expect(afterDel).toBeNull();
	});

	it('should support defineCommand for custom Lua audio commands', async () => {
		expect(typeof (redis as any).defineCommand).toBe('function');

		(redis as any).defineCommand('testMultiply', {
			numberOfKeys: 1,
			lua: 'return redis.call("GET", KEYS[1]) * ARGV[1]'
		});

		await redis.set('math:num', 5);
		const result = await (redis as any).testMultiply('math:num', 10);
		expect(Number(result)).toBe(50);
	});

	it('should share memory state across multiple getRedisClient calls', async () => {
		const clientA = getRedisClient();
		const clientB = getRedisClient();

		await clientA.set('shared:test', 'sync-value');
		const valueFromB = await clientB.get('shared:test');
		expect(valueFromB).toBe('sync-value');
	});

	it('should strictly use in-memory mock without attempting external connection even if REDIS_URL is present', async () => {
		const originalUrl = process.env.REDIS_URL;
		const originalHost = process.env.REDIS_HOST;
		try {
			process.env.REDIS_URL = 'redis://invalid-host-that-does-not-exist:9999';
			process.env.REDIS_HOST = 'invalid-host-that-does-not-exist';

			const client = getRedisClient();
			// Setting and getting should still succeed instantaneously in memory without network timeout or error
			await client.set('env:test', 'isolated-in-memory');
			const val = await client.get('env:test');
			expect(val).toBe('isolated-in-memory');
		} finally {
			process.env.REDIS_URL = originalUrl;
			process.env.REDIS_HOST = originalHost;
		}
	});
});


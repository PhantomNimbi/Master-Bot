import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDatabaseProvider, isUsingMockRedis, getRedisClient, redis } from '@master-bot/db';

describe('Dual Database & Redis Fallback Architecture', () => {
	const originalDbUri = process.env.DB_URI;
	const originalRedisUrl = process.env.REDIS_URL;
	const originalRedisHost = process.env.REDIS_HOST;

	afterEach(() => {
		process.env.DB_URI = originalDbUri;
		process.env.REDIS_URL = originalRedisUrl;
		process.env.REDIS_HOST = originalRedisHost;
	});

	describe('Database Provider Reflection', () => {
		it('should detect SQLite provider when DB_URI is file:/data/db.sqlite', () => {
			process.env.DB_URI = 'file:/data/db.sqlite';
			expect(getDatabaseProvider()).toBe('sqlite');
		});

		it('should detect SQLite provider when DB_URI is unset or empty', () => {
			delete process.env.DB_URI;
			expect(getDatabaseProvider()).toBe('sqlite');
		});

		it('should detect PostgreSQL provider when DB_URI starts with postgresql://', () => {
			process.env.DB_URI = 'postgresql://postgres:secret@localhost:5432/masterbot';
			expect(getDatabaseProvider()).toBe('postgresql');
		});

		it('should detect PostgreSQL provider when DB_URI starts with postgres://', () => {
			process.env.DB_URI = 'postgres://user:password@host:5432/dbname';
			expect(getDatabaseProvider()).toBe('postgresql');
		});
	});

	describe('Redis In-Memory Fallback', () => {
		it('should identify active client as in-memory fallback when no external server is present', () => {
			expect(isUsingMockRedis()).toBe(true);
		});

		it('should perform all common cache operations against the fallback client', async () => {
			const client = getRedisClient();
			await client.set('fallback:key', 'active-fallback-value');
			const value = await client.get('fallback:key');
			expect(value).toBe('active-fallback-value');
			await client.del('fallback:key');
		});

		it('should handle JSON serialization for guild settings in fallback mode', async () => {
			const payload = {
				id: '999888777',
				name: 'Fallback Guild',
				volume: 85
			};

			await redis.hset('guilds', payload.id, JSON.stringify(payload));
			const raw = await redis.hget('guilds', payload.id);
			expect(raw).toBeDefined();

			const parsed = JSON.parse(raw!);
			expect(parsed.name).toBe('Fallback Guild');
			expect(parsed.volume).toBe(85);

			await redis.hdel('guilds', payload.id);
		});
	});
});

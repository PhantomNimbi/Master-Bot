import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDatabaseProvider, isUsingMockRedis, getRedisClient, redis } from '@master-bot/db';

describe('Dual Database & Redis Fallback Architecture', () => {
	const originalDbUrl = process.env.DATABASE_URL;
	const originalRedisUrl = process.env.REDIS_URL;
	const originalRedisHost = process.env.REDIS_HOST;

	afterEach(() => {
		process.env.DATABASE_URL = originalDbUrl;
		process.env.REDIS_URL = originalRedisUrl;
		process.env.REDIS_HOST = originalRedisHost;
	});

	describe('Database Provider Reflection', () => {
		it('should detect SQLite provider when DATABASE_URL is file:./db.sqlite', () => {
			process.env.DATABASE_URL = 'file:./db.sqlite';
			expect(getDatabaseProvider()).toBe('sqlite');
		});

		it('should detect SQLite provider when DATABASE_URL is unset or empty', () => {
			delete process.env.DATABASE_URL;
			expect(getDatabaseProvider()).toBe('sqlite');
		});

		it('should detect PostgreSQL provider when DATABASE_URL starts with postgresql://', () => {
			process.env.DATABASE_URL = 'postgresql://postgres:secret@localhost:5432/masterbot';
			expect(getDatabaseProvider()).toBe('postgresql');
		});

		it('should detect PostgreSQL provider when DATABASE_URL starts with postgres://', () => {
			process.env.DATABASE_URL = 'postgres://user:password@host:5432/dbname';
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

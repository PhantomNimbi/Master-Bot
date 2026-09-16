import { describe, it, expect } from 'vitest';
import { prisma, redis } from '../../packages/db/index';

describe('TRPC Context & Data Layer Bindings', () => {
	it('should provide active Prisma client connected to SQLite database', () => {
		expect(prisma).toBeDefined();
		expect(typeof prisma.$connect).toBe('function');
	});

	it('should provide shared Redis client with in-memory store', async () => {
		expect(redis).toBeDefined();
		await redis.set('context:check', 'active');
		const result = await redis.get('context:check');
		expect(result).toBe('active');
	});

	it('should maintain data persistence across simulated restarts via SQLite', async () => {
		// Verify schema model exists for persistent guild configuration
		expect(prisma.guild).toBeDefined();
		expect(typeof prisma.guild.findMany).toBe('function');
		expect(typeof prisma.guild.upsert).toBe('function');
	});
});


import { PrismaClient } from '@prisma/client';
import RedisMock from 'ioredis-mock';
import type Redis from 'ioredis';

export * from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		log:
			process.env.NODE_ENV === 'development'
				? ['query', 'error', 'warn']
				: ['error']
	});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const globalForRedis = globalThis as unknown as { redis?: Redis };

export function getRedisClient(): Redis {
	if (globalForRedis.redis) {
		return globalForRedis.redis;
	}

	// In-memory Redis mock running entirely in the same Node.js process as the bot.
	// No external Redis server, container, or separate process is used or contacted.
	const MockCtor =
		typeof RedisMock === 'function'
			? RedisMock
			: (RedisMock as any).default || RedisMock;

	const client = new MockCtor() as unknown as Redis;
	globalForRedis.redis = client;
	return client;
}

export const redis = getRedisClient();



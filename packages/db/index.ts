import { PrismaClient } from '@prisma/client';
import RedisMock from 'ioredis-mock';
import RealRedis from 'ioredis';
import type Redis from 'ioredis';

export * from '@prisma/client';

export function getDatabaseProvider(): 'postgresql' | 'sqlite' {
	const url = process.env.DATABASE_URL?.trim() || '';
	return url.startsWith('postgresql:') || url.startsWith('postgres:')
		? 'postgresql'
		: 'sqlite';
}

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

interface RedisState {
	redis?: Redis;
	isMock: boolean;
}

const globalForRedis = globalThis as unknown as { redisState?: RedisState };

function createMockRedis(): Redis {
	const MockCtor =
		typeof RedisMock === 'function'
			? RedisMock
			: (RedisMock as any).default || RedisMock;

	return new MockCtor() as unknown as Redis;
}

export function getRedisClient(): Redis {
	if (globalForRedis.redisState?.redis) {
		return globalForRedis.redisState.redis;
	}

	const redisUrl = process.env.REDIS_URL?.trim();
	const redisHost = process.env.REDIS_HOST?.trim();
	const forceMock = process.env.REDIS_FALLBACK === 'true';

	// If no external Redis is configured or forceMock is requested, use internal ioredis-mock directly
	if (forceMock || (!redisUrl && !redisHost)) {
		const mockClient = createMockRedis();
		globalForRedis.redisState = { redis: mockClient, isMock: true };
		return mockClient;
	}

	try {
		const options = {
			maxRetriesPerRequest: 2,
			connectTimeout: 3000,
			retryStrategy(times: number) {
				if (times > 2) return null;
				return Math.min(times * 200, 1000);
			}
		};

		const realClient = redisUrl
			? new RealRedis(redisUrl, options)
			: new RealRedis({
					host: redisHost,
					port: process.env.REDIS_PORT ? Number.parseInt(process.env.REDIS_PORT, 10) : 6379,
					password: process.env.REDIS_PASSWORD || undefined,
					...options
				});

		realClient.on('error', (err: any) => {
			if (globalForRedis.redisState?.isMock) return;
			console.warn(
				`[packages/db] External Redis encountered error (${err?.code || err?.message || 'unknown'}). Active commands continue with fallback.`
			);
		});

		globalForRedis.redisState = { redis: realClient, isMock: false };
		return realClient;
	} catch (err: any) {
		console.warn(
			`[packages/db] Failed to initialize external Redis (${err?.message}). Falling back to internal ioredis-mock.`
		);
		const fallback = createMockRedis();
		globalForRedis.redisState = { redis: fallback, isMock: true };
		return fallback;
	}
}

export function isUsingMockRedis(): boolean {
	return globalForRedis.redisState?.isMock ?? true;
}

export const redis = getRedisClient();




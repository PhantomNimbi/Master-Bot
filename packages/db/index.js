import { PrismaClient } from '@prisma/client';
import RedisMock from 'ioredis-mock';
export * from '@prisma/client';
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error']
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = prisma;
const globalForRedis = globalThis;
export function getRedisClient() {
    if (globalForRedis.redis) {
        return globalForRedis.redis;
    }
    // In-memory Redis mock running entirely in the same Node.js process as the bot.
    // No external Redis server, container, or separate process is used or contacted.
    const MockCtor = typeof RedisMock === 'function'
        ? RedisMock
        : RedisMock.default || RedisMock;
    const client = new MockCtor();
    globalForRedis.redis = client;
    return client;
}
export const redis = getRedisClient();

var _a;
import { PrismaClient } from '@prisma/client';
import RedisMock from 'ioredis-mock';
import RealRedis from 'ioredis';
export * from '@prisma/client';
export function getDatabaseProvider() {
    var _a;
    const url = ((_a = process.env.DB_URI) === null || _a === void 0 ? void 0 : _a.trim()) || '';
    return url.startsWith('postgresql:') || url.startsWith('postgres:')
        ? 'postgresql'
        : 'sqlite';
}
const rawDbUrl = ((_a = process.env.DB_URI) === null || _a === void 0 ? void 0 : _a.trim()) || 'file:/data/db.sqlite';
if (!process.env.DB_URI) {
    process.env.DB_URI = rawDbUrl;
}
if (!rawDbUrl.startsWith('postgresql:') && !rawDbUrl.startsWith('postgres:')) {
    try {
        const fs = require('node:fs');
        const path = require('node:path');
        const dbFilePath = rawDbUrl.replace(/^file:/, '');
        const dir = path.dirname(dbFilePath);
        if (dir && !fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (path.basename(dbFilePath) === 'db.sqlite' && !fs.existsSync(dbFilePath)) {
            const legacyPath = path.join(dir, 'database.db');
            if (fs.existsSync(legacyPath)) {
                fs.copyFileSync(legacyPath, dbFilePath);
            }
        }
    }
    catch (_b) { }
}
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
function createMockRedis() {
    const MockCtor = typeof RedisMock === 'function'
        ? RedisMock
        : RedisMock.default || RedisMock;
    return new MockCtor();
}
export function getRedisClient() {
    var _a, _b, _c;
    if ((_a = globalForRedis.redisState) === null || _a === void 0 ? void 0 : _a.redis) {
        return globalForRedis.redisState.redis;
    }
    const redisUrl = (_b = process.env.REDIS_URL) === null || _b === void 0 ? void 0 : _b.trim();
    const redisHost = (_c = process.env.REDIS_HOST) === null || _c === void 0 ? void 0 : _c.trim();
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
            retryStrategy(times) {
                if (times > 2)
                    return null;
                return Math.min(times * 200, 1000);
            }
        };
        const realClient = redisUrl
            ? new RealRedis(redisUrl, options)
            : new RealRedis(Object.assign({ host: redisHost, port: process.env.REDIS_PORT ? Number.parseInt(process.env.REDIS_PORT, 10) : 6379, password: process.env.REDIS_PASSWORD || undefined }, options));
        realClient.on('error', (err) => {
            var _a;
            if ((_a = globalForRedis.redisState) === null || _a === void 0 ? void 0 : _a.isMock)
                return;
            console.warn(`[packages/db] External Redis encountered error (${(err === null || err === void 0 ? void 0 : err.code) || (err === null || err === void 0 ? void 0 : err.message) || 'unknown'}). Active commands continue with fallback.`);
        });
        globalForRedis.redisState = { redis: realClient, isMock: false };
        return realClient;
    }
    catch (err) {
        console.warn(`[packages/db] Failed to initialize external Redis (${err === null || err === void 0 ? void 0 : err.message}). Falling back to internal ioredis-mock.`);
        const fallback = createMockRedis();
        globalForRedis.redisState = { redis: fallback, isMock: true };
        return fallback;
    }
}
export function isUsingMockRedis() {
    var _a, _b;
    return (_b = (_a = globalForRedis.redisState) === null || _a === void 0 ? void 0 : _a.isMock) !== null && _b !== void 0 ? _b : true;
}
export const redis = getRedisClient();

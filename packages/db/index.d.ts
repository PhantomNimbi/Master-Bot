import { PrismaClient } from '@prisma/client';
import RealRedis from 'ioredis';
import type Redis from 'ioredis';
export * from '@prisma/client';
export declare function getDatabaseProvider(): 'postgresql' | 'sqlite';
export declare const prisma: PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare function getRedisClient(): Redis;
export declare function isUsingMockRedis(): boolean;
export declare const redis: RealRedis;

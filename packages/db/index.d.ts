import { PrismaClient } from '@prisma/client';
import type Redis from 'ioredis';
export * from '@prisma/client';
export declare const prisma: PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare function getRedisClient(): Redis;
export declare const redis: Redis;

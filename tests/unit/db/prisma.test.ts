import { describe, expect, it } from 'vitest';
import { prisma, PrismaClient } from '@master-bot/db';

describe('Prisma Database Module', () => {
	it('exports PrismaClient constructor and prisma singleton instance', () => {
		expect(PrismaClient).toBeDefined();
		expect(prisma).toBeDefined();
	});

	it('maintains global prisma instance across module evaluations', () => {
		const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
		if (process.env.NODE_ENV !== 'production') {
			expect(globalForPrisma.prisma).toBe(prisma);
		}
	});
});

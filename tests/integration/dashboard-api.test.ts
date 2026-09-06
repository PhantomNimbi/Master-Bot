import { describe, expect, it, vi } from 'vitest';
import { appRouter } from '@master-bot/api';
import type { Session } from '@master-bot/auth';

describe('Dashboard tRPC API Integration', () => {
	const mockSession: Session = {
		user: {
			id: 'user-123',
			discordId: '123456789012345678',
			name: 'Test Admin',
			email: 'admin@example.com',
			image: 'https://cdn.discordapp.com/embed/avatars/0.png'
		},
		expires: new Date(Date.now() + 3600 * 1000).toISOString()
	};

	it('rejects unauthorized calls on protected procedures without a session', async () => {
		const unauthedCaller = appRouter.createCaller({
			session: null,
			prisma: {} as any
		});

		// guild.getGuild requires authentication
		await expect(
			unauthedCaller.guild.getGuild({ id: '123456789' })
		).rejects.toThrow();
	});

	it('allows authenticated caller creation with valid context', () => {
		const authedCaller = appRouter.createCaller({
			session: mockSession,
			prisma: {} as any
		});

		expect(authedCaller).toBeDefined();
		expect(typeof authedCaller.guild.getGuild).toBe('function');
		expect(typeof authedCaller.command.getCommands).toBe('function');
	});
});

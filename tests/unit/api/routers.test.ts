import { describe, expect, it } from 'vitest';
import { appRouter } from '@master-bot/api';

describe('tRPC AppRouter Module', () => {
	it('defines all core router procedures on appRouter', () => {
		expect(appRouter).toBeDefined();
		expect(appRouter._def.procedures).toBeDefined();
	});

	it('contains all essential sub-routers', () => {
		const procedureKeys = Object.keys(appRouter._def.procedures);

		const expectedPrefixes = [
			'user.',
			'guild.',
			'playlist.',
			'song.',
			'twitch.',
			'channel.',
			'welcome.',
			'tickets.',
			'command.',
			'hub.',
			'reminder.',
			'logs.',
			'music.',
			'broadcast.',
			'system.'
		];

		for (const prefix of expectedPrefixes) {
			const matching = procedureKeys.filter(k => k.startsWith(prefix));
			expect(matching.length).toBeGreaterThan(0);
		}
	});
});

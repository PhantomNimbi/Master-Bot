import { describe, expect, it, vi } from 'vitest';

vi.mock('next-auth', () => ({
	default: vi.fn(() => ({
		handlers: { GET: vi.fn(), POST: vi.fn() },
		auth: vi.fn(),
		signIn: vi.fn(),
		signOut: vi.fn()
	}))
}));

import { providers } from '@master-bot/auth';

describe('Auth Configuration Module', () => {
	it('defines supported OAuth providers', () => {
		expect(providers).toContain('discord');
		expect(Array.isArray(providers)).toBe(true);
	});
});

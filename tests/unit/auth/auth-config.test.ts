import { describe, expect, it } from 'vitest';
import {
	createSessionToken,
	getDashboardUrl,
	getNextAuthConfig,
	normalizeCallbackBaseUrl,
	verifySessionToken
} from '../../../apps/dashboard/src/auth/config.js';

const originalEnv = process.env;

describe('Dashboard Auth Configuration Module', () => {
	afterEach(() => {
		process.env = { ...originalEnv };
	});

	it('normalizes a bare callback base url', () => {
		expect(normalizeCallbackBaseUrl('http://localhost:3000')).toBe(
			'http://localhost:3000'
		);
	});

	it('strips the callback path from a full callback url', () => {
		expect(
			normalizeCallbackBaseUrl('http://localhost:3000/api/auth/callback/discord')
		).toBe('http://localhost:3000');
	});

	it('auto-resolves the dashboard url to localhost when unset', () => {
		delete process.env.NEXTAUTH_URL;
		delete process.env.DISCORD_CALLBACK_URL;
		process.env.PORT = '3000';
		expect(getDashboardUrl()).toBe('http://localhost:3000');
	});

	it('builds a nextauth-compatible config from environment', () => {
		process.env.DISCORD_CLIENT_ID = 'client-123';
		process.env.DISCORD_CLIENT_SECRET = 'secret-456';
		const config = getNextAuthConfig();
		expect(config.clientId).toBe('client-123');
		expect(config.clientSecret).toBe('secret-456');
		expect(config.secret.length).toBeGreaterThan(0);
	});

	it('round-trips session tokens through sign/verify', () => {
		const token = createSessionToken({
			id: 'user-1',
			name: 'Test Admin'
		});
		expect(token).toContain('.');

		const payload = verifySessionToken(token);
		expect(payload).not.toBeNull();
		expect(payload.id).toBe('user-1');
		expect(payload.name).toBe('Test Admin');
	});

	it('rejects tampered session tokens', () => {
		const token = createSessionToken({ id: 'user-1', name: 'Test Admin' });
		const tampered = token.slice(0, -4) + 'AAAA';
		expect(verifySessionToken(tampered)).toBeNull();
	});

	it('rejects malformed or missing tokens', () => {
		expect(verifySessionToken(undefined)).toBeNull();
		expect(verifySessionToken('not-a-token')).toBeNull();
	});
});
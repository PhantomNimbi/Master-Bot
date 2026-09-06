import { describe, it, expect } from 'vitest';
import { getPort } from '../../apps/bot/src/env';

describe('Environment Variable Utilities', () => {
	it('should handle boolean flags properly', () => {
		const parseBool = (
			val: string | undefined,
			defaultVal = false
		): boolean => {
			if (val === undefined) return defaultVal;
			return val.toLowerCase() === 'true' || val === '1';
		};

		expect(parseBool('true')).toBe(true);
		expect(parseBool('TRUE')).toBe(true);
		expect(parseBool('1')).toBe(true);
		expect(parseBool('false')).toBe(false);
		expect(parseBool(undefined, true)).toBe(true);
		expect(parseBool(undefined, false)).toBe(false);
	});

	it('defaults the unified HTTP port to 3000', () => {
		delete process.env.PORT;
		expect(getPort()).toBe(3000);
	});

	it('resolves the unified HTTP port from a single PORT key', () => {
		process.env.PORT = '4321';
		expect(getPort()).toBe(4321);
		delete process.env.PORT;
		expect(getPort()).toBe(3000);
	});

	it('falls back to 3000 for a non-numeric PORT', () => {
		process.env.PORT = 'invalid';
		expect(getPort()).toBe(3000);
		delete process.env.PORT;
	});

	it('ignores legacy separate dashboard/bot port keys', () => {
		delete process.env.PORT;
		process.env.DASHBOARD_PORT = '7000';
		process.env.BOT_PORT = '7001';
		expect(getPort()).toBe(3000);
		delete process.env.DASHBOARD_PORT;
		delete process.env.BOT_PORT;
	});
});
import { describe, it, expect } from 'vitest';

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

	it('should resolve default port configurations', () => {
		const dashboardPort = parseInt(process.env.DASHBOARD_PORT || '3000', 10);
		const botPort = parseInt(process.env.BOT_PORT || '3001', 10);
		const botApiPort = parseInt(process.env.BOT_API_PORT || '3002', 10);

		expect(dashboardPort).toBe(3000);
		expect(botPort).toBe(3001);
		expect(botApiPort).toBe(3002);
		expect(new Set([dashboardPort, botPort, botApiPort]).size).toBe(3);
	});
});

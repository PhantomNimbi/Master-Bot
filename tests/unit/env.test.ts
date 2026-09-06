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
		const defaultPort = parseInt(process.env.PORT || '3000', 10);
		expect(defaultPort).toBeGreaterThan(0);
	});
});

import { describe, expect, it } from 'vitest';
import {
	extractPortFromUrl,
	rootDir,
	logsDir
} from '../../../scripts/common.mjs';
import { existsSync } from 'fs';

describe('Common Lifecycle Script Helpers', () => {
	it('resolves valid rootDir and logsDir paths', () => {
		expect(rootDir).toBeDefined();
		expect(existsSync(rootDir)).toBe(true);
		expect(logsDir).toBeDefined();
	});

	it('extracts port correctly from various URL formats', () => {
		expect(extractPortFromUrl('http://localhost:3000', 8080)).toBe(3000);
		expect(extractPortFromUrl('http://127.0.0.1:4000/api', 8080)).toBe(4000);
		expect(extractPortFromUrl('https://example.com', 8080)).toBe(443);
		expect(extractPortFromUrl('http://example.com', 8080)).toBe(80);
		expect(extractPortFromUrl('', 8080)).toBe(8080);
		expect(extractPortFromUrl(null, 3000)).toBe(3000);
	});
});

import { describe, expect, it } from 'vitest';
import { rootDir, srcDir } from '../../../apps/bot/src/lib/constants';
import { existsSync } from 'fs';

describe('Bot Directory Constants', () => {
	it('defines rootDir pointing to valid apps/bot root directory', () => {
		expect(rootDir).toBeDefined();
		expect(existsSync(rootDir)).toBe(true);
	});

	it('defines srcDir pointing to valid apps/bot/src directory', () => {
		expect(srcDir).toBeDefined();
		expect(existsSync(srcDir)).toBe(true);
	});
});

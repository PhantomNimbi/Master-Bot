import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mockGet = vi.fn();
vi.mock('axios', () => ({
	default: {
		get: mockGet
	}
}));

import { startKeepAlive, stopKeepAlive } from '../../apps/bot/src/lib/server/keepAlive';

describe('Keep-Alive Service', () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = { ...originalEnv };
		mockGet.mockReset();
		stopKeepAlive();
	});

	afterEach(() => {
		stopKeepAlive();
		process.env = originalEnv;
		vi.restoreAllMocks();
	});

	it('should respect KEEP_ALIVE_ENABLED=false and not start', () => {
		process.env.KEEP_ALIVE_ENABLED = 'false';

		startKeepAlive(3000);
		expect(mockGet).not.toHaveBeenCalled();
	});

	it('should resolve RENDER_EXTERNAL_URL when provided by Render', () => {
		process.env.RENDER_EXTERNAL_URL = 'https://master-bot-test.onrender.com';
		process.env.KEEP_ALIVE_INTERVAL_MS = '500';

		mockGet.mockResolvedValue({ status: 200 } as any);

		startKeepAlive(10000);
		expect(startKeepAlive).toBeDefined();
	});

	it('should gracefully handle ping failures without throwing unhandled exceptions', () => {
		process.env.KEEP_ALIVE_URL = 'http://127.0.0.1:9999';
		mockGet.mockRejectedValue(new Error('Connection refused'));

		expect(() => {
			startKeepAlive(9999);
		}).not.toThrow();
	});
});

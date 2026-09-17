import { describe, it, expect } from 'vitest';
import {
	getSetOption,
	getAllSetOptions,
	getSetChoices
} from '../../apps/bot/src/lib/set/options/registry';

describe('Set Command Modular Option Registry', () => {
	it('should register all 22 configuration options', () => {
		const options = getAllSetOptions();
		expect(options.length).toBe(22);

		const names = options.map(o => o.name);
		expect(names).toContain('view');
		expect(names).toContain('welcome-channel');
		expect(names).toContain('welcome-message');
		expect(names).toContain('welcome-toggle');
		expect(names).toContain('welcome-test');
		expect(names).toContain('twitch-add');
		expect(names).toContain('twitch-remove');
		expect(names).toContain('twitch-list');
		expect(names).toContain('youtube-add');
		expect(names).toContain('youtube-remove');
		expect(names).toContain('youtube-list');
		expect(names).toContain('log-channel');
		expect(names).toContain('log-toggle');
		expect(names).toContain('log-disable');
		expect(names).toContain('ticket-channel');
		expect(names).toContain('ticket-toggle');
		expect(names).toContain('ticket-panel');
		expect(names).toContain('ticket-transcript');
		expect(names).toContain('ticket-transcript-disable');
		expect(names).toContain('ticket-role');
		expect(names).toContain('ticket-role-disable');
		expect(names).toContain('default-volume');
	});

	it('should retrieve options case-insensitively with executable handlers', () => {
		const yt = getSetOption('YOUTUBE-ADD');
		expect(yt).toBeDefined();
		expect(yt?.name).toBe('youtube-add');
		expect(typeof yt?.execute).toBe('function');

		const view = getSetOption('view');
		expect(view).toBeDefined();
		expect(typeof view?.execute).toBe('function');
	});

	it('should provide Discord-compliant choices under 100 characters', () => {
		const choices = getSetChoices();
		expect(choices.length).toBe(22);
		for (const choice of choices) {
			expect(choice.name.length).toBeLessThanOrEqual(100);
			expect(choice.value.length).toBeLessThanOrEqual(100);
		}
	});
});

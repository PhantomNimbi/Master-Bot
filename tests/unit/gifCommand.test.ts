import { describe, it, expect } from 'vitest';
import {
	getGifTag,
	getAllGifTags,
	getRandomGifTag,
	getGifChoices
} from '../../apps/bot/src/lib/gifs/options/registry';
import type { User } from 'discord.js';

describe('GIF Submodule & Tag Registry', () => {
	it('should register all 11 modular gif tags', () => {
		const tags = getAllGifTags();
		expect(tags).toHaveLength(11);
		const tagNames = tags.map(t => t.name);
		expect(tagNames).toEqual(
			expect.arrayContaining([
				'amongus',
				'anime',
				'baka',
				'cat',
				'doggo',
				'gintama',
				'hug',
				'jojo',
				'pat',
				'slap',
				'waifu'
			])
		);
	});

	it('should lookup specific tags case-insensitively', () => {
		const hug = getGifTag('HUG');
		expect(hug).toBeDefined();
		expect(hug?.name).toBe('hug');
		expect(hug?.targetSupported).toBe(true);

		const cat = getGifTag('cat');
		expect(cat).toBeDefined();
		expect(cat?.searchKeyword).toBe('cat');
	});

	it('should format action text for targeted reactions correctly', () => {
		const hug = getGifTag('hug')!;
		const mockUser = { id: 'user-1', toString: () => '<@user-1>' } as User;
		const mockTarget = { id: 'user-2', toString: () => '<@user-2>' } as User;

		// Targeted at another user
		const otherAction = hug.formatAction!(mockUser, mockTarget);
		expect(otherAction).toContain('<@user-2>');
		expect(otherAction).toContain('warm hug');

		// Self target
		const selfAction = hug.formatAction!(mockUser, mockUser);
		expect(selfAction).toContain('gives themselves a warm hug');
	});

	it('should pick a random tag from the registered collection', () => {
		const random = getRandomGifTag();
		expect(random).toBeDefined();
		expect(random.name).toBeDefined();
		expect(random.searchKeyword).toBeDefined();
	});

	it('should generate slash command choices for all tags', () => {
		const choices = getGifChoices();
		expect(choices).toHaveLength(11);
		expect(choices[0]).toHaveProperty('name');
		expect(choices[0]).toHaveProperty('value');
	});
});

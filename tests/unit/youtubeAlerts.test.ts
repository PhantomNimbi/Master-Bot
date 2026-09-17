import { describe, it, expect, beforeEach } from 'vitest';
import {
	createYouTubeUploadEmbed,
	createYouTubeLiveEmbed
} from '../../apps/bot/src/lib/embeds/commands/other/youtubeEmbed';
import { createYouTubeConfigHandlers } from '../../apps/bot/src/lib/session/handlers/youtubeConfig';
import { SessionStore } from '../../apps/bot/src/lib/session/SessionStore';
import { EmbedColors } from '../../apps/bot/src/lib/embeds/types';

describe('YouTube Alert Embeds & Session Management', () => {
	describe('Embed Creation', () => {
		it('should create an upload notification embed with video metadata', () => {
			const embed = createYouTubeUploadEmbed({
				channelTitle: 'Tech Channel',
				videoTitle: 'Building Scalable Bots',
				videoUrl: 'https://www.youtube.com/watch?v=vid12345',
				videoId: 'vid12345',
				thumbnail: 'https://i.ytimg.com/vi/vid12345/hqdefault.jpg',
				publishedAt: '2026-09-16T12:00:00Z'
			});

			const json = embed.toJSON();
			expect(json.title).toBe('🎬 New Video: Building Scalable Bots');
			expect(json.url).toBe('https://www.youtube.com/watch?v=vid12345');
			expect(json.author?.name).toBe('Tech Channel');
			expect(json.color).toBe(0xff0000); // YouTube brand red
			expect(json.image?.url).toBe(
				'https://img.youtube.com/vi/vid12345/maxresdefault.jpg'
			);
			expect(json.footer?.text).toContain('YouTube Upload Alert');
		});

		it('should create a live stream notification embed with live indicator', () => {
			const embed = createYouTubeLiveEmbed({
				channelTitle: 'Gamer Channel',
				channelUrl: 'https://www.youtube.com/@GamerChannel',
				streamTitle: 'Speedrunning Championship',
				streamUrl: 'https://www.youtube.com/watch?v=live99999',
				videoId: 'live99999',
				thumbnailUrl: 'https://i.ytimg.com/vi/live99999/hqdefault.jpg'
			});

			const json = embed.toJSON();
			expect(json.title).toBe('🔴 LIVE NOW: Speedrunning Championship');
			expect(json.url).toBe('https://www.youtube.com/watch?v=live99999');
			expect(json.author?.name).toBe('Gamer Channel is Live!');
			expect(json.color).toBe(16711731); // 0xFF0033 Live red
			expect(json.fields?.some((f) => f.name === '📺 Channel')).toBe(true);
			expect(json.footer?.text).toContain('YouTube Live Alert');
		});
	});

	describe('YouTube Session Configuration', () => {
		let store: SessionStore;
		let config: ReturnType<typeof createYouTubeConfigHandlers>;

		beforeEach(() => {
			process.env.DB_URI = process.env.DB_URI || 'file:/data/db.sqlite';
			store = new SessionStore();
			config = createYouTubeConfigHandlers(store);
		});

		it('should add a new YouTube subscription with target channel', () => {
			const result = config.addSubscription({
				channelId: 'UC1234567890',
				channelTitle: 'Coding Hub',
				discordChannelId: 'discord-chan-01',
				alertType: 'all'
			});

			expect(result.channelId).toBe('UC1234567890');
			expect(result.channelTitle).toBe('Coding Hub');
			expect(result.channelIds).toHaveLength(1);
			expect(result.channelIds[0]).toEqual({
				channelId: 'discord-chan-01',
				alertType: 'all'
			});

			const sub = config.getSubscription('UC1234567890');
			expect(sub).toBeDefined();
			expect(sub?.channelTitle).toBe('Coding Hub');
		});

		it('should append a target channel to an existing YouTube subscription', () => {
			config.addSubscription({
				channelId: 'UC1234567890',
				channelTitle: 'Coding Hub',
				discordChannelId: 'discord-chan-01',
				alertType: 'streams'
			});

			const updated = config.addSubscription({
				channelId: 'UC1234567890',
				channelTitle: 'Coding Hub',
				discordChannelId: 'discord-chan-02',
				alertType: 'uploads'
			});

			expect(updated.channelIds).toHaveLength(2);
			expect(updated.channelIds).toEqual([
				{ channelId: 'discord-chan-01', alertType: 'streams' },
				{ channelId: 'discord-chan-02', alertType: 'uploads' }
			]);
		});

		it('should remove target channel and cleanup subscription when no targets remain', () => {
			config.addSubscription({
				channelId: 'UC1234567890',
				channelTitle: 'Coding Hub',
				discordChannelId: 'discord-chan-01',
				alertType: 'all'
			});

			const result = config.removeSubscription({
				channelId: 'UC1234567890',
				discordChannelId: 'discord-chan-01'
			});
			expect(result.success).toBe(true);
			expect(result.remainingCount).toBe(0);

			const sub = config.getSubscription('UC1234567890');
			expect(sub).toBeFalsy();
		});

		it('should update live status and video tracking IDs', () => {
			config.addSubscription({
				channelId: 'UC1234567890',
				channelTitle: 'Coding Hub',
				discordChannelId: 'discord-chan-01',
				alertType: 'all'
			});

			config.updateStatus({
				channelId: 'UC1234567890',
				isLive: true,
				lastStreamId: 'stream-xyz',
				lastVideoId: 'video-abc'
			});

			const sub = config.getSubscription('UC1234567890');
			expect(sub?.isLive).toBe(true);
			expect(sub?.lastStreamId).toBe('stream-xyz');
			expect(sub?.lastVideoId).toBe('video-abc');
		});
	});
});

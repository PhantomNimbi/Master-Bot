import { describe, it, expect } from 'vitest';
import { EmbedHandler } from '../../apps/bot/src/lib/embeds/embedHandler';
import { EmbedColors } from '../../apps/bot/src/lib/embeds/types';

describe('EmbedHandler Format & Layout Engine', () => {
	it('should resolve standard and custom colors accurately', () => {
		expect(EmbedHandler.resolveColor('brand')).toBe(EmbedColors.Brand);
		expect(EmbedHandler.resolveColor('success')).toBe(EmbedColors.Success);
		expect(EmbedHandler.resolveColor('error')).toBe(EmbedColors.Error);
		expect(EmbedHandler.resolveColor('warning')).toBe(EmbedColors.Warning);
		expect(EmbedHandler.resolveColor('info')).toBe(EmbedColors.Info);
		expect(EmbedHandler.resolveColor('music')).toBe(EmbedColors.Music);
		expect(EmbedHandler.resolveColor('twitch')).toBe(EmbedColors.Twitch);
		expect(EmbedHandler.resolveColor('dark')).toBe(EmbedColors.Dark);
		expect(EmbedHandler.resolveColor('gold')).toBe(EmbedColors.Gold);
		expect(EmbedHandler.resolveColor(undefined, 0x123456)).toBe(0x123456);
	});

	it('should create a clean standard embed with title, description, and footer', () => {
		const embed = EmbedHandler.create({
			title: 'Master-Bot Status',
			description: 'Operational status report',
			variant: 'brand',
			footer: 'System Monitoring'
		});

		const json = embed.toJSON();
		expect(json.title).toBe('Master-Bot Status');
		expect(json.description).toBe('Operational status report');
		expect(json.color).toBe(EmbedColors.Brand);
		expect(json.footer?.text).toBe('System Monitoring');
		expect(json.timestamp).toBeDefined();
	});

	it('should format semantic embeds with appropriate emoji prefixes and colors', () => {
		const success = EmbedHandler.success({
			title: 'Operation Complete',
			description: 'Changes applied successfully.'
		});
		expect(success.toJSON().title).toBe('✅ Operation Complete');
		expect(success.toJSON().color).toBe(EmbedColors.Success);

		const error = EmbedHandler.error({
			title: 'Access Denied',
			description: 'Missing permissions.'
		});
		expect(error.toJSON().title).toBe('❌ Access Denied');
		expect(error.toJSON().color).toBe(EmbedColors.Error);

		const warning = EmbedHandler.warning({
			title: 'High Latency',
			description: 'WebSocket ping exceeds 250ms.'
		});
		expect(warning.toJSON().title).toBe('⚠️ High Latency');
		expect(warning.toJSON().color).toBe(EmbedColors.Warning);

		const info = EmbedHandler.info({
			title: 'New Update',
			description: 'Master-Bot v1.0 is available.'
		});
		expect(info.toJSON().title).toBe('ℹ️ New Update');
		expect(info.toJSON().color).toBe(EmbedColors.Info);

		const music = EmbedHandler.music({
			title: 'Now Playing',
			description: 'Track details.'
		});
		expect(music.toJSON().title).toBe('🎵 Now Playing');
		expect(music.toJSON().color).toBe(EmbedColors.Music);
	});

	it('should construct structured card embeds with category badges', () => {
		const card = EmbedHandler.card({
			category: 'Audit Log',
			title: 'Member Banned',
			badge: 'SECURITY',
			description: 'Target: User#0001'
		});

		const json = card.toJSON();
		expect(json.title).toBe('[SECURITY] Audit Log • Member Banned');
		expect(json.color).toBe(EmbedColors.Dark);
	});

	it('should format fields cleanly and handle null/empty values with safe fallbacks', () => {
		const f1 = EmbedHandler.field('👑 Guild Owner', 'Nir#0001', true);
		expect(f1).toEqual({
			name: '👑 Guild Owner',
			value: 'Nir#0001',
			inline: true
		});

		const f2 = EmbedHandler.field('📝 Description', null, false);
		expect(f2).toEqual({
			name: '📝 Description',
			value: '*None*',
			inline: false
		});

		const f3 = EmbedHandler.field('🔢 Count', 0, true);
		expect(f3).toEqual({
			name: '🔢 Count',
			value: '0',
			inline: true
		});
	});

	it('should generate inline field grids from key-value records', () => {
		const fields = EmbedHandler.fieldsFromRecord({
			'👥 Members': 1420,
			'📁 Channels': 32,
			'🚀 Boosts': 'Level 3'
		});

		expect(fields).toHaveLength(3);
		expect(fields[0]).toEqual({
			name: '👥 Members',
			value: '1420',
			inline: true
		});
		expect(fields[1]).toEqual({
			name: '📁 Channels',
			value: '32',
			inline: true
		});
	});

	it('should enforce Discord length constraints with safe truncation', () => {
		const longTitle = 'A'.repeat(300);
		const longDesc = 'B'.repeat(5000);
		const embed = EmbedHandler.create({
			title: longTitle,
			description: longDesc
		});

		const json = embed.toJSON();
		expect(json.title?.length).toBe(256);
		expect(json.title?.endsWith('...')).toBe(true);
		expect(json.description?.length).toBe(4096);
		expect(json.description?.endsWith('...')).toBe(true);
	});

	it('should provide Discord markdown and epoch timestamp formatting utilities', () => {
		expect(EmbedHandler.code('pnpm dev')).toBe('`pnpm dev`');
		expect(EmbedHandler.codeBlock('console.log(1);', 'typescript')).toBe(
			'```typescript\nconsole.log(1);\n```'
		);
		expect(EmbedHandler.quote('Important notice')).toBe('> Important notice');
		expect(EmbedHandler.list(['Item 1', 'Item 2'])).toBe('• Item 1\n• Item 2');

		const testDate = new Date(1700000000000);
		expect(EmbedHandler.timestamp(testDate, 'R')).toBe('<t:1700000000:R>');
		expect(EmbedHandler.timestamp(testDate, 'F')).toBe('<t:1700000000:F>');
	});
});

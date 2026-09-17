import { EmbedBuilder, type User } from 'discord.js';
import { EmbedHandler } from '../../embedHandler';

export interface SlowmodeEmbedOptions {
	channelId: string;
	seconds: number;
	moderator: User;
}

export function createSlowmodeEmbed(options: SlowmodeEmbedOptions): EmbedBuilder {
	const modTag = options.moderator.tag ?? options.moderator.username;
	const isDisabled = options.seconds === 0;

	return EmbedHandler.create({
		title: '⏱️ Slowmode Updated',
		variant: isDisabled ? 'success' : 'info',
		fields: [
			EmbedHandler.field('📢 Channel', `<#${options.channelId}>`, true),
			EmbedHandler.field(
				'⏳ Rate Limit',
				isDisabled ? '**Disabled** (0s)' : `**${options.seconds}s** per user`,
				true
			),
			EmbedHandler.field(
				'🛡️ Moderator',
				`${modTag} (<@${options.moderator.id}>)`,
				false
			)
		],
		user: options.moderator,
		timestamp: true
	});
}

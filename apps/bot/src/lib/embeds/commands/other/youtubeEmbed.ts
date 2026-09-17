import { EmbedBuilder, type User } from 'discord.js';
import { EmbedHandler } from '../../embedHandler';

export interface YouTubeUploadEmbedOptions {
	channelTitle: string;
	channelUrl: string;
	channelLogo?: string;
	videoTitle: string;
	videoUrl: string;
	videoId: string;
	description?: string;
	publishedAt?: Date | string | number;
	thumbnailUrl?: string;
	user?: User;
}

export function createYouTubeUploadEmbed(
	options: YouTubeUploadEmbedOptions
): EmbedBuilder {
	const desc = options.description
		? `${options.description.length > 200 ? options.description.slice(0, 197) + '...' : options.description}\n\n`
		: '';

	const embed = EmbedHandler.create({
		title: `🎬 New Video: ${options.videoTitle}`,
		url: options.videoUrl,
		description: `${desc}▶️ **[Watch on YouTube](${options.videoUrl})**`,
		color: 0xff0000,
		author: {
			name: options.channelTitle,
			url: options.channelUrl,
			iconURL: options.channelLogo
		},
		image:
			options.thumbnailUrl ||
			`https://img.youtube.com/vi/${options.videoId}/maxresdefault.jpg`,
		fields: [
			EmbedHandler.field('📺 Channel', `[${options.channelTitle}](${options.channelUrl})`, true),
			EmbedHandler.field(
				'📅 Published',
				options.publishedAt
					? EmbedHandler.timestamp(new Date(options.publishedAt), 'R')
					: 'Just now',
				true
			)
		],
		footer: 'YouTube Upload Alert • Master-Bot',
		timestamp: options.publishedAt ? new Date(options.publishedAt) : true,
		user: options.user
	});

	return embed;
}

export interface YouTubeLiveEmbedOptions {
	channelTitle: string;
	channelUrl: string;
	channelLogo?: string;
	streamTitle: string;
	streamUrl: string;
	videoId: string;
	description?: string;
	startedAt?: Date | string | number;
	thumbnailUrl?: string;
	user?: User;
}

export function createYouTubeLiveEmbed(
	options: YouTubeLiveEmbedOptions
): EmbedBuilder {
	const desc = options.description
		? `${options.description.length > 200 ? options.description.slice(0, 197) + '...' : options.description}\n\n`
		: '';

	const embed = EmbedHandler.create({
		title: `🔴 LIVE NOW: ${options.streamTitle}`,
		url: options.streamUrl,
		description: `${desc}🔴 **[Watch Live Stream](${options.streamUrl})**`,
		color: 0xff0033,
		author: {
			name: `${options.channelTitle} is Live!`,
			url: options.channelUrl,
			iconURL: options.channelLogo
		},
		image:
			options.thumbnailUrl ||
			`https://img.youtube.com/vi/${options.videoId}/maxresdefault.jpg`,
		fields: [
			EmbedHandler.field('📺 Channel', `[${options.channelTitle}](${options.channelUrl})`, true),
			EmbedHandler.field(
				'⏰ Stream Started',
				options.startedAt
					? EmbedHandler.timestamp(new Date(options.startedAt), 'R')
					: 'Now',
				true
			)
		],
		footer: 'YouTube Live Alert • Master-Bot',
		timestamp: options.startedAt ? new Date(options.startedAt) : true,
		user: options.user
	});

	return embed;
}

import type { SapphireClient } from '@sapphire/framework';
import {
	ChannelType,
	ForumChannel,
	type TextChannel
} from 'discord.js';
import { YouTubeAPI } from './youtubeAPI';
import {
	createYouTubeLiveEmbed,
	createYouTubeUploadEmbed
} from '../embeds/commands/other/youtubeEmbed';
import Logger from '../logger';

let isRunning = false;
let intervalTimer: NodeJS.Timeout | null = null;

export async function checkYouTubeChannels(client: SapphireClient): Promise<void> {
	if (isRunning) return;
	isRunning = true;

	try {
		const subscriptions = client.session.youtubeConfig.getAllSubscriptions();
		if (subscriptions.length === 0) {
			isRunning = false;
			return;
		}

		for (const sub of subscriptions) {
			const items = await YouTubeAPI.getLatestItems(sub.channelId);
			if (items.length === 0) continue;

			const newestItem = items[0];
			const liveItem = items.find(it => it.isLive);

			// 1. Check Live Streams
			if (liveItem) {
				if (sub.lastStreamId !== liveItem.id) {
					// New Live Stream!
					const embed = createYouTubeLiveEmbed({
						channelTitle: liveItem.channelTitle,
						channelUrl: `https://www.youtube.com/channel/${sub.channelId}`,
						channelLogo: sub.logo,
						streamTitle: liveItem.title,
						streamUrl: liveItem.url,
						videoId: liveItem.id,
						description: liveItem.description,
						startedAt: liveItem.publishedAt,
						thumbnailUrl: liveItem.thumbnailUrl
					});

					for (const target of sub.channelIds) {
						if (target.alertType === 'uploads') continue; // Only wants uploads

						try {
							const channel =
								client.channels.cache.get(target.channelId) ??
								(await client.channels.fetch(target.channelId).catch(() => null));

							if (!channel) continue;

							if (channel.type === ChannelType.GuildForum) {
								const forum = channel as ForumChannel;
								const threadTitle = `🔴 ${liveItem.channelTitle} is LIVE: ${liveItem.title}`;
								const safeTitle =
									threadTitle.length > 100
										? `${threadTitle.slice(0, 97)}...`
										: threadTitle;

								await forum.threads.create({
									name: safeTitle,
									message: {
										content: `🔴 **${liveItem.channelTitle}** is now live on YouTube!\n${liveItem.url}`,
										embeds: [embed]
									}
								});
							} else if ('send' in channel) {
								await (channel as TextChannel).send({
									content: `🔴 **${liveItem.channelTitle}** is now live on YouTube!\n${liveItem.url}`,
									embeds: [embed]
								});
							}
						} catch (err) {
							Logger.error(
								`[YouTubeNotify] Error sending live alert to channel ${target.channelId}:`,
								err
							);
						}
					}

					client.session.youtubeConfig.updateStatus({
						channelId: sub.channelId,
						lastStreamId: liveItem.id,
						isLive: true
					});
				}
			} else if (sub.isLive) {
				// Stream ended
				client.session.youtubeConfig.updateStatus({
					channelId: sub.channelId,
					isLive: false
				});
			}

			// 2. Check Video Uploads
			if (newestItem && !newestItem.isLive) {
				if (!sub.lastVideoId) {
					// Seed initial lastVideoId without spamming history
					client.session.youtubeConfig.updateStatus({
						channelId: sub.channelId,
						lastVideoId: newestItem.id,
						isLive: sub.isLive
					});
				} else if (sub.lastVideoId !== newestItem.id) {
					// New Upload Detected!
					const embed = createYouTubeUploadEmbed({
						channelTitle: newestItem.channelTitle,
						channelUrl: `https://www.youtube.com/channel/${sub.channelId}`,
						channelLogo: sub.logo,
						videoTitle: newestItem.title,
						videoUrl: newestItem.url,
						videoId: newestItem.id,
						description: newestItem.description,
						publishedAt: newestItem.publishedAt,
						thumbnailUrl: newestItem.thumbnailUrl
					});

					for (const target of sub.channelIds) {
						if (target.alertType === 'streams') continue; // Only wants streams

						try {
							const channel =
								client.channels.cache.get(target.channelId) ??
								(await client.channels.fetch(target.channelId).catch(() => null));

							if (!channel) continue;

							if (channel.type === ChannelType.GuildForum) {
								const forum = channel as ForumChannel;
								const threadTitle = `🎬 ${newestItem.channelTitle}: ${newestItem.title}`;
								const safeTitle =
									threadTitle.length > 100
										? `${threadTitle.slice(0, 97)}...`
										: threadTitle;

								await forum.threads.create({
									name: safeTitle,
									message: {
										content: `🎬 **${newestItem.channelTitle}** uploaded a new video!\n${newestItem.url}`,
										embeds: [embed]
									}
								});
							} else if ('send' in channel) {
								await (channel as TextChannel).send({
									content: `🎬 **${newestItem.channelTitle}** uploaded a new video!\n${newestItem.url}`,
									embeds: [embed]
								});
							}
						} catch (err) {
							Logger.error(
								`[YouTubeNotify] Error sending upload alert to channel ${target.channelId}:`,
								err
							);
						}
					}

					client.session.youtubeConfig.updateStatus({
						channelId: sub.channelId,
						lastVideoId: newestItem.id,
						isLive: sub.isLive
					});
				}
			}
		}
	} catch (err) {
		Logger.error('[YouTubeNotify] Unexpected error in monitor loop:', err);
	} finally {
		isRunning = false;
	}
}

export function startYouTubeMonitor(
	client: SapphireClient,
	intervalMs = 60000
): void {
	if (intervalTimer) {
		clearInterval(intervalTimer);
	}
	// Initial check delayed by 10s after startup
	setTimeout(() => {
		void checkYouTubeChannels(client);
	}, 10000);

	intervalTimer = setInterval(() => {
		void checkYouTubeChannels(client);
	}, intervalMs);

	Logger.info(
		`[YouTubeNotify] YouTube stream & upload alert monitor initialized (${Math.round(intervalMs / 1000)}s interval).`
	);
}

export function stopYouTubeMonitor(): void {
	if (intervalTimer) {
		clearInterval(intervalTimer);
		intervalTimer = null;
	}
}

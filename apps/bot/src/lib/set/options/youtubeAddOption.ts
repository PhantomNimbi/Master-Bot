import { container } from '@sapphire/framework';
import { YouTubeAPI } from '../../youtube/youtubeAPI';
import type { SetOption } from './types';
import type { YouTubeAlertType } from '../../session/types';

export const youtubeAddOption: SetOption = {
	name: 'youtube-add',
	label: 'YouTube Add',
	description: 'Add YouTube channel alert for streams/uploads (text or forum channel)',
	execute: async interaction => {
		const { client } = container;
		const youtubeInput =
			interaction.options.getString('value') ??
			interaction.options.getString('channel') ??
			interaction.options.getString('youtube');
		const targetChannel =
			interaction.options.getChannel('channel') ??
			interaction.options.getChannel('discord-channel');
		const alertType =
			(interaction.options.getString('alerts') ??
			interaction.options.getString('alert-type') ??
			'all') as YouTubeAlertType;

		if (!youtubeInput || !targetChannel) {
			return await interaction.editReply({
				content:
					':x: Please provide both `value` (YouTube channel handle/URL) and `channel` (Discord channel).\n> Example: `/set setting: youtube-add value: @MrBeast channel: #videos alerts: all`'
			});
		}

		const channelInfo = await YouTubeAPI.resolveChannel(youtubeInput);
		if (!channelInfo) {
			return await interaction.editReply({
				content: `:x: Could not locate a YouTube channel for \`${youtubeInput}\`. Please provide a valid channel URL, handle (e.g. \`@MrBeast\`), or Channel ID (\`UC...\`).`
			});
		}

		const latestItems = await YouTubeAPI.getLatestItems(channelInfo.channelId);
		const newestVideo = latestItems.find(it => !it.isLive);
		const liveVideo = latestItems.find(it => it.isLive);

		const sub = client.session.youtubeConfig.addSubscription({
			channelId: channelInfo.channelId,
			channelTitle: channelInfo.title,
			logo: channelInfo.thumbnailUrl,
			discordChannelId: targetChannel.id,
			alertType
		});

		if (newestVideo && !sub.lastVideoId) {
			client.session.youtubeConfig.updateStatus({
				channelId: channelInfo.channelId,
				lastVideoId: newestVideo.id,
				lastStreamId: liveVideo?.id,
				isLive: Boolean(liveVideo)
			});
		}

		const alertTypeDesc =
			alertType === 'all'
				? 'Live Streams & Video Uploads'
				: alertType === 'streams'
					? 'Live Streams Only'
					: 'Video Uploads Only';

		return await interaction.editReply({
			content: `:white_check_mark: Successfully subscribed to **${channelInfo.title}**!\nAlerts will be dispatched to <#${targetChannel.id}> (${alertTypeDesc}).`
		});
	}
};

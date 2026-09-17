import { container } from '@sapphire/framework';
import { YouTubeAPI } from '../../youtube/youtubeAPI';
import type { SetOption } from './types';

export const youtubeRemoveOption: SetOption = {
	name: 'youtube-remove',
	label: 'YouTube Remove',
	description: 'Remove YouTube channel alert from a channel',
	execute: async interaction => {
		const { client } = container;
		const youtubeInput =
			interaction.options.getString('value') ??
			interaction.options.getString('channel') ??
			interaction.options.getString('youtube');
		const targetChannel =
			interaction.options.getChannel('channel') ??
			interaction.options.getChannel('discord-channel');

		if (!youtubeInput || !targetChannel) {
			return await interaction.editReply({
				content:
					':x: Please provide both `value` (YouTube channel handle/URL) and `channel` (Discord channel).\n> Example: `/set setting: youtube-remove value: @MrBeast channel: #videos`'
			});
		}

		let channelId = youtubeInput.trim();
		if (!channelId.startsWith('UC') || channelId.length !== 24) {
			const resolved = await YouTubeAPI.resolveChannel(youtubeInput);
			if (resolved) {
				channelId = resolved.channelId;
			}
		}

		const result = client.session.youtubeConfig.removeSubscription({
			channelId,
			discordChannelId: targetChannel.id
		});

		if (!result.success) {
			return await interaction.editReply({
				content: `:x: No active alert subscription found for YouTube channel \`${youtubeInput}\` in <#${targetChannel.id}>.`
			});
		}

		return await interaction.editReply({
			content: `:white_check_mark: Removed alerts for YouTube channel \`${youtubeInput}\` from <#${targetChannel.id}>.`
		});
	}
};

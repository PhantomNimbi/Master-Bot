import { container } from '@sapphire/framework';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';
import { EmbedBuilder } from 'discord.js';
import { YouTubeAPI } from '../youtube/youtubeAPI';
import type { SetHandler } from './types';
import type { YouTubeAlertType } from '../session/types';

export const handleYouTubeAdd: SetHandler = async interaction => {
	const { client } = container;
	const youtubeInput = interaction.options.getString('youtube', true);
	const targetChannel = interaction.options.getChannel('channel', true);
	const alertType = (interaction.options.getString('alert-type') ?? 'all') as YouTubeAlertType;

	if (!interaction.deferred && !interaction.replied) {
		await interaction.deferReply({ ephemeral: true });
	}

	const channelInfo = await YouTubeAPI.resolveChannel(youtubeInput);
	if (!channelInfo) {
		return await interaction.editReply({
			content: `:x: Could not locate a YouTube channel for \`${youtubeInput}\`. Please provide a valid channel URL, handle (e.g. \`@MrBeast\`), or Channel ID (\`UC...\`).`
		});
	}

	// Fetch latest video immediately to seed lastVideoId and avoid backlog spam
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

	// Seed latest video ID if unset
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
};

export const handleYouTubeRemove: SetHandler = async interaction => {
	const { client } = container;
	const youtubeInput = interaction.options.getString('youtube', true);
	const targetChannel = interaction.options.getChannel('channel', true);

	if (!interaction.deferred && !interaction.replied) {
		await interaction.deferReply({ ephemeral: true });
	}

	// Try resolving channel or check direct channelId
	const channelInfo = await YouTubeAPI.resolveChannel(youtubeInput);
	const channelId = channelInfo ? channelInfo.channelId : youtubeInput.trim();

	const res = client.session.youtubeConfig.removeSubscription({
		channelId,
		discordChannelId: targetChannel.id
	});

	if (!res.success) {
		return await interaction.editReply({
			content: `:x: No YouTube alert subscription found for \`${youtubeInput}\` in <#${targetChannel.id}>.`
		});
	}

	const title = channelInfo?.title ? `**${channelInfo.title}**` : `channel \`${channelId}\``;
	return await interaction.editReply({
		content: `:white_check_mark: Removed alerts for ${title} from <#${targetChannel.id}>.`
	});
};

export const handleYouTubeList: SetHandler = async interaction => {
	const { client } = container;
	const guildId = interaction.guildId!;

	if (!interaction.deferred && !interaction.replied) {
		await interaction.deferReply({ ephemeral: true });
	}

	const allSubs = client.session.youtubeConfig.getAllSubscriptions();
	const guildSubs: Array<{ channelTitle: string; discordChannelName: string; alertType: string }> = [];

	for (const sub of allSubs) {
		for (const target of sub.channelIds) {
			const ch = client.channels.cache.get(target.channelId) as any;
			if (ch && ch.guildId === guildId) {
				guildSubs.push({
					channelTitle: sub.channelTitle,
					discordChannelName: ch.name,
					alertType: target.alertType
				});
			}
		}
	}

	if (guildSubs.length === 0) {
		return await interaction.editReply({
			content: ':information_source: No YouTube channels configured for alerts in this server. Use `/set youtube-add` to add one!'
		});
	}

	const baseEmbed = new EmbedBuilder()
		.setColor('#FF0000')
		.setTitle('🔴 YouTube Alerts Configuration')
		.setAuthor({
			name: `${interaction.guild?.name ?? 'Server'} - YouTube Alerts`,
			iconURL: interaction.guild?.iconURL() || undefined
		})
		.setFooter({ text: `Total Active Subscriptions: ${guildSubs.length}` })
		.setTimestamp();

	new PaginatedFieldMessageEmbed<{ channelTitle: string; discordChannelName: string; alertType: string }>()
		.setTitleField('Subscriptions')
		.setTemplate(baseEmbed)
		.setItems(guildSubs)
		.formatItems(
			item =>
				`• **${item.channelTitle}** ➔ #${item.discordChannelName} (\`${item.alertType}\`)`
		)
		.setItemsPerPage(10)
		.make()
		.run(interaction);

	return;
};

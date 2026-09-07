import { container } from '@sapphire/framework';
import { PaginatedFieldMessageEmbed } from '@sapphire/discord.js-utilities';
import { EmbedBuilder } from 'discord.js';
import { notify } from '../twitch/notifyChannels';
import { MessageChannel } from '../structures/ExtendedClient';
import type { SetHandler } from './types';

export function checkTwitchEnabled(): boolean {
	const enabled = (process.env.TWITCH_ENABLED || '').toLowerCase() !== 'false';
	return (
		enabled &&
		Boolean(process.env.TWITCH_CLIENT_ID) &&
		Boolean(process.env.TWITCH_CLIENT_SECRET)
	);
}

export const handleTwitchAdd: SetHandler = async interaction => {
	if (!checkTwitchEnabled()) {
		return await interaction.editReply({
			content:
				':warning: Twitch features are currently disabled in configuration.'
		});
	}
	const { client } = container;
	const guildId = interaction.guildId!;
	const streamerName = interaction.options.getString('streamer', true);
	const channelData = interaction.options.getChannel('channel', true);

	let user: any;
	try {
		user = await client.twitch.api.getUser({
			login: streamerName,
			token: client.twitch.auth.access_token
		});
	} catch {
		return await interaction.editReply({
			content: `:x: Could not lookup streamer '${streamerName}'. Please check the name.`
		});
	}

	if (!user) {
		return await interaction.editReply({
			content: `:x: Streamer **${streamerName}** was not found on Twitch.`
		});
	}

	const guildDB = await client.session.guildData.getGuild({
		id: guildId
	});
	if (!guildDB.guild) {
		return await interaction.editReply({
			content: ':x: Server data not found.'
		});
	}

	if (guildDB.guild.notifyList.includes(user.id)) {
		return await interaction.editReply({
			content: `:x: **${user.display_name}** is already on your alert list.`
		});
	}

	const existingSendTo =
		client.twitch.notifyList[user.id]?.sendTo || [];
	const updatedSendTo = Array.from(
		new Set([...existingSendTo, channelData.id])
	);

	client.twitch.notifyList[user.id] = {
		sendTo: updatedSendTo,
		live: false,
		logo: user.profile_image_url,
		messageSent: false,
		messageHandler: {}
	};

	await client.session.twitchConfig.create({
		userId: user.id,
		userImage: user.profile_image_url,
		channelId: channelData.id,
		sendTo: updatedSendTo
	});

	const concatedArray = Array.from(
		new Set([...guildDB.guild.notifyList, user.id])
	);
	await client.session.twitchConfig.createViaTwitchNotification({
		name: interaction.guild?.name || '',
		guildId,
		notifyList: concatedArray,
		ownerId: guildDB.guild.ownerId,
		userId: interaction.user.id
	});

	await notify(Object.keys(client.twitch.notifyList));
	return await interaction.editReply({
		content: `:white_check_mark: Stream alerts for **${user.display_name}** will be sent to <#${channelData.id}>.`
	});
};

export const handleTwitchRemove: SetHandler = async interaction => {
	if (!checkTwitchEnabled()) {
		return await interaction.editReply({
			content:
				':warning: Twitch features are currently disabled in configuration.'
		});
	}
	const { client } = container;
	const guildId = interaction.guildId!;
	const streamerName = interaction.options.getString('streamer', true);
	const channelData = interaction.options.getChannel('channel', true);

	let user: any;
	try {
		user = await client.twitch.api.getUser({
			login: streamerName,
			token: client.twitch.auth.access_token
		});
	} catch {
		return await interaction.editReply({
			content: `:x: Error looking up streamer '${streamerName}'.`
		});
	}

	if (!user)
		return await interaction.editReply({
			content: `:x: Streamer **${streamerName}** not found.`
		});

	const guildDB = await client.session.guildData.getGuild({
		id: guildId
	});
	if (!guildDB.guild || !guildDB.guild.notifyList.includes(user.id)) {
		return await interaction.editReply({
			content: `:x: **${user.display_name}** is not in this server's alert list.`
		});
	}

	const filteredTwitchIds = guildDB.guild.notifyList.filter(
		id => id !== user.id
	);
	await client.session.twitchConfig.updateTwitchNotifications({
		guildId,
		notifyList: filteredTwitchIds
	});

	const notifyDB = await client.session.twitchConfig.findUserById({
		id: user.id
	});
	if (notifyDB?.notification) {
		const filteredChannels = notifyDB.notification.channelIds.filter(
			id => id !== channelData.id
		);
		if (filteredChannels.length === 0) {
			await client.session.twitchConfig.delete({
				userId: user.id
			});
			delete client.twitch.notifyList[user.id];
		} else {
			await client.session.twitchConfig.updateNotification({
				userId: user.id,
				channelIds: filteredChannels
			});
			if (client.twitch.notifyList[user.id]) {
				client.twitch.notifyList[user.id].sendTo = filteredChannels;
			}
		}
	}

	return await interaction.editReply({
		content: `:white_check_mark: Removed **${user.display_name}** alerts from <#${channelData.id}>.`
	});
};

export const handleTwitchList: SetHandler = async interaction => {
	if (!checkTwitchEnabled()) {
		return await interaction.editReply({
			content:
				':warning: Twitch features are currently disabled in configuration.'
		});
	}
	const { client } = container;
	const guildId = interaction.guildId!;
	const guildDB = await client.session.guildData.getGuild({
		id: guildId
	});
	if (!guildDB?.guild || guildDB.guild.notifyList.length === 0) {
		return await interaction.editReply({
			content:
				':information_source: No Twitch streamers configured for alerts in this server.'
		});
	}

	const users = await client.twitch.api.getUsers({
		ids: guildDB.guild.notifyList,
		token: client.twitch.auth.access_token
	});

	const myList: object[] = [];
	for (const streamer of users || []) {
		const sendTo = client.twitch.notifyList[streamer.id]?.sendTo || [];
		for (const chId of sendTo) {
			const ch = client.channels.cache.get(chId) as MessageChannel;
			if (ch && ch.guild.id === guildId) {
				myList.push({
					name: streamer.display_name,
					channel: ch.name
				});
			}
		}
	}

	const baseEmbed = new EmbedBuilder().setColor('Purple').setAuthor({
		name: `${interaction.guild?.name} - Twitch Alerts`,
		iconURL: interaction.guild?.iconURL() || undefined
	});

	new PaginatedFieldMessageEmbed()
		.setTitleField('Streamers')
		.setTemplate(baseEmbed)
		.setItems(myList)
		.formatItems(
			(item: any) => `• **${item.name}** ➔ **#${item.channel}**`
		)
		.setItemsPerPage(10)
		.make()
		.run(interaction);
	return;
};
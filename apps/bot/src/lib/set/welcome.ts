import { container } from '@sapphire/framework';
import type { TextChannel } from 'discord.js';
import type { SetHandler } from './types';

export const handleWelcomeChannel: SetHandler = async interaction => {
	const channel = interaction.options.getChannel('channel', true);
	await container.client.session.welcomeMessages.setChannel({
		guildId: interaction.guildId!,
		channelId: channel.id
	});
	return await interaction.editReply({
		content: `:white_check_mark: Welcome messages will now be sent in <#${channel.id}>.`
	});
};

export const handleWelcomeMessage: SetHandler = async interaction => {
	const message = interaction.options.getString('message', true);
	await container.client.session.welcomeMessages.setMessage({
		guildId: interaction.guildId!,
		message
	});
	return await interaction.editReply({
		content: `:white_check_mark: Custom welcome message updated!\n\n**Preview:**\n> ${message}`
	});
};

export const handleWelcomeToggle: SetHandler = async interaction => {
	const enabled = interaction.options.getBoolean('enabled', true);
	await container.client.session.welcomeMessages.toggle({
		guildId: interaction.guildId!,
		status: enabled
	});
	return await interaction.editReply({
		content: `:white_check_mark: Welcome message system is now **${
			enabled ? 'ENABLED' : 'DISABLED'
		}**.`
	});
};

export const handleWelcomeTest: SetHandler = async interaction => {
	const guildId = interaction.guildId!;
	const guildData = await container.client.session.guildData.getGuild({
		id: guildId
	});
	const welcomeChannelId = guildData?.guild?.welcomeMessageChannel;
	const rawMessage =
		guildData?.guild?.welcomeMessage ||
		'👋 Welcome {user} to **{server}**! You are member #{memberCount}.';

	if (!welcomeChannelId) {
		return await interaction.editReply({
			content:
				':x: No welcome channel configured yet. Use `/set welcome-channel` first.'
		});
	}

	const targetChannel = (await interaction.guild?.channels.fetch(
		welcomeChannelId
	)) as TextChannel;
	if (!targetChannel) {
		return await interaction.editReply({
			content: ':x: Configured welcome channel could not be found.'
		});
	}

	const formatted = rawMessage
		.replace(/\{user\}|\{mention\}/g, `<@${interaction.user.id}>`)
		.replace(/\{username\}/g, interaction.user.username)
		.replace(
			/\{server\}|\{guild\}/g,
			interaction.guild?.name || 'this server'
		)
		.replace(
			/\{memberCount\}|\{position\}/g,
			String(interaction.guild?.memberCount || 1)
		);

	await targetChannel.send({ content: formatted });
	return await interaction.editReply({
		content: `:white_check_mark: Sent a test welcome message to <#${welcomeChannelId}>!`
	});
};
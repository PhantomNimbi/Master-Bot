import { container } from '@sapphire/framework';
import type { SetHandler } from './types';

export const handleLogChannel: SetHandler = async interaction => {
	const channel = interaction.options.getChannel('channel', true);
	await container.client.session.guildData.setLogChannel({
		guildId: interaction.guildId!,
		channelId: channel.id
	});
	return await interaction.editReply({
		content: `:white_check_mark: Server audit & moderation logs enabled and routed to <#${channel.id}>.`
	});
};

export const handleLogToggle: SetHandler = async interaction => {
	const enabled = interaction.options.getBoolean('enabled', true);
	await container.client.session.guildData.toggleLogChannel({
		guildId: interaction.guildId!,
		status: enabled
	});
	return await interaction.editReply({
		content: `:white_check_mark: Server audit & moderation logging is now **${
			enabled ? 'ENABLED' : 'DISABLED'
		}**.`
	});
};

export const handleLogDisable: SetHandler = async interaction => {
	await container.client.session.guildData.setLogChannel({
		guildId: interaction.guildId!,
		channelId: null
	});
	return await interaction.editReply({
		content:
			':white_check_mark: Server audit & moderation logging has been **DISABLED**.'
	});
};
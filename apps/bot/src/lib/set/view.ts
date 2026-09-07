import { container } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { checkTwitchEnabled } from './twitch';
import type { SetHandler } from './types';

export const handleView: SetHandler = async interaction => {
	const { client } = container;
	const guildId = interaction.guildId!;
	const guildData = await client.session.guildData.getGuild({
		id: guildId
	});
	const ticketConfig = await client.session.tickets.getConfig({
		guildId
	});
	const g = guildData?.guild;
	const t = ticketConfig?.guild;
	const twitchActive = checkTwitchEnabled();

	const embed = new EmbedBuilder()
		.setTitle(`⚙️ Server Settings - ${interaction.guild?.name}`)
		.setColor('Blue')
		.addFields(
			{
				name: '👋 Welcome System',
				value: g?.welcomeMessageEnabled
					? '🟢 **Enabled**'
					: '🔴 **Disabled**',
				inline: true
			},
			{
				name: '📢 Welcome Channel',
				value: g?.welcomeMessageChannel
					? `<#${g.welcomeMessageChannel}>`
					: '*Not set*',
				inline: true
			},
			{
				name: '📜 Log Channel',
				value:
					g?.logChannelEnabled && g?.logChannel
						? `🟢 <#${g.logChannel}>`
						: g?.logChannel
							? `🔴 <#${g.logChannel}> *(Paused)*`
							: '*Disabled*',
				inline: true
			},
			{
				name: '🎫 Support Tickets',
				value:
					t?.ticketEnabled && t?.ticketChannel
						? `🟢 <#${t.ticketChannel}>`
						: t?.ticketChannel
							? `🔴 <#${t.ticketChannel}> *(Disabled)*`
							: '*Not configured*',
				inline: true
			},
			{
				name: '📑 Transcript Channel',
				value: t?.ticketTranscriptChannel
					? `🟢 <#${t.ticketTranscriptChannel}>`
					: '*Not set*',
				inline: true
			},
			{
				name: '🛡️ Ticket Manager Role',
				value: t?.ticketRoleId ? `<@&${t.ticketRoleId}>` : '*Not set*',
				inline: true
			},
			{
				name: '🔊 Default Music Volume',
				value: `${g?.volume ?? 100}%`,
				inline: true
			},
			{
				name: '🟣 Twitch Alerts',
				value: twitchActive
					? `${g?.notifyList?.length || 0} streamer(s) monitored`
					: '*Disabled in config*',
				inline: true
			},
			{
				name: '📝 Welcome Template',
				value: g?.welcomeMessage
					? `> ${g.welcomeMessage}`
					: '> 👋 Welcome {user} to **{server}**! You are member #{memberCount}. *(Default)*',
				inline: false
			}
		)
		.setFooter({
			text: 'Use /set <subcommand> to configure settings'
		})
		.setTimestamp();

	return await interaction.editReply({ embeds: [embed] });
};
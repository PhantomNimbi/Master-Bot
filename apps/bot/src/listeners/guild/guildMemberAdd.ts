import { ApplyOptions } from '@sapphire/decorators';
import { Listener, type ListenerOptions } from '@sapphire/framework';
import type { GuildMember, TextChannel } from 'discord.js';
import { dataService } from '../../dataService.js';

@ApplyOptions<ListenerOptions>({
	name: 'guildMemberAdd'
})
export class GuildMemberListener extends Listener {
	public override async run(member: GuildMember): Promise<void> {
		const guildQuery = await dataService.guild.getGuild({
			id: member.guild.id
		});

		if (!guildQuery || !guildQuery.guild) return;

		const { welcomeMessage, welcomeMessageEnabled, welcomeMessageChannel } =
			guildQuery.guild;

		if (!welcomeMessageEnabled || !welcomeMessageChannel) {
			return;
		}

		try {
			const channel = (await member.guild.channels.fetch(
				welcomeMessageChannel
			)) as TextChannel;

			if (channel && channel.isTextBased()) {
				const rawMessage =
					welcomeMessage && welcomeMessage.trim().length > 0
						? welcomeMessage
						: '👋 Welcome {user} to **{server}**! You are member #{memberCount}.';

				const formatted = rawMessage
					.replace(/\{user\}|\{mention\}/g, `<@${member.id}>`)
					.replace(/\{username\}/g, member.user.username)
					.replace(/\{server\}|\{guild\}/g, member.guild.name)
					.replace(
						/\{memberCount\}|\{position\}/g,
						String(member.guild.memberCount || 1)
					);

				await channel.send({ content: formatted });
			}
		} catch (error) {
			this.container.logger.error('Failed to send welcome message: ', error);
		}
	}
}

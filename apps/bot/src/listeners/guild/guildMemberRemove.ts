import { ApplyOptions } from '@sapphire/decorators';
import { Listener, type ListenerOptions } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';

@ApplyOptions<ListenerOptions>({
	name: 'guildMemberRemove'
})
export class GuildMemberRemoveListener extends Listener {
	public override async run(member: GuildMember): Promise<void> {
		this.container.client.session.clearUserGuildData(
			member.guild.id,
			member.id
		);
	}
}
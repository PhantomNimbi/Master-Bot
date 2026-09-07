import { ApplyOptions } from '@sapphire/decorators';
import { Listener, type ListenerOptions } from '@sapphire/framework';
import type { Guild } from 'discord.js';

@ApplyOptions<ListenerOptions>({
	name: 'guildDelete'
})
export class GuildDeleteListener extends Listener {
	public override async run(guild: Guild): Promise<void> {
		this.container.client.session.guildData.delete({
			id: guild.id
		});
	}
}


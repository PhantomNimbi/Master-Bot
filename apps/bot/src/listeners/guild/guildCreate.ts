import { ApplyOptions } from '@sapphire/decorators';
import { Listener, type ListenerOptions } from '@sapphire/framework';
import type { Guild } from 'discord.js';

@ApplyOptions<ListenerOptions>({
	name: 'guildCreate'
})
export class GuildCreateListener extends Listener {
	public override async run(guild: Guild): Promise<void> {
		const owner = await guild.fetchOwner();

		this.container.client.session.users.create({
			id: owner.id,
			name: owner.user.username
		});

		this.container.client.session.guildData.create({
			id: guild.id,
			name: guild.name,
			ownerId: owner.id
		});
	}
}



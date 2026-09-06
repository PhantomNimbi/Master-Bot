import { ApplyOptions } from '@sapphire/decorators';
import { Listener, type ListenerOptions } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import { dataService } from '../../dataService.js';

@ApplyOptions<ListenerOptions>({
	name: 'guildCreate'
})
export class GuildCreateListener extends Listener {
	public override async run(guild: Guild): Promise<void> {
		const owner = await guild.fetchOwner();

		await dataService.user.create({
			id: owner.id,
			name: owner.user.username
		});

		await dataService.guild.create({
			id: guild.id,
			name: guild.name,
			ownerId: owner.id
		});
	}
}

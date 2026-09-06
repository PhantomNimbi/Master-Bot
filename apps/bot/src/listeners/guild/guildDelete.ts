import { ApplyOptions } from '@sapphire/decorators';
import { Listener, type ListenerOptions } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import { dataService } from '../../dataService.js';

@ApplyOptions<ListenerOptions>({
	name: 'guildDelete'
})
export class GuildDeleteListener extends Listener {
	public override async run(guild: Guild): Promise<void> {
		await dataService.guild.delete({
			id: guild.id
		});
	}
}

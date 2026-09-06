import { ApplyOptions } from '@sapphire/decorators';
import {
	AsyncPreconditionResult,
	Precondition,
	PreconditionOptions
} from '@sapphire/framework';
import type { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { dataService } from '../dataService.js';
import Logger from '../lib/logger.js';

@ApplyOptions<PreconditionOptions>({
	name: 'userInDB'
})
export class UserInDB extends Precondition {
	public override async chatInputRun(
		interaction: ChatInputCommandInteraction
	): AsyncPreconditionResult {
		const guildMember = interaction.member as GuildMember;

		try {
			const user = await dataService.user.create({
				id: guildMember.id,
				name: guildMember.user.username
			});

			if (!user) throw new Error();
		} catch (error) {
			Logger.error(error);
			return this.error({ message: 'Something went wrong!' });
		}

		return this.ok();
	}
}

declare module '@sapphire/framework' {
	export interface Preconditions {
		userInDB: never;
	}
}

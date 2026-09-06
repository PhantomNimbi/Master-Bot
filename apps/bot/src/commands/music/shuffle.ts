import type { CommandHelp } from '../../lib/structures/CommandHelp.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
	name: 'shuffle',
	description: 'Shuffle the music queue',
	preconditions: [
		'GuildOnly',
		'isCommandDisabled',
		'inVoiceChannel',
		'playerIsPlaying',
		'inPlayerVoiceChannel'
	]
})
export class LeaveCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description
		});
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const { client } = container;

		const queue = client.music.queues.get(interaction.guildId!);

		if (!(await queue.count())) {
			return await interaction.reply(':x: There are no songs in queue!');
		}

		await queue.shuffleTracks();

		return await interaction.reply(':white_check_mark: Shuffled queue!');
	}
}

export const help: CommandHelp = {
	name: 'shuffle',
	category: 'music',
	description: 'Shuffle the music queue',
	usage: '/shuffle',
	examples: ['/shuffle'],
	options: []
};

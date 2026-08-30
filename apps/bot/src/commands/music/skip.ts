import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
	name: 'skip',
	description: 'Skip the current song playing',
	preconditions: [
		'GuildOnly',
		'isCommandDisabled',
		'inVoiceChannel',
		'playerIsPlaying',
		'inPlayerVoiceChannel'
	]
})
export class SkipCommand extends Command {
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
		const { music } = client;
		const queue = music.queues.get(interaction.guildId!);

		const track = await queue.getCurrentTrack();
		await queue.next({ skipped: true });

		if (track) {
			return interaction.reply({
				content: `:white_check_mark: Skipped [**${track.title}**](<${track.uri}>).`,
				flags: ['SuppressEmbeds']
			});
		}

		return interaction.reply({
			content: ':white_check_mark: Skipped the current track.'
		});
	}
}

export const help: CommandHelp = {
	name: 'skip',
	category: 'music',
	description: 'Skip the current song playing',
	usage: '/skip',
	examples: ['/skip'],
	options: []
};

import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
	name: 'skipto',
	description: 'Skip to a track in queue',
	preconditions: [
		'GuildOnly',
		'isCommandDisabled',
		'inVoiceChannel',
		'playerIsPlaying',
		'inPlayerVoiceChannel'
	]
})
export class SkipToCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addIntegerOption(option =>
					option
						.setName('position')
						.setDescription(
							'What is the position of the song you want to skip to in queue?'
						)
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const { client } = container;
		const position = interaction.options.getInteger('position', true);

		const queue = client.music.queues.get(interaction.guildId!);
		const length = await queue.count();
		if (position > length || position < 1) {
			return await interaction.reply(
				`:x: Please enter a valid track position between 1 and ${length}.`
			);
		}

		const targetSong = await queue.getAt(position - 1);
		await queue.skipTo(position);

		if (targetSong) {
			return await interaction.reply({
				content: `:white_check_mark: Skipped to track #${position}: [**${targetSong.title}**](<${targetSong.uri}>)!`,
				flags: ['SuppressEmbeds']
			});
		}

		return await interaction.reply(
			`:white_check_mark: Skipped to track #${position}!`
		);
	}
}

export const help: CommandHelp = {
	name: 'skipto',
	category: 'music',
	description: 'Skip to a track in queue',
	usage: '/skipto <position>',
	examples: ['/skipto position: value'],
	options: [
		{
				"name": "position",
				"description": "What is the position of the song you want to skip to in queue?",
				"required": true
		}
]
};

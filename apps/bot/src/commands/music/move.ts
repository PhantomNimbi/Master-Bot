import type { CommandHelp } from '../../lib/structures/CommandHelp.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
	name: 'move',
	description: 'Move a track to a different position in queue',
	preconditions: [
		'GuildOnly',
		'isCommandDisabled',
		'inVoiceChannel',
		'playerIsPlaying',
		'inPlayerVoiceChannel'
	]
})
export class MoveCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addIntegerOption(option =>
					option
						.setName('current-position')
						.setDescription(
							'What is the position of the song you want to move?'
						)
						.setRequired(true)
				)
				.addIntegerOption(option =>
					option
						.setName('new-position')
						.setDescription(
							'What is the position you want to move the song to?'
						)
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const { client } = container;
		const currentPosition = interaction.options.getInteger(
			'current-position',
			true
		);
		const newPosition = interaction.options.getInteger('new-position', true);

		const queue = client.music.queues.get(interaction.guildId!);
		const length = await queue.count();
		if (
			currentPosition < 1 ||
			currentPosition > length ||
			newPosition < 1 ||
			newPosition > length ||
			currentPosition == newPosition
		) {
			return await interaction.reply(
				':x: Please enter valid position numbers!'
			);
		}

		await queue.moveTracks(currentPosition - 1, newPosition - 1);
		return await interaction.reply(
			`:twisted_right_wards_arrows: Moved track from position **#${currentPosition}** to **#${newPosition}**!`
		);
	}
}

export const help: CommandHelp = {
	name: 'move',
	category: 'music',
	description: 'Move a track to a different position in queue',
	usage: '/move <current-position> <new-position>',
	examples: ['/move current-position: 5 new-position: 1'],
	options: [
		{
			name: 'current-position',
			description: 'What is the position of the song you want to move?',
			required: true
		},
		{
			name: 'new-position',
			description: 'What is the position you want to move the song to?',
			required: true
		}
	]
};

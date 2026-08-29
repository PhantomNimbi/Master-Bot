import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { searchGif } from '../../lib/gifs/searchGif';

@ApplyOptions<Command.Options>({
	name: 'amongus',
	description: 'Replies with a random Among Us gif!',
	preconditions: ['isCommandDisabled']
})
export class AmongUsCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder.setName(this.name).setDescription(this.description)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const gifUrl = await searchGif('amongus');
		if (!gifUrl) {
			return await interaction.reply({
				content: 'Something went wrong or Klipy API key is not configured!'
			});
		}

		return await interaction.reply({ content: gifUrl });
	}
}

export const help: CommandHelp = {
	name: 'amongus',
	category: 'gifs',
	description: 'Replies with a random Among Us gif!',
	usage: '/amongus',
	examples: ['/amongus'],
	options: []
};

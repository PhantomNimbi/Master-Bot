import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { searchGif } from '../../lib/gifs/searchGif';

@ApplyOptions<Command.Options>({
	name: 'gintama',
	description: 'Replies with a random Gintama gif!',
	preconditions: ['isCommandDisabled']
})
export class GintamaCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder.setName(this.name).setDescription(this.description)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const gifUrl = await searchGif('gintama');
		if (!gifUrl) {
			return await interaction.reply({
				content: 'Something went wrong or Klipy API key is not configured!'
			});
		}

		return await interaction.reply({ content: gifUrl });
	}
}

import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { searchGif } from '../../lib/gifs/searchGif';

@ApplyOptions<Command.Options>({
	name: 'amongus',
	description: 'Replies with a random Among Us gif!',
	preconditions: ['isCommandDisabled']
})
export class AmongusCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder => {
			builder.setName(this.name).setDescription(this.description);
			return builder;
		});
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();
		const gifUrl = await searchGif('among us');

		if (!gifUrl) {
			return await interaction.editReply({
				content: ':warning: Could not load a GIF at this time. Please try again!'
			});
		}

		const embed = new EmbedBuilder()
			.setColor(0x5865f2)
			.setImage(gifUrl)
			.setFooter({
				text: `Requested by ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL()
			});

		return await interaction.editReply({ embeds: [embed] });
	}
}

export const help: CommandHelp = {
	name: 'amongus',
	category: 'gifs',
	description: 'Replies with a random Among Us gif!',
	usage: '/amongus',
	examples: ["/amongus"],
	options: []
};

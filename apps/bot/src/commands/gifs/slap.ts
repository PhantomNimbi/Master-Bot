import type { CommandHelp } from '../../lib/structures/CommandHelp.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { searchGif } from '../../lib/gifs/searchGif.js';

@ApplyOptions<Command.Options>({
	name: 'slap',
	description: 'Slap someone with a dramatic gif!',
	preconditions: ['isCommandDisabled']
})
export class SlapCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder => {
			builder.setName(this.name).setDescription(this.description);
			builder.addUserOption(option =>
				option
					.setName('target')
					.setDescription('The member you want to slap (optional)')
					.setRequired(false)
			);
			return builder;
		});
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();
		const target = interaction.options.getUser('target');
		const gifUrl = await searchGif('slap');

		if (!gifUrl) {
			return await interaction.editReply({
				content:
					':warning: Could not load a GIF at this time. Please try again!'
			});
		}

		const action =
			target && target.id !== interaction.user.id
				? 'slaps {target}! 💥'.replace('{target}', `${target}`)
				: 'Slap someone with a dramatic gif!';

		const embed = new EmbedBuilder()
			.setColor(0x5865f2)
			.setDescription(`✨ ${interaction.user} ${action}`)
			.setImage(gifUrl);

		return await interaction.editReply({ embeds: [embed] });
	}
}

export const help: CommandHelp = {
	name: 'slap',
	category: 'gifs',
	description: 'Slap someone with a dramatic gif!',
	usage: '/slap [target: @User]',
	examples: ['/slap', '/slap target: @Someone'],
	options: [
		{
			name: 'target',
			description: 'Target member to slap',
			required: false
		}
	]
};

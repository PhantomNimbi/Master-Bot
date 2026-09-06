import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { searchGif } from '../../lib/gifs/searchGif';

@ApplyOptions<Command.Options>({
	name: 'hug',
	description: 'Give someone or yourself a warm hug!',
	preconditions: ['isCommandDisabled']
})
export class HugCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder => {
			builder.setName(this.name).setDescription(this.description);
			builder.addUserOption(option =>
				option
					.setName('target')
					.setDescription('The member you want to hug (optional)')
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
		const gifUrl = await searchGif('hug');

		if (!gifUrl) {
			return await interaction.editReply({
				content:
					':warning: Could not load a GIF at this time. Please try again!'
			});
		}

		const action =
			target && target.id !== interaction.user.id
				? 'gives {target} a big warm hug! 🤗'.replace('{target}', `${target}`)
				: 'Give someone or yourself a warm hug!';

		const embed = new EmbedBuilder()
			.setColor(0x5865f2)
			.setDescription(`✨ ${interaction.user} ${action}`)
			.setImage(gifUrl);

		return await interaction.editReply({ embeds: [embed] });
	}
}

export const help: CommandHelp = {
	name: 'hug',
	category: 'gifs',
	description: 'Give someone or yourself a warm hug!',
	usage: '/hug [target: @User]',
	examples: ['/hug', '/hug target: @Someone'],
	options: [
		{
			name: 'target',
			description: 'Target member to hug',
			required: false
		}
	]
};

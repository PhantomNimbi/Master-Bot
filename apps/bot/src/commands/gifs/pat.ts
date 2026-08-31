import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { searchGif } from '../../lib/gifs/searchGif';

@ApplyOptions<Command.Options>({
	name: 'pat',
	description: 'Give someone or yourself a gentle head pat!',
	preconditions: ['isCommandDisabled']
})
export class PatCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder => {
			builder.setName(this.name).setDescription(this.description);
			builder.addUserOption(option =>
				option
					.setName('target')
					.setDescription('The member you want to pat (optional)')
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
		const gifUrl = await searchGif('pat');

		if (!gifUrl) {
			return await interaction.editReply({
				content: ':warning: Could not load a GIF at this time. Please try again!'
			});
		}

		const action =
			target && target.id !== interaction.user.id
				? 'pats {target} on the head! 🥰'.replace('{target}', `${target}`)
				: 'gives themselves a gentle head pat! 😊';

		const embed = new EmbedBuilder()
			.setColor(0x5865f2)
			.setDescription(`✨ ${interaction.user} ${action}`)
			.setImage(gifUrl);

		return await interaction.editReply({ embeds: [embed] });
	}
}

export const help: CommandHelp = {
	name: 'pat',
	category: 'gifs',
	description: 'Give someone or yourself a gentle head pat!',
	usage: '/pat [target: @User]',
	examples: ['/pat', '/pat target: @Someone'],
	options: [
		{
			name: 'target',
			description: 'Target member to pat',
			required: false
		}
	]
};

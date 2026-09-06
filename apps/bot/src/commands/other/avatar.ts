import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<Command.Options>({
	name: 'avatar',
	description: "Responds with a user's avatar",
	preconditions: ['isCommandDisabled', 'GuildOnly']
})
export class AvatarCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption(option =>
					option
						.setName('user')
						.setDescription('The user to get the avatar of')
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const user = interaction.options.getUser('user', true);
		const embed = new EmbedBuilder()
			.setTitle(user.username)
			.setImage(user.displayAvatarURL({ size: 4096 }))
			.setColor('Aqua');

		return interaction.reply({ embeds: [embed] });
	}
}

export const help: CommandHelp = {
	name: 'avatar',
	category: 'other',
	description: 'Responds with a user',
	usage: '/avatar <user>',
	examples: ['/avatar user: value'],
	options: [
		{
			name: 'user',
			description: 'The user to get the avatar of',
			required: true
		}
	]
};

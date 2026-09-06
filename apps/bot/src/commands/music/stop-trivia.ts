import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
	name: 'stop-trivia',
	description: 'Stop the active Music Trivia game in this server',
	preconditions: ['GuildOnly', 'isCommandDisabled', 'inVoiceChannel']
})
export class StopTriviaCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder.setName(this.name).setDescription(this.description)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const { client } = this.container;
		const guildId = interaction.guildId!;

		const session = client.triviaSessions?.get(guildId);
		if (!session || session.isEnded) {
			return await interaction.reply({
				content:
					':x: There is no active Music Trivia session running in this server.',
				ephemeral: true
			});
		}

		await session.stop(`Ended by ${interaction.user.username}`);
		return await interaction.reply({
			content: ':octagonal_sign: Stopped the active Music Trivia game.'
		});
	}
}

export const help: CommandHelp = {
	name: 'stop-trivia',
	category: 'music',
	description: 'Stop the active Music Trivia game in this server',
	usage: '/stop-trivia',
	examples: ['/stop-trivia'],
	options: []
};

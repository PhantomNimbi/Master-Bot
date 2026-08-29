import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
	name: 'nightcore',
	description: 'Enable/Disable Nightcore filter',
	preconditions: [
		'GuildOnly',
		'isCommandDisabled',
		'inVoiceChannel',
		'playerIsPlaying',
		'inPlayerVoiceChannel'
	]
})
export class NightcoreCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand({
			name: this.name,
			description: this.description
		});
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const { client } = container;

		const player = client.music.getPlayer(interaction.guild!.id);
		if (!player) return interaction.reply({ content: 'No active player.', ephemeral: true });

		const enabled = await player.filterManager.toggleNightcore();
		(player as any).nightcore = enabled;

		return await interaction.reply(
			`Nightcore ${enabled ? 'enabled' : 'disabled'}`
		);
	}
}

export const help: CommandHelp = {
	name: 'nightcore',
	category: 'music',
	description: 'Enable/Disable Nightcore filter',
	usage: '/nightcore',
	examples: ['/nightcore'],
	options: []
};

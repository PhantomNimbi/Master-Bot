import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
	name: 'vaporwave',
	description: 'Apply vaporwave on the playing track!',
	preconditions: [
		'GuildOnly',
		'isCommandDisabled',
		'inVoiceChannel',
		'playerIsPlaying',
		'inPlayerVoiceChannel'
	]
})
export class VaporWaveCommand extends Command {
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

		const enabled = await player.filterManager.toggleVaporwave();
		(player as any).vaporwave = enabled;

		return await interaction.reply(
			`Vaporwave ${enabled ? 'enabled' : 'disabled'}`
		);
	}
}

import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
	name: 'karaoke',
	description: 'Turn the playing track to karaoke',
	preconditions: [
		'GuildOnly',
		'isCommandDisabled',
		'inVoiceChannel',
		'playerIsPlaying',
		'inPlayerVoiceChannel'
	]
})
export class KaraokeCommand extends Command {
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

		const enabled = await player.filterManager.toggleKaraoke();
		(player as any).karaoke = enabled;

		return await interaction.reply(
			`Karaoke ${enabled ? 'enabled' : 'disabled'}`
		);
	}
}

export const help: CommandHelp = {
	name: 'karaoke',
	category: 'music',
	description: 'Turn the playing track to karaoke',
	usage: '/karaoke',
	examples: ['/karaoke'],
	options: []
};

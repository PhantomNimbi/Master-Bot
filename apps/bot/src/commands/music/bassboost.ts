import type { CommandHelp } from '../../lib/structures/CommandHelp.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { container } from '@sapphire/framework';

@ApplyOptions<CommandOptions>({
	name: 'bassboost',
	description: 'Boost the bass of the playing track',
	preconditions: [
		'GuildOnly',
		'isCommandDisabled',
		'inVoiceChannel',
		'playerIsPlaying',
		'inPlayerVoiceChannel'
	]
})
export class BassboostCommand extends Command {
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
		if (!player)
			return interaction.reply({
				content: 'No active player.',
				ephemeral: true
			});

		const enabled = !(player as any).bassboost;
		(player as any).bassboost = enabled;

		if (enabled) {
			await player.filterManager.setEQ([
				{ band: 0, gain: 0.55 },
				{ band: 1, gain: 0.45 },
				{ band: 2, gain: 0.4 },
				{ band: 3, gain: 0.3 },
				{ band: 4, gain: 0.15 },
				{ band: 5, gain: 0 },
				{ band: 6, gain: 0 }
			]);
		} else {
			await player.filterManager.clearEQ();
		}

		return await interaction.reply(
			`Bassboost ${enabled ? 'enabled' : 'disabled'}`
		);
	}
}

export const help: CommandHelp = {
	name: 'bassboost',
	category: 'music',
	description: 'Boost the bass of the playing track',
	usage: '/bassboost',
	examples: ['/bassboost'],
	options: []
};

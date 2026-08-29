import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';

@ApplyOptions<Command.Options>({
	name: 'waifu',
	description: 'Replies with a random waifu image!',
	preconditions: ['isCommandDisabled']
})
export class WaifuCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder.setName(this.name).setDescription(this.description)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const isNsfwChannel =
			interaction.channel &&
			'nsfw' in interaction.channel &&
			Boolean((interaction.channel as any).nsfw);

		const apiUrl = `https://api.waifu.im/search?is_nsfw=${isNsfwChannel ? 'true' : 'false'}`;

		try {
			const response = await fetch(apiUrl);
			const json = (await response.json()) as any;
			const imageUrl = json?.images?.[0]?.url;

			if (!imageUrl) {
				return await interaction.reply({
					content: 'Something went wrong! Please try again later.'
				});
			}

			return await interaction.reply({ content: imageUrl });
		} catch {
			return await interaction.reply({
				content: 'Something went wrong! Please try again later.'
			});
		}
	}
}

export const help: CommandHelp = {
	name: 'waifu',
	category: 'gifs',
	description: 'Replies with a random waifu image!',
	usage: '/waifu',
	examples: ['/waifu'],
	options: []
};

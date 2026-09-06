import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { trpcNode } from '../../trpc';

@ApplyOptions<CommandOptions>({
	name: 'create-playlist',
	description: 'Create a custom playlist that you can play anytime',
	preconditions: [
		'GuildOnly',
		'isCommandDisabled',
		'userInDB',
		'playlistNotDuplicate'
	]
})
export class CreatePlaylistCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName('playlist-name')
						.setDescription(
							'What is the name of the playlist you want to create?'
						)
						.setRequired(true)
				)
		);
	}
	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();
		const playlistName = interaction.options.getString('playlist-name', true);

		const interactionMember = interaction.member?.user;

		if (!interactionMember) {
			return await interaction.editReply({
				content: ':x: Something went wrong! Please try again later'
			});
		}

		try {
			const playlist = await trpcNode.playlist.create.mutate({
				name: playlistName,
				userId: interactionMember.id
			});

			if (!playlist) throw new Error();
		} catch (error) {
			return await interaction.editReply({
				content: `:x: You already have a playlist named **${playlistName}**`
			});
		}

		return await interaction.editReply(
			`Created a playlist named **${playlistName}**`
		);
	}
}

export const help: CommandHelp = {
	name: 'create-playlist',
	category: 'music',
	description: 'Create a custom playlist that you can play anytime',
	usage: '/create-playlist <playlist-name>',
	examples: ['/create-playlist playlist-name: My Favorites'],
	options: [
		{
			name: 'playlist-name',
			description: 'What is the name of the playlist you want to create?',
			required: true
		}
	]
};

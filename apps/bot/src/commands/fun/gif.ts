import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedHandler } from '../../lib/embeds/embedHandler';
import { createReactionGifEmbed } from '../../lib/embeds/commands/gifs/reactionGifEmbed';
import { searchGif } from '../../lib/gifs/searchGif';
import {
	getGifTag,
	getAllGifTags,
	getRandomGifTag
} from '../../lib/gifs/options/registry';

@ApplyOptions<Command.Options>({
	name: 'gif',
	description: 'Display a reaction GIF, search GIFs, or get a random GIF',
	preconditions: ['isCommandDisabled']
})
export class GifCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder => {
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option => {
					option
						.setName('tag')
						.setDescription('Select a GIF category or reaction tag (optional)')
						.setRequired(false);

					for (const tag of getAllGifTags()) {
						option.addChoices({
							name: `${tag.label} - ${tag.description}`,
							value: tag.name
						});
					}
					return option;
				})
				.addStringOption(option =>
					option
						.setName('query')
						.setDescription('Free-form search keyword for any GIF (optional)')
						.setRequired(false)
				)
				.addUserOption(option =>
					option
						.setName('target')
						.setDescription('User to direct the reaction at (for reaction tags)')
						.setRequired(false)
				);
			return builder;
		});
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();

		const tagOption = interaction.options.getString('tag');
		const queryOption = interaction.options.getString('query');
		const targetUser = interaction.options.getUser('target');

		// Case 1: If neither tag nor query option is passed, display a random gif
		if (!tagOption && !queryOption) {
			const randomTag = getRandomGifTag();
			const gifUrl = await searchGif(randomTag.searchKeyword);

			if (!gifUrl) {
				return await interaction.editReply({
					content:
						':warning: Could not load a random GIF at this time. Please try again!'
				});
			}

			const embed = EmbedHandler.media({
				title: `🎲 Random GIF (${randomTag.label})`,
				description: randomTag.description,
				image: gifUrl,
				user: interaction.user
			});

			return await interaction.editReply({ embeds: [embed] });
		}

		// Case 2: Tag is selected
		if (tagOption) {
			const tag = getGifTag(tagOption);
			const searchKeyword = tag ? tag.searchKeyword : tagOption;
			const gifUrl = await searchGif(searchKeyword);

			if (!gifUrl) {
				return await interaction.editReply({
					content: `:warning: Could not load a GIF for tag "**${tagOption}**". Please try again!`
				});
			}

			if (tag && tag.targetSupported) {
				const action = tag.formatAction
					? tag.formatAction(interaction.user, targetUser)
					: `reacts with ${tag.label}!`;

				const embed = createReactionGifEmbed({
					actionDescription: `✨ ${interaction.user} ${action}`,
					gifUrl,
					user: interaction.user
				});

				return await interaction.editReply({ embeds: [embed] });
			}

			const embed = EmbedHandler.media({
				title: tag ? `${tag.label} GIF` : `🎬 GIF: ${tagOption}`,
				description: tag?.description,
				image: gifUrl,
				user: interaction.user
			});

			return await interaction.editReply({ embeds: [embed] });
		}

		// Case 3: Free-form query search
		const searchKeyword = queryOption!;
		const gifUrl = await searchGif(searchKeyword);

		if (!gifUrl) {
			return await interaction.editReply({
				content: `:warning: No GIFs found for "**${searchKeyword}**".`
			});
		}

		const embed = EmbedHandler.media({
			title: `🎬 GIF: ${searchKeyword}`,
			description: `Search results for "${searchKeyword}"`,
			image: gifUrl,
			user: interaction.user
		});

		return await interaction.editReply({ embeds: [embed] });
	}
}

export const help: CommandHelp = {
	name: 'gif',
	category: 'fun',
	description: 'Display a reaction GIF, search GIFs, or get a random GIF',
	usage: '/gif [tag: Tag] [query: Keyword] [target: @User]',
	examples: [
		'/gif',
		'/gif tag: hug target: @Someone',
		'/gif tag: cat',
		'/gif query: celebratory dance'
	],
	options: [
		{
			name: 'tag',
			description:
				'Preset tag (amongus, anime, baka, cat, doggo, gintama, hug, jojo, pat, slap, waifu)',
			required: false
		},
		{
			name: 'query',
			description: 'Search keyword for any GIF',
			required: false
		},
		{
			name: 'target',
			description: 'Target member for reaction tags',
			required: false
		}
	]
};

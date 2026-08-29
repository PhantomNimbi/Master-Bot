import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import {
	ColorResolvable,
	StringSelectMenuBuilder,
	ComponentType
} from 'discord.js';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import axios from 'axios';
import Logger from '../../lib/logger';

@ApplyOptions<CommandOptions>({
	name: 'reddit',
	description: 'Get posts from reddit by specifying a subreddit',
	preconditions: ['GuildOnly', 'isCommandDisabled']
})
export class RedditCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName('subreddit')
						.setDescription('Subreddit name')
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName('sort')
						.setDescription(
							'What posts do you want to see? Select from best/hot/top/new/controversial/rising'
						)
						.setRequired(true)
						.addChoices(
							{
								name: 'Best',
								value: 'best'
							},
							{
								name: 'Hot',
								value: 'hot'
							},
							{
								name: 'New',
								value: 'new'
							},
							{
								name: 'Top',
								value: 'top'
							},
							{
								name: 'Controversial',
								value: 'controversial'
							},
							{
								name: 'Rising',
								value: 'rising'
							}
						)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();
		const channel = interaction.channel;
		if (!channel) {
			return await interaction.followUp('Something went wrong :(');
		}
		const subreddit = interaction.options.getString('subreddit', true);
		const sort = interaction.options.getString('sort', true);

		if (['controversial', 'top'].some(val => val === sort)) {
			const row = new StringSelectMenuBuilder()
				.setCustomId('top_or_controversial')
				.setPlaceholder('Please select an option')
				.addOptions(optionsArray);

			const menu = await interaction.editReply({
				content: `:loud_sound: Do you want to get the ${sort} posts from past hour/week/month/year or all?`,
				components: [
					{
						type: ComponentType.ActionRow,
						components: [row]
					}
				]
			});

			const collector = menu.createMessageComponentCollector({
				componentType: ComponentType.StringSelect,
				time: 30000
			});

			collector.on('end', () => {
				if (menu) menu.delete().catch(() => {});
			});

			collector.on('collect', async i => {
				if (i.user.id !== interaction.user.id) {
					i.reply({
						content: 'This element is not for you!',
						ephemeral: true
					});
					return;
				} else {
					collector.stop();
					const timeFilter = i.values[0];
					this.fetchFromReddit(interaction, subreddit, sort, timeFilter);
					return;
				}
			});
		} else {
			this.fetchFromReddit(interaction, subreddit, sort);
			return;
		}
	}

	private async fetchFromReddit(
		interaction: Command.ChatInputCommandInteraction,
		subreddit: string,
		sort: string,
		timeFilter = 'day'
	) {
		try {
			var data = await this.getData(subreddit, sort, timeFilter);
		} catch (error: any) {
			return interaction.followUp(error);
		}

		const isNsfwChannel =
			interaction.channel &&
			'nsfw' in interaction.channel &&
			Boolean((interaction.channel as any).nsfw);

		const paginatedEmbed = new PaginatedMessage();
		let addedPages = 0;

		for (let i = 0; i < data.children.length; i++) {
			let color: ColorResolvable = 'Orange';
			let redditPost = data.children[i];

			if (redditPost.data.over_18 && !isNsfwChannel) {
				continue; // Skip NSFW posts in SFW channels
			}

			if (redditPost.data.title.length > 255) {
				redditPost.data.title = redditPost.data.title.substring(0, 252) + '...';
			}

			if (redditPost.data.selftext.length > 1024) {
				redditPost.data.selftext =
					redditPost.data.selftext.substring(0, 1024) +
					`[Read More...](https://www.reddit.com${redditPost.data.permalink})`;
			}

			if (redditPost.data.over_18) color = 'Red';

			paginatedEmbed.addPageEmbed(embed =>
				embed
					.setColor(color)
					.setTitle(redditPost.data.title)
					.setURL(`https://www.reddit.com${redditPost.data.permalink}`)
					.setDescription(
						`${
							redditPost.data.over_18 ? '' : redditPost.data.selftext + '\n\n'
						}Upvotes: ${redditPost.data.score} :thumbsup:`
					)
					.setAuthor({ name: redditPost.data.author })
			);
			addedPages++;
		}

		if (addedPages === 0) {
			return interaction.followUp({
				content: 'No SFW posts found for this subreddit in an age-restricted channel filter.'
			});
		}

		return paginatedEmbed.run(interaction);
	}

	private getData(
		subreddit: string,
		sort: string,
		timeFilter: string
	): Promise<any> {
		return new Promise(async function (resolve, reject) {
			const response = await axios.get(
				`https://www.reddit.com/r/${subreddit}/${sort}/.json?limit=10&t=${
					timeFilter ? timeFilter : 'day'
				}`
			);
			const data = response.data.data;
			if (!data) {
				reject(`**${subreddit}** is a private subreddit!`);
			} else if (!data.children.length) {
				reject('Please provide a valid subreddit name!');
			}
			resolve(data);
		});
	}
}

const optionsArray = [
	{
		label: 'hour',
		value: 'hour'
	},
	{
		label: 'week',
		value: 'week'
	},
	{
		label: 'month',
		value: 'month'
	},
	{
		label: 'year',
		value: 'year'
	},
	{
		label: 'all',
		value: 'all'
	}
];

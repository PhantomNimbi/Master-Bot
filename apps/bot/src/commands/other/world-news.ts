import type { CommandHelp } from '../../lib/structures/CommandHelp.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { getApiServiceKeys } from '../../env.js';
import Logger from '../../lib/logger.js';

interface NewsArticle {
	source: { id: string | null; name: string };
	author: string | null;
	title: string;
	description: string | null;
	url: string;
	urlToImage: string | null;
	publishedAt: string;
}

@ApplyOptions<CommandOptions>({
	name: 'world-news',
	description: 'Fetch the latest global headlines and breaking news',
	preconditions: ['isCommandDisabled']
})
export class WorldNewsCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName('category')
						.setDescription('Topic category to fetch headlines for')
						.setRequired(false)
						.addChoices(
							{ name: 'General / Breaking', value: 'general' },
							{ name: 'Technology', value: 'technology' },
							{ name: 'Business & Finance', value: 'business' },
							{ name: 'Science & Space', value: 'science' },
							{ name: 'Health & Medicine', value: 'health' },
							{ name: 'Entertainment', value: 'entertainment' },
							{ name: 'Sports', value: 'sports' }
						)
				)
				.addStringOption(option =>
					option
						.setName('query')
						.setDescription(
							'Search for specific keywords (e.g. AI, NASA, economy)'
						)
						.setRequired(false)
				)
				.addStringOption(option =>
					option
						.setName('country')
						.setDescription(
							'Country edition for top headlines (defaults to Global/US)'
						)
						.setRequired(false)
						.addChoices(
							{ name: 'United States (US)', value: 'us' },
							{ name: 'United Kingdom (UK)', value: 'gb' },
							{ name: 'Canada (CA)', value: 'ca' },
							{ name: 'Australia (AU)', value: 'au' },
							{ name: 'Germany (DE)', value: 'de' },
							{ name: 'France (FR)', value: 'fr' },
							{ name: 'India (IN)', value: 'in' },
							{ name: 'Japan (JP)', value: 'jp' }
						)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const apiKey = getApiServiceKeys().newsApi;
		if (!apiKey) {
			return interaction.reply({
				content:
					':warning: NewsAPI key is not configured on this bot instance.',
				ephemeral: true
			});
		}

		await interaction.deferReply();

		const category = interaction.options.getString('category');
		const query = interaction.options.getString('query');
		const country =
			interaction.options.getString('country') ||
			(category || !query ? 'us' : undefined);

		let apiUrl: string;
		if (query && !category) {
			apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=relevancy&pageSize=5&apiKey=${apiKey}`;
		} else {
			const params = new URLSearchParams();
			if (country) params.set('country', country);
			if (category) params.set('category', category);
			if (query) params.set('q', query);
			params.set('pageSize', '5');
			params.set('apiKey', apiKey);
			apiUrl = `https://newsapi.org/v2/top-headlines?${params.toString()}`;
		}

		try {
			const response = await fetch(apiUrl);
			if (!response.ok) {
				const errorText = await response.text().catch(() => '');
				Logger.error(
					`NewsAPI request failed [HTTP ${response.status}]: ${errorText}`
				);
				return interaction.editReply({
					content:
						':x: Could not retrieve news articles at this time. Please try again later.'
				});
			}

			const data = (await response.json()) as {
				status: string;
				totalResults: number;
				articles: NewsArticle[];
			};

			const articles =
				data.articles?.filter(a => a.title && a.title !== '[Removed]') || [];
			if (articles.length === 0) {
				return interaction.editReply({
					content: `🔍 No news articles found matching your query${query ? ` for "**${query}**"` : ''}.`
				});
			}

			const categoryLabel = category
				? category.charAt(0).toUpperCase() + category.slice(1)
				: query
					? `Search: "${query}"`
					: 'Top World News';

			const embed = new EmbedBuilder()
				.setTitle(`📰 ${categoryLabel}`)
				.setColor(0x5865f2)
				.setDescription(
					articles
						.map((article, idx) => {
							const date = new Date(article.publishedAt);
							const unix = !isNaN(date.getTime())
								? Math.floor(date.getTime() / 1000)
								: null;
							const timeStr = unix ? ` • <t:${unix}:R>` : '';
							const sourceStr = article.source?.name
								? `*${article.source.name}*`
								: '';
							const desc = article.description
								? `\n> ${article.description.length > 140 ? article.description.slice(0, 137) + '...' : article.description}`
								: '';

							return `**${idx + 1}. [${article.title}](<${article.url}>)**\n— ${sourceStr}${timeStr}${desc}`;
						})
						.join('\n\n')
				)
				.setFooter({
					text: `Powered by NewsAPI.org • Requested by ${interaction.user.username}`,
					iconURL: interaction.user.displayAvatarURL()
				})
				.setTimestamp();

			const topImage = articles.find(
				a => a.urlToImage && a.urlToImage.startsWith('http')
			)?.urlToImage;
			if (topImage) {
				embed.setThumbnail(topImage);
			}

			return interaction.editReply({ embeds: [embed] });
		} catch (err) {
			Logger.error('World News command error: ', err);
			return interaction.editReply({
				content:
					':x: An unexpected error occurred while querying the news service.'
			});
		}
	}
}

export const help: CommandHelp = {
	name: 'world-news',
	category: 'other',
	description: 'Fetch the latest global headlines and breaking news',
	usage: '/world-news [category: Topic] [query: Keyword] [country: Country]',
	examples: [
		'/world-news',
		'/world-news category: Technology',
		'/world-news query: artificial intelligence',
		'/world-news category: Science country: United States (US)'
	],
	options: [
		{
			name: 'category',
			description:
				'News topic category (General, Technology, Business, Science, Health, Sports, Entertainment)',
			required: false
		},
		{
			name: 'query',
			description: 'Search for specific keywords or topics',
			required: false
		},
		{
			name: 'country',
			description:
				'Country edition for top headlines (US, GB, CA, AU, DE, FR, IN, JP)',
			required: false
		}
	]
};

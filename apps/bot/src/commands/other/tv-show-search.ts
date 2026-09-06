import type { CommandHelp } from '../../lib/structures/CommandHelp.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import axios from 'axios';
import Logger from '../../lib/logger.js';

@ApplyOptions<CommandOptions>({
	name: 'tv-show-search',
	description: 'Get TV shows information',
	preconditions: ['GuildOnly', 'isCommandDisabled']
})
export class TVShowSearchCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName('query')
						.setDescription('What TV show do you want to look up?')
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();
		const query = interaction.options.getString('query', true);

		try {
			var data = await this.getData(query);
		} catch (error: any) {
			return interaction.editReply({ content: error });
		}

		const PaginatedEmbed = new PaginatedMessage();

		for (let i = 0; i < data.length; i++) {
			const showInfo = this.constructInfoObject(data[i].show);

			PaginatedEmbed.addPageEmbed(embed =>
				embed
					.setTitle(showInfo.name)
					.setURL(showInfo.url)
					.setColor('DarkAqua')
					.setThumbnail(showInfo.thumbnail)
					.setDescription(showInfo.summary)
					.addFields(
						{ name: 'Language', value: showInfo.language, inline: true },
						{
							name: 'Genre(s)',
							value: showInfo.genres,
							inline: true
						},
						{
							name: 'Show Type',
							value: showInfo.type,
							inline: true
						},
						{
							name: 'Premiered',
							value: showInfo.premiered,
							inline: true
						},
						{ name: 'Network', value: showInfo.network, inline: true },

						{ name: 'Runtime', value: showInfo.runtime, inline: true },
						{ name: 'Average Rating', value: showInfo.rating }
					)
					.setFooter({
						text: `(Page ${i + 1}/${data.length}) Powered by tvmaze.com`,
						iconURL: 'https://static.tvmaze.com/images/favico/favicon-32x32.png'
					})
			);
		}

		return PaginatedEmbed.run(interaction);
	}

	private getData(query: string): Promise<any[]> {
		return new Promise(async function (resolve, reject) {
			const url = `http://api.tvmaze.com/search/shows?q=${encodeURI(query)}`;
			try {
				const response = await axios.get(url);
				if (response.status == 429) {
					reject(':x: Rate Limit exceeded. Please try again in a few minutes.');
				}
				if (response.status == 503) {
					reject(
						':x: The service is currently unavailable. Please try again later.'
					);
				}
				if (response.status !== 200) {
					reject(
						'There was a problem getting data from the API, make sure you entered a valid TV show name'
					);
				}
				const data = response.data;
				if (!Array.isArray(data) || !data.length) {
					reject(':x: No TV shows found matching your query.');
				}
				resolve(data);
			} catch (e) {
				Logger.error(e);
				reject(
					'There was a problem getting data from the API, make sure you entered a valid TV show name'
				);
			}
		});
	}

	private constructInfoObject(show: any): InfoObject {
		return {
			name: show.name || 'Unknown Show',
			url: show.url || 'https://www.tvmaze.com',
			summary: this.filterSummary(show.summary),
			language: this.checkIfNull(show.language),
			genres: this.checkGenres(show.genres),
			type: this.checkIfNull(show.type),
			premiered: this.checkIfNull(show.premiered),
			network: this.checkNetwork(show.network),
			runtime: show.runtime ? show.runtime + ' Minutes' : 'None Listed',
			rating: show.rating?.average
				? String(show.rating.average)
				: 'None Listed',
			thumbnail:
				show.image?.original || show.image?.medium
					? show.image.original || show.image.medium
					: 'https://static.tvmaze.com/images/no-img/no-img-portrait-text.png'
		};
	}

	private filterSummary(summary: string | null | undefined) {
		if (!summary) return 'No description available.';
		return summary
			.replace(/<(\/)?b>/g, '**')
			.replace(/<(\/)?i>/g, '*')
			.replace(/<(\/)?p>/g, '')
			.replace(/<br>/g, '\n')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&apos;/g, "'")
			.replace(/&quot;/g, '"')
			.replace(/&amp;/g, '&')
			.replace(/&#39;/g, "'");
	}

	private checkGenres(genres: any) {
		if (Array.isArray(genres)) {
			if (genres.join(' ').trim().length == 0) return 'None Listed';
			return genres.join(', ');
		} else if (!genres) {
			return 'None Listed';
		}
		return String(genres);
	}

	private checkIfNull(value: any) {
		if (!value) {
			return 'None Listed';
		}
		return String(value);
	}

	private checkNetwork(network: any) {
		if (!network) return 'None Listed';
		const code = network.country?.code ? `(**${network.country.code}**) ` : '';
		return `${code}${network.name || 'Unknown Network'}`;
	}
}

type InfoObject = {
	name: string;
	url: string;
	summary: string;
	language: string;
	genres: string;
	type: string;
	premiered: string;
	network: string;
	runtime: string;
	rating: string;
	thumbnail: string;
};

export const help: CommandHelp = {
	name: 'tv-show-search',
	category: 'other',
	description: 'Get TV shows information',
	usage: '/tv-show-search <query>',
	examples: ['/tv-show-search query: value'],
	options: [
		{
			name: 'query',
			description: 'What TV show do you want to look up?',
			required: true
		}
	]
};

import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import axios from 'axios';

@ApplyOptions<Command.Options>({
	name: 'game-search',
	description: 'Search for video game information using IGDB',
	preconditions: ['isCommandDisabled']
})
export class GameSearchCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName('game')
						.setDescription('The game you want to look up?')
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const clientId = process.env.TWITCH_CLIENT_ID;
		const clientSecret = process.env.TWITCH_CLIENT_SECRET;

		if (!clientId || !clientSecret) {
			return interaction.reply({
				content:
					'This command requires TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET to be configured for IGDB access.'
			});
		}

		const title = interaction.options.getString('game', true);
		await interaction.deferReply();

		try {
			const tokenRes = await axios.post(
				`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
			);
			const accessToken = tokenRes.data.access_token;

			const igdbRes = await axios.post(
				'https://api.igdb.com/v4/games',
				`search "${title.replace(/"/g, '')}"; fields name, summary, cover.url, first_release_date, total_rating, genres.name, platforms.name, involved_companies.company.name, involved_companies.developer, involved_companies.publisher; limit 1;`,
				{
					headers: {
						'Client-ID': clientId,
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'text/plain'
					}
				}
			);

			const game = igdbRes.data?.[0];
			if (!game) {
				return interaction.followUp({
					content: `No game found matching "${title}"`
				});
			}

			const releaseDate = game.first_release_date
				? `<t:${game.first_release_date}:D>`
				: 'None Listed';
			const score = game.total_rating
				? `${Math.round(game.total_rating)}/100`
				: 'None Listed';

			const coverUrl = game.cover?.url
				? `https:${game.cover.url.replace('/t_thumb/', '/t_cover_big/')}`
				: undefined;

			const genres =
				game.genres?.map((g: any) => g.name).join(', ') || 'None Listed';
			const platforms =
				game.platforms?.map((p: any) => p.name).join(', ') || 'None Listed';

			const developers =
				game.involved_companies
					?.filter((c: any) => c.developer)
					.map((c: any) => c.company?.name)
					.filter(Boolean)
					.join(', ') || 'None Listed';

			const publishers =
				game.involved_companies
					?.filter((c: any) => c.publisher)
					.map((c: any) => c.company?.name)
					.filter(Boolean)
					.join(', ') || 'None Listed';

			const PaginatedEmbed = new PaginatedMessage();

			PaginatedEmbed.addPageEmbed(embed => {
				embed
					.setTitle(`Game Info: ${game.name}`)
					.setDescription(
						game.summary
							? `>>> **Game Overview**\n${game.summary.slice(0, 2000)}`
							: 'No summary available.'
					)
					.setColor('#9146FF');

				if (coverUrl) embed.setThumbnail(coverUrl);

				embed
					.addFields(
						{ name: 'Release Date', value: `> ${releaseDate}`, inline: true },
						{
							name: 'Platforms',
							value: `> ${platforms.slice(0, 1024)}`,
							inline: true
						},
						{ name: 'IGDB Rating', value: `> ${score}`, inline: true }
					)
					.setTimestamp();

				return embed;
			});

			PaginatedEmbed.addPageEmbed(embed => {
				embed
					.setTitle(`Game Details: ${game.name}`)
					.setColor('#9146FF');

				if (coverUrl) embed.setThumbnail(coverUrl);

				embed
					.addFields(
						{
							name: 'Developer(s)',
							value: `> ${developers.slice(0, 1024)}`,
							inline: true
						},
						{
							name: 'Publisher(s)',
							value: `> ${publishers.slice(0, 1024)}`,
							inline: true
						},
						{
							name: 'Genre(s)',
							value: `> ${genres.slice(0, 1024)}`,
							inline: true
						}
					)
					.setTimestamp();

				return embed;
			});

			if (PaginatedEmbed.actions.size > 0) {
				PaginatedEmbed.actions.delete('@sapphire/paginated-messages.goToPage');
			}

			return PaginatedEmbed.run(interaction);
		} catch (error: any) {
			return interaction.followUp({
				content: 'An error occurred while fetching game details from IGDB.'
			});
		}
	}
}

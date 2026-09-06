import type { CommandHelp } from '../../lib/structures/CommandHelp.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import Logger from '../../lib/logger.js';

function getWeatherColor(condition: string): number {
	const lower = condition.toLowerCase();
	if (lower.includes('sunny') || lower.includes('clear')) return 0xf1c40f; // gold
	if (
		lower.includes('rain') ||
		lower.includes('shower') ||
		lower.includes('drizzle')
	)
		return 0x3498db; // blue
	if (lower.includes('thunder') || lower.includes('storm')) return 0x9b59b6; // purple
	if (
		lower.includes('snow') ||
		lower.includes('blizzard') ||
		lower.includes('ice')
	)
		return 0xecf0f1; // light white/grey
	if (
		lower.includes('cloud') ||
		lower.includes('overcast') ||
		lower.includes('mist') ||
		lower.includes('fog')
	)
		return 0x95a5a6; // grey
	return 0x5865f2; // blurple default
}

function getWeatherEmoji(condition: string): string {
	const lower = condition.toLowerCase();
	if (lower.includes('sunny') || lower.includes('clear')) return '☀️';
	if (lower.includes('partly cloudy')) return '⛅';
	if (lower.includes('cloud') || lower.includes('overcast')) return '☁️';
	if (lower.includes('thunder') || lower.includes('storm')) return '⛈️';
	if (
		lower.includes('snow') ||
		lower.includes('blizzard') ||
		lower.includes('ice')
	)
		return '❄️';
	if (
		lower.includes('rain') ||
		lower.includes('shower') ||
		lower.includes('drizzle')
	)
		return '🌧️';
	if (lower.includes('fog') || lower.includes('mist')) return '🌫️';
	return '🌡️';
}

@ApplyOptions<CommandOptions>({
	name: 'weather',
	description: 'Get current weather and 3-day forecast for any location',
	preconditions: ['isCommandDisabled']
})
export class WeatherCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName('location')
						.setDescription('City, region, or location name')
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();
		const query = interaction.options.getString('location', true);

		try {
			const encoded = encodeURIComponent(query.trim());
			const response = await fetch(`https://wttr.in/${encoded}?format=j1`, {
				headers: {
					'User-Agent': 'Master-Bot-Discord/1.0'
				}
			});

			if (!response.ok) {
				return await interaction.editReply({
					content: `:warning: Could not find weather data for **${query}**. Please check the spelling and try again.`
				});
			}

			const data = (await response.json()) as any;
			const current = data?.current_condition?.[0];
			const area = data?.nearest_area?.[0];

			if (!current || !area) {
				return await interaction.editReply({
					content: `:warning: No weather reports available for **${query}**.`
				});
			}

			const areaName = area.areaName?.[0]?.value || query;
			const region = area.region?.[0]?.value || '';
			const country = area.country?.[0]?.value || '';
			const locationHeader = [areaName, region, country]
				.filter(Boolean)
				.join(', ');

			const conditionDesc = current.weatherDesc?.[0]?.value || 'Unknown';
			const emoji = getWeatherEmoji(conditionDesc);
			const color = getWeatherColor(conditionDesc);

			const tempC = current.temp_C;
			const tempF = current.temp_F;
			const feelsC = current.FeelsLikeC;
			const feelsF = current.FeelsLikeF;
			const humidity = current.humidity;
			const windSpeedMph = current.windspeedMiles;
			const windSpeedKmph = current.windspeedKmph;
			const windDir = current.winddir16Point;
			const uvIndex = current.uvIndex;
			const visibility = current.visibility;

			const embed = new EmbedBuilder()
				.setTitle(`${emoji} Weather for ${locationHeader}`)
				.setColor(color)
				.setDescription(`**Current Conditions:** ${conditionDesc}`)
				.addFields(
					{
						name: '🌡️ Temperature',
						value: `**${tempC}°C** / **${tempF}°F**\n*(Feels like ${feelsC}°C / ${feelsF}°F)*`,
						inline: true
					},
					{
						name: '💧 Humidity',
						value: `**${humidity}%**`,
						inline: true
					},
					{
						name: '💨 Wind',
						value: `**${windSpeedMph} mph** (${windSpeedKmph} km/h)\nDirection: **${windDir}**`,
						inline: true
					},
					{
						name: '☀️ UV Index',
						value: `**${uvIndex}**`,
						inline: true
					},
					{
						name: '👁️ Visibility',
						value: `**${visibility} km**`,
						inline: true
					}
				);

			// 3-Day Forecast
			const forecasts = data.weather || [];
			if (forecasts.length > 0) {
				const forecastLines = forecasts
					.slice(0, 3)
					.map((f: any, idx: number) => {
						const dateStr = f.date;
						const maxC = f.maxtempC;
						const maxF = f.maxtempF;
						const minC = f.mintempC;
						const minF = f.mintempF;
						const dayDesc =
							f.hourly?.[4]?.weatherDesc?.[0]?.value ||
							f.hourly?.[0]?.weatherDesc?.[0]?.value ||
							'Partly Cloudy';
						const dayEmoji = getWeatherEmoji(dayDesc);
						const label =
							idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : dateStr;

						return `• **${label}**: ${dayEmoji} ${dayDesc} | High: **${maxC}°C** (${maxF}°F) • Low: **${minC}°C** (${minF}°F)`;
					});

				embed.addFields({
					name: '📅 3-Day Forecast',
					value: forecastLines.join('\n'),
					inline: false
				});
			}

			embed
				.setFooter({
					text: 'Weather Data provided by wttr.in • Master-Bot'
				})
				.setTimestamp();

			return await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			Logger.error('Weather command error: ', error);
			return await interaction.editReply({
				content: ':x: An unexpected error occurred while fetching weather data.'
			});
		}
	}
}

export const help: CommandHelp = {
	name: 'weather',
	category: 'other',
	description: 'Get current weather and 3-day forecast for any location',
	usage: '/weather <location>',
	examples: [
		'/weather location: Tokyo',
		'/weather location: London',
		'/weather location: New York'
	],
	options: [
		{
			name: 'location',
			description: 'City, region, or location name',
			required: true
		}
	]
};

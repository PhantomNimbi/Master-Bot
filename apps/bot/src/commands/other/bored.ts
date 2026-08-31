import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

interface ActivityResult {
	activity: string;
	type: string;
	participants: number;
	price?: number;
	accessibility?: string | number;
	link?: string;
}

const FALLBACK_ACTIVITIES: Record<string, string[]> = {
	education: [
		'Learn a new keyboard shortcut in your favorite software',
		'Watch a documentary on deep-sea marine life',
		'Read 3 Wikipedia articles on topics you have never heard of',
		'Learn the basics of a foreign language with an interactive lesson',
		'Explore the history of ancient Roman architecture'
	],
	recreational: [
		'Go on a 20-minute walk without looking at your phone',
		'Play a classic retro game online',
		'Try solving a cryptic crossword puzzle or sudoku',
		'Build a card tower or solve a Rubik’s cube',
		'Start a new casual video game or replay an old favorite'
	],
	social: [
		'Send a message to an old friend you haven’t talked to in a while',
		'Invite a friend to play an online multiplayer game or watch a stream',
		'Host a mini trivia session in voice chat with friends',
		'Compliment 3 different people today',
		'Call a family member to catch up'
	],
	diy: [
		'Organize and clean your computer desktop and file downloads',
		'Rearrange your desk or workspace for better productivity',
		'Create a custom Discord emote or avatar',
		'Fold an origami crane using scrap paper',
		'Repurpose old cardboard into a desk organizer'
	],
	charity: [
		'Donate unused clothes or items to a local shelter',
		'Leave a positive review for a local small business',
		'Pick up 5 pieces of trash in your neighborhood',
		'Offer to help a neighbor or friend with a task',
		'Contribute to an open-source or community wiki project'
	],
	cooking: [
		'Bake homemade cookies or muffins from scratch',
		'Create a custom smoothie with ingredients in your kitchen',
		'Cook a traditional dish from a country you have never visited',
		'Experiment with making your own specialty seasoning blend',
		'Make a warm cup of gourmet hot chocolate or matcha'
	],
	relaxation: [
		'Do a 10-minute guided breathing meditation',
		'Listen to ambient rain sounds or lofi chillhop',
		'Stretch your back, neck, and legs for 10 minutes',
		'Take a relaxing warm shower or bath',
		'Sit by a window and watch the clouds pass'
	],
	music: [
		'Listen to a complete album from an artist you’ve never heard of',
		'Create a personalized playlist for studying or gaming',
		'Learn the chords to your favorite song on an instrument',
		'Explore top charts from a different decade (e.g. 1980s synthpop)',
		'Analyze the lyrics of your all-time favorite song'
	],
	busywork: [
		'Unsubscribe from marketing emails in your inbox',
		'Back up important photos and documents to the cloud',
		'Clean and wipe down your keyboard and monitor screen',
		'Plan your schedule and goals for the upcoming week',
		'Organize your physical wallet or bag'
	]
};

function getCategoryColor(type: string): number {
	switch (type.toLowerCase()) {
		case 'education':
			return 0x3498db; // blue
		case 'recreational':
			return 0x2ecc71; // green
		case 'social':
			return 0xe91e63; // pink
		case 'diy':
			return 0xe67e22; // orange
		case 'charity':
			return 0x9b59b6; // purple
		case 'cooking':
			return 0xe74c3c; // red
		case 'relaxation':
			return 0x1abc9c; // teal
		case 'music':
			return 0xf1c40f; // yellow
		default:
			return 0x5865f2; // blurple
	}
}

function formatPrice(price?: number): string {
	if (price === undefined || price === null || price === 0) return '🟢 Free';
	if (price <= 0.3) return '🟡 Inexpensive ($)';
	if (price <= 0.6) return '🟠 Moderate ($$)';
	return '🔴 Pricey ($$$)';
}

@ApplyOptions<CommandOptions>({
	name: 'bored',
	description: 'Generate a fun, random activity to cure your boredom!',
	preconditions: ['isCommandDisabled']
})
export class BoredCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName('type')
						.setDescription('Filter by activity category')
						.setRequired(false)
						.addChoices(
							{ name: '📚 Education & Learning', value: 'education' },
							{ name: '🎮 Recreational', value: 'recreational' },
							{ name: '👥 Social & Friends', value: 'social' },
							{ name: '🛠️ DIY & Crafting', value: 'diy' },
							{ name: '💖 Charity & Giving', value: 'charity' },
							{ name: '🍳 Cooking & Baking', value: 'cooking' },
							{ name: '🧘 Relaxation & Mindfulness', value: 'relaxation' },
							{ name: '🎵 Music', value: 'music' },
							{ name: '📋 Productivity & Busywork', value: 'busywork' }
						)
				)
				.addIntegerOption(option =>
					option
						.setName('participants')
						.setDescription('Number of participants (1-8)')
						.setRequired(false)
						.setMinValue(1)
						.setMaxValue(8)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();
		const type = interaction.options.getString('type');
		const participants = interaction.options.getInteger('participants');

		let activityResult: ActivityResult | null = null;

		// 1. Try Bored API v2 (AppBrewery)
		try {
			const params = new URLSearchParams();
			if (type) params.append('type', type);
			if (participants) params.append('participants', participants.toString());

			const queryStr = params.toString() ? `?${params.toString()}` : '';
			const res = await fetch(
				`https://bored-api.appbrewery.com/random${queryStr}`,
				{
					headers: { 'User-Agent': 'Master-Bot-Discord/1.0' },
					signal: AbortSignal.timeout(3000)
				}
			);

			if (res.ok) {
				const json = (await res.json()) as ActivityResult;
				if (json && json.activity) {
					activityResult = json;
				}
			}
		} catch (err) {
			// fallback to secondary endpoint or curated list
		}

		// 2. Try Secondary Endpoint if primary didn't succeed
		if (!activityResult) {
			try {
				const params = new URLSearchParams();
				if (type) params.append('type', type);
				if (participants) params.append('participants', participants.toString());

				const queryStr = params.toString() ? `?${params.toString()}` : '';
				const res = await fetch(
					`https://bored.api.lewagon.com/api/activity${queryStr}`,
					{
						headers: { 'User-Agent': 'Master-Bot-Discord/1.0' },
						signal: AbortSignal.timeout(3000)
					}
				);

				if (res.ok) {
					const json = (await res.json()) as ActivityResult;
					if (json && json.activity) {
						activityResult = json;
					}
				}
			} catch (err) {
				// fallback to curated list
			}
		}

		// 3. Fallback to Curated In-Memory Activities
		if (!activityResult) {
			const categoryKey =
				type && FALLBACK_ACTIVITIES[type]
					? type
					: Object.keys(FALLBACK_ACTIVITIES)[
							Math.floor(Math.random() * Object.keys(FALLBACK_ACTIVITIES).length)
					  ];
			const list = FALLBACK_ACTIVITIES[categoryKey];
			const chosen = list[Math.floor(Math.random() * list.length)];

			activityResult = {
				activity: chosen,
				type: categoryKey,
				participants: participants || 1,
				price: 0
			};
		}

		const categoryName =
			activityResult.type.charAt(0).toUpperCase() + activityResult.type.slice(1);
		const color = getCategoryColor(activityResult.type);

		const embed = new EmbedBuilder()
			.setTitle(`💡 Activity: ${activityResult.activity}`)
			.setColor(color)
			.setDescription(`Here is a suggested activity to cure your boredom!`)
			.addFields(
				{
					name: '🎯 Category',
					value: `**${categoryName}**`,
					inline: true
				},
				{
					name: '👥 Participants',
					value: `**${activityResult.participants || 1}** ${
						(activityResult.participants || 1) === 1 ? 'person' : 'people'
					}`,
					inline: true
				},
				{
					name: '💰 Cost',
					value: formatPrice(activityResult.price),
					inline: true
				}
			);

		if (activityResult.link) {
			embed.addFields({
				name: '🔗 Resource Link',
				value: `[Learn More](${activityResult.link})`,
				inline: false
			});
		}

		embed
			.setFooter({
				text: 'Master-Bot Activities • Never Be Bored!'
			})
			.setTimestamp();

		return await interaction.editReply({ embeds: [embed] });
	}
}

export const help: CommandHelp = {
	name: 'bored',
	category: 'other',
	description: 'Generate a fun, random activity to cure your boredom!',
	usage: '/bored [type: Category] [participants: Number]',
	examples: [
		'/bored',
		'/bored type: cooking',
		'/bored type: social participants: 2'
	],
	options: [
		{
			name: 'type',
			description: 'Activity category (e.g. recreational, cooking, music)',
			required: false
		},
		{
			name: 'participants',
			description: 'Number of people participating (1-8)',
			required: false
		}
	]
};

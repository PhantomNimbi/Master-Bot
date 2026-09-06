import type { CommandHelp } from '../../lib/structures/CommandHelp';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	Message
} from 'discord.js';

const NUMBER_EMOJIS = [
	'1️⃣',
	'2️⃣',
	'3️⃣',
	'4️⃣',
	'5️⃣',
	'6️⃣',
	'7️⃣',
	'8️⃣',
	'9️⃣',
	'🔟'
];

function createProgressBar(percent: number, length: number = 10): string {
	const filled = Math.max(
		0,
		Math.min(length, Math.round((percent / 100) * length))
	);
	const empty = length - filled;
	return '█'.repeat(filled) + '░'.repeat(empty);
}

function buildPollEmbed(
	question: string,
	options: string[],
	userVotes: Map<string, Set<number>>,
	creatorUsername: string,
	creatorAvatar: string,
	endTimeUnix: number | null,
	isClosed: boolean = false
): EmbedBuilder {
	const totalVoters = userVotes.size;
	let totalVoteCount = 0;

	// Tally counts
	const optionCounts = new Array(options.length).fill(0);
	for (const votes of userVotes.values()) {
		for (const optIdx of votes) {
			if (optIdx >= 0 && optIdx < options.length) {
				optionCounts[optIdx]++;
				totalVoteCount++;
			}
		}
	}

	const maxVotes = Math.max(...optionCounts, 0);
	const winningIndices = optionCounts
		.map((count, idx) => (count === maxVotes && count > 0 ? idx : -1))
		.filter(idx => idx !== -1);

	let description = '';
	for (let i = 0; i < options.length; i++) {
		const count = optionCounts[i];
		const percent =
			totalVoteCount > 0 ? Math.round((count / totalVoteCount) * 100) : 0;
		const bar = createProgressBar(percent, 10);
		const isWinner = isClosed && winningIndices.includes(i);
		const crown = isWinner ? ' 👑' : '';

		description += `${NUMBER_EMOJIS[i]} **${options[i]}**${crown}\n\`${bar}\` **${count}** votes (${percent}%)\n\n`;
	}

	const embed = new EmbedBuilder()
		.setTitle(`📊 ${question}`)
		.setColor(isClosed ? 0x95a5a6 : 0x5865f2)
		.setDescription(description.trim())
		.addFields({
			name: '📈 Poll Statistics',
			value: `👥 **${totalVoters}** ${totalVoters === 1 ? 'voter' : 'voters'} • 🗳️ **${totalVoteCount}** total ${
				totalVoteCount === 1 ? 'vote' : 'votes'
			}`,
			inline: true
		});

	if (endTimeUnix) {
		embed.addFields({
			name: isClosed ? '⏱️ Status' : '⏳ Ending',
			value: isClosed
				? '🔒 **Poll Closed**'
				: `<t:${endTimeUnix}:R> (<t:${endTimeUnix}:t>)`,
			inline: true
		});
	}

	if (isClosed) {
		if (winningIndices.length === 0) {
			embed.addFields({
				name: '🏆 Result',
				value: 'No votes were cast in this poll.',
				inline: false
			});
		} else if (winningIndices.length === 1) {
			embed.addFields({
				name: '🏆 Winner',
				value: `🎉 **${options[winningIndices[0]]}** won with **${optionCounts[winningIndices[0]]}** votes!`,
				inline: false
			});
		} else {
			const winners = winningIndices
				.map(idx => `**${options[idx]}**`)
				.join(', ');
			embed.addFields({
				name: '🏆 Tied Winners',
				value: `🤝 Tie between: ${winners} (${maxVotes} votes each)`,
				inline: false
			});
		}
	}

	embed
		.setFooter({
			text: `Poll by ${creatorUsername} • Click buttons below to vote`,
			iconURL: creatorAvatar
		})
		.setTimestamp();

	return embed;
}

function buildButtonRows(
	options: string[],
	disabled: boolean = false
): ActionRowBuilder<ButtonBuilder>[] {
	const rows: ActionRowBuilder<ButtonBuilder>[] = [];
	let currentRow = new ActionRowBuilder<ButtonBuilder>();

	for (let i = 0; i < options.length; i++) {
		if (i > 0 && i % 5 === 0) {
			rows.push(currentRow);
			currentRow = new ActionRowBuilder<ButtonBuilder>();
		}

		const truncatedLabel =
			options[i].length > 60 ? options[i].slice(0, 57) + '...' : options[i];

		currentRow.addComponents(
			new ButtonBuilder()
				.setCustomId(`poll_opt_${i}`)
				.setLabel(`${NUMBER_EMOJIS[i]} ${truncatedLabel}`)
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(disabled)
		);
	}

	if (currentRow.components.length > 0) {
		rows.push(currentRow);
	}

	return rows;
}

@ApplyOptions<CommandOptions>({
	name: 'poll',
	description: 'Create an interactive multi-choice poll with button voting',
	preconditions: ['GuildOnly', 'isCommandDisabled']
})
export class PollCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName('question')
						.setDescription('The question or title for the poll')
						.setRequired(true)
				)
				.addStringOption(option =>
					option
						.setName('options')
						.setDescription('Comma-separated list of choices (2 to 10 choices)')
						.setRequired(true)
				)
				.addIntegerOption(option =>
					option
						.setName('duration')
						.setDescription('Poll duration in minutes (optional, 1-1440)')
						.setRequired(false)
						.setMinValue(1)
						.setMaxValue(1440)
				)
				.addBooleanOption(option =>
					option
						.setName('allow-multiple')
						.setDescription(
							'Allow voters to select multiple options (default: False)'
						)
						.setRequired(false)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		await interaction.deferReply();

		const question = interaction.options.getString('question', true).trim();
		const rawOptions = interaction.options.getString('options', true);
		const duration = interaction.options.getInteger('duration');
		const allowMultiple =
			interaction.options.getBoolean('allow-multiple') ?? false;

		const options = rawOptions
			.split(',')
			.map(opt => opt.trim())
			.filter(opt => opt.length > 0);

		if (options.length < 2) {
			return await interaction.editReply({
				content:
					':x: You must provide at least **2 choices** separated by commas (e.g. `Yes, No, Maybe`).'
			});
		}

		if (options.length > 10) {
			return await interaction.editReply({
				content: ':x: A poll cannot have more than **10 choices**.'
			});
		}

		const userVotes = new Map<string, Set<number>>();
		const endTimeUnix = duration
			? Math.floor((Date.now() + duration * 60 * 1000) / 1000)
			: null;

		const embed = buildPollEmbed(
			question,
			options,
			userVotes,
			interaction.user.username,
			interaction.user.displayAvatarURL(),
			endTimeUnix,
			false
		);

		const rows = buildButtonRows(options, false);

		await interaction.editReply({
			embeds: [embed],
			components: rows
		});

		const message = await interaction.fetchReply().catch(() => null);
		if (!message || !(message instanceof Message)) return;

		const collectorDuration = duration
			? duration * 60 * 1000
			: 24 * 60 * 60 * 1000; // default to 24h max button listener
		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: collectorDuration
		});

		collector.on('collect', async btnInteraction => {
			const customId = btnInteraction.customId;
			if (!customId.startsWith('poll_opt_')) return;

			const choiceIndex = parseInt(customId.replace('poll_opt_', ''), 10);
			if (
				isNaN(choiceIndex) ||
				choiceIndex < 0 ||
				choiceIndex >= options.length
			)
				return;

			const voterId = btnInteraction.user.id;
			let userChoices = userVotes.get(voterId);

			if (!userChoices) {
				userChoices = new Set<number>();
				userVotes.set(voterId, userChoices);
			}

			let responseMsg = '';

			if (allowMultiple) {
				if (userChoices.has(choiceIndex)) {
					userChoices.delete(choiceIndex);
					responseMsg = `🗑️ Removed your vote for **${options[choiceIndex]}**.`;
					if (userChoices.size === 0) {
						userVotes.delete(voterId);
					}
				} else {
					userChoices.add(choiceIndex);
					responseMsg = `✅ Voted for **${options[choiceIndex]}**!`;
				}
			} else {
				if (userChoices.has(choiceIndex)) {
					userChoices.clear();
					userVotes.delete(voterId);
					responseMsg = `🗑️ Removed your vote for **${options[choiceIndex]}**.`;
				} else {
					userChoices.clear();
					userChoices.add(choiceIndex);
					responseMsg = `✅ Voted for **${options[choiceIndex]}**!`;
				}
			}

			// Acknowledge voter immediately
			await btnInteraction.reply({
				content: responseMsg,
				ephemeral: true
			});

			// Update live poll embed
			const updatedEmbed = buildPollEmbed(
				question,
				options,
				userVotes,
				interaction.user.username,
				interaction.user.displayAvatarURL(),
				endTimeUnix,
				false
			);

			await interaction
				.editReply({
					embeds: [updatedEmbed],
					components: rows
				})
				.catch(() => {});
		});

		collector.on('end', async () => {
			const finalEmbed = buildPollEmbed(
				question,
				options,
				userVotes,
				interaction.user.username,
				interaction.user.displayAvatarURL(),
				endTimeUnix,
				true
			);

			const disabledRows = buildButtonRows(options, true);

			await interaction
				.editReply({
					embeds: [finalEmbed],
					components: disabledRows
				})
				.catch(() => {});
		});

		return;
	}
}

export const help: CommandHelp = {
	name: 'poll',
	category: 'other',
	description: 'Create an interactive multi-choice poll with button voting',
	usage:
		'/poll question: <Text> options: <Choice 1, Choice 2, ...> [duration: Minutes] [allow-multiple: True/False]',
	examples: [
		'/poll question: What game should we play? options: Valorant, Minecraft, Apex, Overwatch',
		'/poll question: Lunch time? options: Pizza, Burgers, Sushi duration: 30',
		'/poll question: Should we add this feature? options: Yes, No, Needs changes'
	],
	options: [
		{
			name: 'question',
			description: 'The poll question or topic',
			required: true
		},
		{
			name: 'options',
			description: 'Comma-separated choices (2 to 10 choices)',
			required: true
		},
		{
			name: 'duration',
			description: 'Poll duration in minutes (optional, 1-1440)',
			required: false
		},
		{
			name: 'allow-multiple',
			description: 'Allow members to select multiple choices',
			required: false
		}
	]
};

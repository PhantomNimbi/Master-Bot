import type { CommandHelp } from '../../lib/structures/CommandHelp.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { TriviaSession } from '../../lib/music/classes/TriviaSession.js';
import type { GuildMember, TextChannel } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'music-trivia',
	description: 'Start an interactive Music Trivia game in your voice channel!',
	preconditions: ['GuildOnly', 'isCommandDisabled', 'inVoiceChannel']
})
export class MusicTriviaCommand extends Command {
	public override registerApplicationCommands(
		registry: Command.Registry
	): void {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addIntegerOption(option =>
					option
						.setName('rounds')
						.setDescription('Number of rounds (1 - 15, default: 5)')
						.setRequired(false)
						.setMinValue(1)
						.setMaxValue(15)
				)
				.addStringOption(option =>
					option
						.setName('category')
						.setDescription('Music decade / category')
						.setRequired(false)
						.addChoices(
							{ name: 'All Categories (Mixed)', value: 'all' },
							{ name: '80s Hits', value: '80s' },
							{ name: '90s Hits', value: '90s' },
							{ name: '2000s Hits', value: '2000s' },
							{ name: '2010s Hits', value: '2010s' },
							{ name: 'Modern Hits', value: 'modern' }
						)
				)
		);
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const { client } = this.container;
		const guildId = interaction.guildId!;
		const member = interaction.member as GuildMember;
		const voiceChannel = member?.voice?.channel;

		if (!voiceChannel) {
			return await interaction.reply({
				content:
					':x: You must be connected to a voice channel to start Music Trivia!',
				ephemeral: true
			});
		}

		if (client.triviaSessions?.has(guildId)) {
			return await interaction.reply({
				content:
					':warning: A Music Trivia session is already running in this server! Use `/stop-trivia` to end it.',
				ephemeral: true
			});
		}

		const queue = client.music.queues.get(guildId);
		if (queue?.playing) {
			return await interaction.reply({
				content:
					':warning: The music queue is currently active. Please use `/leave` or wait for the queue to finish before starting Music Trivia.',
				ephemeral: true
			});
		}

		const rounds = interaction.options.getInteger('rounds') || 5;
		const category = interaction.options.getString('category') || 'all';

		await interaction.reply({
			content: `🎮 **Music Trivia** session initialized (${rounds} rounds, category: **${category}**)! Joining <#${voiceChannel.id}>...`
		});

		const session = new TriviaSession(
			guildId,
			interaction.channel as TextChannel,
			voiceChannel.id,
			rounds,
			category
		);

		if (!client.triviaSessions) client.triviaSessions = new Map();
		client.triviaSessions.set(guildId, session);
		return await session.start();
	}
}

export const help: CommandHelp = {
	name: 'music-trivia',
	category: 'music',
	description: 'Start an interactive Music Trivia game in your voice channel!',
	usage: '/music-trivia [rounds] [category]',
	examples: ['/music-trivia', '/music-trivia rounds: 10 category: 90s'],
	options: [
		{
			name: 'rounds',
			description: 'Number of rounds (1 - 15, default: 5)',
			required: false
		},
		{
			name: 'category',
			description: 'Music category / era',
			required: false
		}
	]
};

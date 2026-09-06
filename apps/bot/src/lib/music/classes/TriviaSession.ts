import {
	EmbedBuilder,
	type Message,
	type MessageCollector,
	type TextChannel
} from 'discord.js';
import { container } from '@sapphire/framework';
import { checkMatch } from '../triviaMatcher.js';
import { TRIVIA_SONGS, type TriviaSong } from '../triviaSongs.js';
import Logger from '../../logger.js';
import type { Player } from 'lavalink-client';

export interface ParticipantScore {
	userId: string;
	username: string;
	points: number;
}

export class TriviaSession {
	public readonly guildId: string;
	public readonly textChannel: TextChannel;
	public readonly voiceChannelId: string;
	public readonly totalRounds: number;
	public readonly songs: TriviaSong[];

	public currentRound: number = 0;
	public scores: Map<string, ParticipantScore> = new Map();
	public currentSong: TriviaSong | null = null;
	public titleGuessedBy: string | null = null;
	public artistGuessedBy: string | null = null;

	public isEnded: boolean = false;
	private roundTimer: NodeJS.Timeout | null = null;
	private messageCollector: MessageCollector | null = null;

	public constructor(
		guildId: string,
		textChannel: TextChannel,
		voiceChannelId: string,
		rounds = 5,
		category?: string
	) {
		this.guildId = guildId;
		this.textChannel = textChannel;
		this.voiceChannelId = voiceChannelId;
		this.totalRounds = Math.min(Math.max(rounds, 1), 15);

		let pool = TRIVIA_SONGS;
		if (category && category !== 'all') {
			const filtered = TRIVIA_SONGS.filter(s => s.category === category);
			if (filtered.length > 0) pool = filtered;
		}

		this.songs = [...pool]
			.sort(() => 0.5 - Math.random())
			.slice(0, this.totalRounds);
	}

	private get client() {
		return container.client;
	}

	private get player(): Player | null {
		return this.client.music.getPlayer(this.guildId) || null;
	}

	public async start(): Promise<void> {
		let player = this.player;
		if (!player) {
			player = this.client.music.createPlayer({
				guildId: this.guildId,
				voiceChannelId: this.voiceChannelId,
				selfDeaf: true
			});
		} else {
			player.options.voiceChannelId = this.voiceChannelId;
			player.voiceChannelId = this.voiceChannelId;
		}

		await player.connect();

		const startEmbed = new EmbedBuilder()
			.setTitle('🎵 Music Trivia Game Starting!')
			.setColor('Gold')
			.setDescription(
				`**Get ready!** We will play **${this.songs.length}** songs.\n` +
					`Guess the **Song Title** or the **Artist** in this text channel.\n\n` +
					`• **+1 Point** for Song Title\n` +
					`• **+1 Point** for Artist\n` +
					`• **30 Seconds** per song\n\n` +
					`*Starting round 1 in 3 seconds...*`
			)
			.setTimestamp();

		await this.textChannel.send({ embeds: [startEmbed] });

		setTimeout(() => {
			if (!this.isEnded) {
				void this.nextRound();
			}
		}, 3000);
	}

	public async nextRound(): Promise<void> {
		if (this.currentRound >= this.songs.length || this.isEnded) {
			return this.endGame();
		}

		this.currentSong = this.songs[this.currentRound];
		this.currentRound++;
		this.titleGuessedBy = null;
		this.artistGuessedBy = null;

		const node = this.client.music.nodeManager.nodes.values().next().value;
		if (!node) {
			await this.textChannel.send(':x: Audio engine unavailable for trivia.');
			return this.endGame();
		}

		try {
			const res = await node.search(
				{ query: this.currentSong.query },
				{ id: this.client.user?.id || 'bot', name: 'Trivia' }
			);

			const track = res?.tracks?.[0];
			if (!track) {
				Logger.warn(`Trivia song not found: ${this.currentSong.query}`);
				return this.nextRound();
			}

			const player = this.player;
			if (player) {
				const encodedTrack = track.encoded;
				await player.node.updatePlayer({
					guildId: this.guildId,
					noReplace: false,
					playerOptions: {
						track: {
							encoded: encodedTrack
						},
						position: 0,
						paused: false
					}
				});
				player.playing = true;
				player.paused = false;
			}

			const roundEmbed = new EmbedBuilder()
				.setTitle(`🎵 Round ${this.currentRound} / ${this.songs.length}`)
				.setColor('Blue')
				.setDescription(
					'🎧 **Listen to the clip!** Type your guesses for **Title** and **Artist** in this channel!\n*(30 seconds on the clock)*'
				)
				.setFooter({ text: 'Type your guess directly in chat!' });

			await this.textChannel.send({ embeds: [roundEmbed] });

			this.startCollector();

			this.roundTimer = setTimeout(() => {
				void this.finishRound();
			}, 30000);
		} catch (err) {
			Logger.error('Error starting trivia round: ', err);
			void this.nextRound();
		}
	}

	private startCollector(): void {
		if (this.messageCollector) {
			this.messageCollector.stop();
		}

		this.messageCollector = this.textChannel.createMessageCollector({
			filter: (m: Message) => !m.author.bot,
			time: 30000
		});

		this.messageCollector.on('collect', async (message: Message) => {
			if (this.isEnded || !this.currentSong) return;

			const userId = message.author.id;
			const username = message.author.username;
			const content = message.content;

			let scoreEntry = this.scores.get(userId);
			if (!scoreEntry) {
				scoreEntry = { userId, username, points: 0 };
				this.scores.set(userId, scoreEntry);
			}

			// Check title
			if (!this.titleGuessedBy) {
				if (
					checkMatch(content, this.currentSong.title, this.currentSong.aliases)
				) {
					this.titleGuessedBy = username;
					scoreEntry.points += 1;
					await message.react('🎉').catch(() => {});
					await this.textChannel.send(
						`✅ **${username}** guessed the **Song Title**! (+1 pt)`
					);
				}
			}

			// Check artist
			if (!this.artistGuessedBy) {
				if (
					checkMatch(
						content,
						this.currentSong.artist,
						this.currentSong.artistAliases
					)
				) {
					this.artistGuessedBy = username;
					scoreEntry.points += 1;
					await message.react('🔥').catch(() => {});
					await this.textChannel.send(
						`✅ **${username}** guessed the **Artist**! (+1 pt)`
					);
				}
			}

			// If both guessed, end round early
			if (this.titleGuessedBy && this.artistGuessedBy) {
				if (this.roundTimer) clearTimeout(this.roundTimer);
				void this.finishRound();
			}
		});
	}

	public async finishRound(): Promise<void> {
		if (this.messageCollector) {
			this.messageCollector.stop();
			this.messageCollector = null;
		}
		if (this.roundTimer) {
			clearTimeout(this.roundTimer);
			this.roundTimer = null;
		}

		if (!this.currentSong || this.isEnded) return;

		const revealEmbed = new EmbedBuilder()
			.setTitle(`✨ Round ${this.currentRound} Results`)
			.setColor('Purple')
			.setDescription(
				`**Song:** ${this.currentSong.title}\n` +
					`**Artist:** ${this.currentSong.artist}\n\n` +
					`• **Title Guessed By:** ${this.titleGuessedBy || '*Nobody*'}\n` +
					`• **Artist Guessed By:** ${this.artistGuessedBy || '*Nobody*'}\n\n` +
					this.getScoreboardText()
			)
			.setFooter({ text: 'Next round starting in 4 seconds...' });

		await this.textChannel.send({ embeds: [revealEmbed] });

		setTimeout(() => {
			if (!this.isEnded) {
				void this.nextRound();
			}
		}, 4000);
	}

	private getScoreboardText(): string {
		if (this.scores.size === 0) return '*No points awarded yet.*';

		const sorted = [...this.scores.values()].sort(
			(a, b) => b.points - a.points
		);
		return (
			'📊 **Current Scores:**\n' +
			sorted
				.map((s, idx) => `${idx + 1}. **${s.username}**: ${s.points} pts`)
				.join('\n')
		);
	}

	public async endGame(): Promise<void> {
		if (this.isEnded) return;
		this.isEnded = true;

		if (this.messageCollector) {
			this.messageCollector.stop();
		}
		if (this.roundTimer) {
			clearTimeout(this.roundTimer);
		}

		const player = this.player;
		if (player) {
			await player.disconnect();
			await this.client.music.destroyPlayer(this.guildId);
		}

		const sorted = [...this.scores.values()].sort(
			(a, b) => b.points - a.points
		);
		let finalDescription = '🏁 **The Music Trivia Game has concluded!**\n\n';

		if (sorted.length === 0) {
			finalDescription +=
				'No points were scored this game. Thanks for playing!';
		} else {
			finalDescription += '🏆 **Final Leaderboard:**\n';
			const medals = ['🥇', '🥈', '🥉'];
			finalDescription += sorted
				.map(
					(s, idx) =>
						`${medals[idx] || '▫️'} **${s.username}**: ${s.points} pts`
				)
				.join('\n');
		}

		const endEmbed = new EmbedBuilder()
			.setTitle('🎉 Music Trivia - Final Standings')
			.setColor('Gold')
			.setDescription(finalDescription)
			.setTimestamp();

		await this.textChannel.send({ embeds: [endEmbed] });
		this.client.triviaSessions?.delete(this.guildId);
	}

	public async stop(reason = 'Game stopped by user'): Promise<void> {
		if (this.isEnded) return;
		this.isEnded = true;

		if (this.messageCollector) this.messageCollector.stop();
		if (this.roundTimer) clearTimeout(this.roundTimer);

		const player = this.player;
		if (player) {
			await player.disconnect();
			await this.client.music.destroyPlayer(this.guildId);
		}

		this.client.triviaSessions?.delete(this.guildId);
		await this.textChannel.send(
			`:octagonal_sign: **Music Trivia stopped:** ${reason}`
		);
	}
}

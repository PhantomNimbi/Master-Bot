import type { Song } from './classes/Song.js';
import { container } from '@sapphire/framework';
import type { Queue } from './classes/Queue.js';
import {
	Message,
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
	ButtonStyle
} from 'discord.js';
import buttonsCollector, { deletePlayerEmbed } from './buttonsCollector.js';
import { NowPlayingEmbed } from './nowPlayingEmbed.js';
import Logger from '../logger.js';

export async function getPlayerActionRows(
	queue: Queue
): Promise<ActionRowBuilder<ButtonBuilder>[]> {
	const isReplaying = await queue.getReplay();

	const playbackRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId('playPause')
			.setLabel(queue.paused ? '▶️ Resume' : '⏸️ Pause')
			.setStyle(queue.paused ? ButtonStyle.Success : ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId('next')
			.setLabel('⏭️ Next')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId('stop')
			.setLabel('⏹️ Stop')
			.setStyle(ButtonStyle.Danger),
		new ButtonBuilder()
			.setCustomId('repeat')
			.setLabel(isReplaying ? '🔁 Repeat: ON' : '🔁 Repeat: OFF')
			.setStyle(isReplaying ? ButtonStyle.Success : ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('shuffle')
			.setLabel('🔀 Shuffle')
			.setStyle(ButtonStyle.Secondary)
	);

	const volumeRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId('volumeDown')
			.setLabel('🔉 Vol -')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('volumeUp')
			.setLabel('🔊 Vol +')
			.setStyle(ButtonStyle.Secondary)
	);

	return [playbackRow, volumeRow];
}

const progressIntervals = new Map<string, NodeJS.Timeout>();

export function stopProgressUpdater(guildId: string) {
	const existing = progressIntervals.get(guildId);
	if (existing) {
		clearInterval(existing);
		progressIntervals.delete(guildId);
	}
}

export function startProgressUpdater(queue: Queue) {
	stopProgressUpdater(queue.guildID);

	const interval = setInterval(async () => {
		try {
			if (!queue.player || !queue.player.connected || queue.paused) {
				return;
			}
			const currentTrack = await queue.getCurrentTrack();
			if (!currentTrack) {
				stopProgressUpdater(queue.guildID);
				return;
			}

			await updatePlayerEmbed(queue);
		} catch (err) {
			// Ignore update errors during transitions
		}
	}, 5000);

	progressIntervals.set(queue.guildID, interval);
}

export async function embedButtons(
	embed: EmbedBuilder,
	queue: Queue,
	song: Song,
	message?: string
) {
	stopProgressUpdater(queue.guildID);
	await deletePlayerEmbed(queue);

	const { client } = container;
	const rows = await getPlayerActionRows(queue);

	const channel = await queue.getTextChannel();
	if (!channel) return;

	return await channel
		.send({
			embeds: [embed],
			components: rows,
			content: message
		})
		.then(async (message: Message) => {
			const queue = client.music.queues.get(message.guild!.id);
			await queue.setEmbed(message.id);

			if (queue.player) {
				await buttonsCollector(message, song);
				startProgressUpdater(queue);
			}
		});
}

export async function updatePlayerEmbed(queue: Queue) {
	try {
		const embedId = await queue.getEmbed();
		if (!embedId) return;

		const channel = await queue.getTextChannel();
		if (!channel) return;

		const currentTrack = await queue.getCurrentTrack();
		if (!currentTrack) return;

		const message = await channel.messages.fetch(embedId).catch(() => null);
		if (!message) return;

		const tracks = await queue.tracks();
		const nowPlaying = new NowPlayingEmbed(
			currentTrack,
			queue.player?.position ?? 0,
			currentTrack.length ?? 0,
			queue.player?.volume ?? 100,
			tracks,
			tracks.at(-1),
			queue.paused
		);

		const rows = await getPlayerActionRows(queue);

		await message
			.edit({
				embeds: [await nowPlaying.NowPlayingEmbed()],
				components: rows
			})
			.catch(() => {});
	} catch (err) {
		Logger.error('Failed to update player embed: ', err);
	}
}

import { Time } from '@sapphire/time-utilities';
import type { Message, MessageComponentInteraction } from 'discord.js';
import { container } from '@sapphire/framework';
import type { Queue } from './classes/Queue';
import { NowPlayingEmbed } from './nowPlayingEmbed';
import type { Song } from './classes/Song';
import Logger from '../logger';

export default async function buttonsCollector(message: Message, song: Song) {
	const { client } = container;

	const queue = client.music.queues.get(message.guildId!);
	const channel = await queue.getTextChannel();

	const collector = message.createMessageComponentCollector();
	if (!channel) return;

	const maxLimit = Time.Minute * 30;
	let timer;

	collector.on('collect', async (i: MessageComponentInteraction) => {
		if (!message.member?.voice.channel?.members.has(i.user.id)) {
			await i.reply({
				content: `:x: Only available to members in ${message.member?.voice.channel} <-- Click To Join`,
				ephemeral: true
			});
			return;
		}

		if (i.customId === 'playPause') {
			if (queue.paused) {
				await queue.resume();
				clearTimeout(client.leaveTimers[queue.guildID]!);
			} else {
				client.leaveTimers[queue.guildID] = setTimeout(async () => {
					await channel.send(':zzz: Leaving due to inactivity');
					await queue.leave();
				}, maxLimit);
				await queue.pause();
			}

			const tracks = await queue.tracks();
			const NowPlaying = new NowPlayingEmbed(
				song,
				queue.player?.position ?? 0,
				song.length,
				queue.player?.volume ?? 100,
				tracks,
				tracks.at(-1),
				queue.player?.paused ?? false
			);
			collector.empty();
			await i.update({
				embeds: [await NowPlaying.NowPlayingEmbed()]
			});
			return;
		}
		if (i.customId === 'stop') {
			clearTimeout(timer);
			await queue.leave();
			return;
		}
		if (i.customId === 'next') {
			clearTimeout(timer);
			await queue.next({ skipped: true });
			return;
		}
		if (i.customId === 'volumeUp') {
			const currentVolume = await queue.getVolume();
			const volume = currentVolume + 10 > 200 ? 200 : currentVolume + 10;
			await queue.setVolume(volume);
			const tracks = await queue.tracks();
			const NowPlaying = new NowPlayingEmbed(
				song,
				queue.player?.position ?? 0,
				song.length,
				queue.player?.volume ?? 100,
				tracks,
				tracks.at(-1),
				queue.player?.paused ?? false
			);
			collector.empty();
			await i.update({
				embeds: [await NowPlaying.NowPlayingEmbed()]
			});
			return;
		}
		if (i.customId === 'volumeDown') {
			const currentVolume = await queue.getVolume();
			const volume = currentVolume - 10 < 0 ? 0 : currentVolume - 10;
			await queue.setVolume(volume);
			const tracks = await queue.tracks();
			const NowPlaying = new NowPlayingEmbed(
				song,
				queue.player?.position ?? 0,
				song.length,
				queue.player?.volume ?? 100,
				tracks,
				tracks.at(-1),
				queue.player?.paused ?? false
			);
			collector.empty();
			await i.update({ embeds: [await NowPlaying.NowPlayingEmbed()] });
			return;
		}
	});

	collector.on('end', async () => {
		clearTimeout(timer);
	});

	return collector;
}

export async function deletePlayerEmbed(queue: Queue) {
	try {
		const embedID = await queue.getEmbed();
		if (embedID) {
			const channel = await queue.getTextChannel();
			if (channel) {
				try {
					const oldMessage = await channel.messages.fetch(embedID);
					if (oldMessage && oldMessage.deletable) {
						await oldMessage.delete();
					}
				} catch {
					// Message already deleted by user or channel purged
				}
			}
			await queue.deleteEmbed();
		}
	} catch (error) {
		Logger.error('Failed to Delete Player Embed: ', error);
	}
}

import { container } from '@sapphire/framework';
import { Song } from './classes/Song';
import type { User } from 'discord.js';

export default async function searchSong(
	query: string,
	user: User
): Promise<[string, Song[]]> {
	const { client } = container;
	const tracks: Song[] = [];
	let displayMessage = '';
	const { avatar, defaultAvatarURL, id, displayName } = user;
	const requester = {
		avatar,
		defaultAvatarURL,
		id,
		name: displayName
	};

	try {
		const node = client.music.nodeManager.nodes.values().next().value;
		if (!node) {
			displayMessage = ':x: Lavalink node unavailable.';
			return [displayMessage, tracks];
		}

		const searchResult = await node.search(
			query.startsWith('http') ? { query } : { query, source: 'ytsearch' },
			requester
		);

		if (
			!searchResult ||
			!searchResult.tracks ||
			searchResult.tracks.length === 0 ||
			searchResult.loadType === 'empty' ||
			searchResult.loadType === 'error'
		) {
			displayMessage = ":x: Couldn't find what you were looking for :(";
			return [displayMessage, tracks];
		}

		if (searchResult.loadType === 'playlist') {
			searchResult.tracks.forEach(track =>
				tracks.push(new Song(track, Date.now(), requester))
			);
			displayMessage = `Queued playlist [**${
				searchResult.playlist?.name || 'Playlist'
			}**](${query}), it has a total of **${tracks.length}** tracks.`;
		} else if (
			searchResult.loadType === 'search' ||
			searchResult.loadType === 'track'
		) {
			const track = searchResult.tracks[0];
			tracks.push(new Song(track, Date.now(), requester));
			displayMessage = `Queued [**${track.info.title}**](${track.info.uri})`;
		}
	} catch (err) {
		displayMessage = ":x: Couldn't find what you were looking for :(";
	}

	return [displayMessage, tracks];
}

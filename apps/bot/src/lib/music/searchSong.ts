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
			displayMessage = ":x: Lavalink node unavailable.";
			return [displayMessage, tracks];
		}

		const identifier = /^https?:\/\//.test(query) ? query : `ytsearch:${query}`;
		const results: any = await node.makeRequest(
			`/v4/loadtracks?identifier=${encodeURIComponent(identifier)}`
		);

		if (!results || results.loadType === 'empty' || results.loadType === 'error') {
			displayMessage = ":x: Couldn't find what you were looking for :(";
			return [displayMessage, tracks];
		}

		if (results.loadType === 'playlist') {
			const playlistTracks = results.data?.tracks || [];
			playlistTracks.forEach((track: any) =>
				tracks.push(new Song(track, Date.now(), requester))
			);
			displayMessage = `Queued playlist [**${
				results.data?.info?.name || 'Playlist'
			}**](${query}), it has a total of **${tracks.length}** tracks.`;
		} else if (results.loadType === 'search') {
			const searchTracks = Array.isArray(results.data) ? results.data : [];
			if (searchTracks.length > 0) {
				const track = searchTracks[0];
				tracks.push(new Song(track, Date.now(), requester));
				displayMessage = `Queued [**${track.info.title}**](${track.info.uri})`;
			}
		} else if (results.loadType === 'track') {
			const track = results.data;
			tracks.push(new Song(track, Date.now(), requester));
			displayMessage = `Queued [**${track.info.title}**](${track.info.uri})`;
		}
	} catch (err) {
		displayMessage = ":x: Couldn't find what you were looking for :(";
	}

	return [displayMessage, tracks];
}

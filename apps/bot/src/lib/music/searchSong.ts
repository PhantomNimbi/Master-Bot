import { container } from '@sapphire/framework';
import { Song } from './classes/Song';
import type { User } from 'discord.js';
import { env } from '../../env';

/**
 * Helper check functions for configured API keys / tokens.
 */
function hasSpotifyKeys(): boolean {
	return !!(env.SPOTIFY_CLIENT_ID && env.SPOTIFY_CLIENT_SECRET);
}

function hasYouTubeKeys(): boolean {
	return !!(env.YOUTUBE_API_KEY || env.YOUTUBE_REFRESH_TOKEN);
}

function hasAnyAudioKeys(): boolean {
	// SoundCloud uses Lavalink's built-in source (no API keys required).
	// Only YouTube and Spotify require keys to determine if Lavalink should launch.
	return hasSpotifyKeys() || hasYouTubeKeys();
}

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

	// 1. Check if any music API keys are configured. If none, Lavalink is disabled.
	if (!hasAnyAudioKeys()) {
		displayMessage =
			':x: Lavalink audio engine is disabled because no music API keys (YouTube or Spotify) are configured in `.env`.';
		return [displayMessage, tracks];
	}

	try {
		const node = client.music.nodeManager.nodes.values().next().value;
		if (!node) {
			displayMessage = ':x: Lavalink node unavailable.';
			return [displayMessage, tracks];
		}

		// 2. URL gating & direct resolution
		if (query.startsWith('http')) {
			const lowerQuery = query.toLowerCase();
			if (lowerQuery.includes('spotify.com') && !hasSpotifyKeys()) {
				displayMessage =
					':x: Spotify playback is disabled because `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are not set in `.env`.';
				return [displayMessage, tracks];
			}
			if (
				(lowerQuery.includes('youtube.com') ||
					lowerQuery.includes('youtu.be')) &&
				!hasYouTubeKeys()
			) {
				displayMessage =
					':x: YouTube playback is disabled because no `YOUTUBE_API_KEY` or `YOUTUBE_REFRESH_TOKEN` is configured in `.env`.';
				return [displayMessage, tracks];
			}

			// Direct URL search (SoundCloud URLs handled natively by built-in source)
			const searchResult = await node.search({ query }, requester);
			return processSearchResult(searchResult, query, requester, tracks);
		}

		// 3. Plain text query: determine search source order based on available keys
		// Order of preference: YouTube Music -> YouTube Video -> SoundCloud (free fallback) -> Spotify
		const searchSources: string[] = [];
		if (hasYouTubeKeys()) {
			searchSources.push('ytmsearch');
			searchSources.push('ytsearch');
		}
		searchSources.push('scsearch'); // Built-in source, no API keys needed
		if (hasSpotifyKeys()) searchSources.push('spsearch');

		for (const source of searchSources) {
			const searchResult = await node.search(
				{ query, source: source as any },
				requester
			);
			if (
				searchResult &&
				searchResult.tracks &&
				searchResult.tracks.length > 0 &&
				searchResult.loadType !== 'empty' &&
				searchResult.loadType !== 'error'
			) {
				return processSearchResult(searchResult, query, requester, tracks);
			}
		}

		displayMessage = ":x: Couldn't find what you were looking for :(";
	} catch (err) {
		displayMessage = ":x: Couldn't find what you were looking for :(";
	}

	return [displayMessage, tracks];
}

function processSearchResult(
	searchResult: any,
	query: string,
	requester: any,
	tracks: Song[]
): [string, Song[]] {
	let displayMessage = '';
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
		searchResult.tracks.forEach((track: any) =>
			tracks.push(new Song(track, Date.now(), requester))
		);
		displayMessage = `Queued playlist [**${
			searchResult.playlist?.name || 'Playlist'
		}**](<${query}>), it has a total of **${tracks.length}** tracks.`;
	} else if (
		searchResult.loadType === 'search' ||
		searchResult.loadType === 'track'
	) {
		const track = searchResult.tracks[0];
		tracks.push(new Song(track, Date.now(), requester));
		displayMessage = `Queued [**${track.info.title}**](<${track.info.uri}>)`;
	}

	return [displayMessage, tracks];
}

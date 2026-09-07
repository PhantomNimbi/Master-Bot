import type { Playlist } from '../types';
import type { SessionStore } from '../SessionStore';

export function createPlaylistsHandlers(store: SessionStore) {
	return {
		create: (input: {
			guildId: string;
			name: string;
			userId: string;
		}): Playlist => {
			const userPlaylists = store.getUserPlaylists(
				input.guildId,
				input.userId
			);
			if (userPlaylists.has(input.name)) {
				throw new Error(`Playlist "${input.name}" already exists`);
			}
			const playlist: Playlist = {
				id: store.nextPlaylistId++,
				name: input.name,
				userId: input.userId,
				guildId: input.guildId,
				songs: []
			};
			userPlaylists.set(input.name, playlist);
			store.persist(async () => {
				const dbId = await store.getUserDbId(input.userId);
				await store.db.playlist.create({
					data: {
						id: playlist.id,
						name: input.name,
						guildId: input.guildId,
						userId: dbId
					}
				});
			});
			return playlist;
		},
		delete: (input: {
			guildId: string;
			name: string;
			userId: string;
		}): Playlist | null => {
			const userPlaylists = store.getUserPlaylists(
				input.guildId,
				input.userId
			);
			const playlist = userPlaylists.get(input.name);
			if (!playlist) return null;
			userPlaylists.delete(input.name);
			store.persist(async () => {
				const dbId = await store.getUserDbId(input.userId);
				await store.db.playlist.deleteMany({
					where: { guildId: input.guildId, userId: dbId, name: input.name }
				});
			});
			return playlist;
		},
		getPlaylist: (input: {
			guildId: string;
			name: string;
			userId: string;
		}): { playlist: Playlist | null } => {
			const userPlaylists = store.getUserPlaylists(
				input.guildId,
				input.userId
			);
			return { playlist: userPlaylists.get(input.name) || null };
		},
		getAll: (input: {
			guildId: string;
			userId: string;
		}): { playlists: Playlist[] } => {
			return {
				playlists: Array.from(
					store.getUserPlaylists(input.guildId, input.userId).values()
				)
			};
		}
	};
}
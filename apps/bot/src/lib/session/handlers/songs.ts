import type { SongRecord } from '../types';
import type { SessionStore } from '../SessionStore';

export function createSongsHandlers(store: SessionStore) {
	return {
		createMany: (input: {
			songs: Array<Omit<SongRecord, 'id'>>;
		}): SongRecord[] => {
			const records = input.songs.map(song => {
				const record: SongRecord = {
					...song,
					id: store.nextSongId++
				};
				store.addSongToPlaylist(record);
				return record;
			});
			store.persist(() =>
				store.db.song.createMany({
					data: records
				})
			);
			return records;
		},
		delete: (input: { id: number }): { song: SongRecord } => {
			const song = store.removeSongById(input.id);
			if (!song) throw new Error(`Song "${input.id}" not found`);
			store.persist(() =>
				store.db.song.delete({ where: { id: song.id } })
			);
			return { song };
		}
	};
}
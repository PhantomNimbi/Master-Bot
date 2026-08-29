import { decode } from '@lavalink/encoding';
import * as MetadataFilter from 'metadata-filter';

export interface TrackInfo {
	track: string;
	length: number;
	identifier: string;
	author: string;
	isStream: boolean;
	position: number;
	title: string;
	uri: string;
	isSeekable: boolean;
	sourceName: string;
	thumbnail: string;
	added: number;
}

export class Song implements TrackInfo {
	readonly track: string;
	requester?: RequesterInfo;
	length: number;
	identifier: string;
	author: string;
	isStream: boolean;
	position: number;
	title: string;
	uri: string;
	isSeekable: boolean;
	sourceName: string;
	thumbnail: string;
	added: number;

	constructor(
		track: string | any,
		added?: number,
		requester?: RequesterInfo
	) {
		this.requester = requester;
		this.added = added ?? Date.now();
		const filterSet = {
			song: [
				MetadataFilter.removeVersion,
				MetadataFilter.removeRemastered,
				MetadataFilter.fixTrackSuffix,
				MetadataFilter.removeLive,
				MetadataFilter.youtube,
				MetadataFilter.normalizeFeature
			]
		};
		const filter = MetadataFilter.createFilter(filterSet);

		if (typeof track !== 'string') {
			this.track = track.encoded ?? track.track ?? '';
			this.length = track.info?.length ?? 0;
			this.identifier = track.info?.identifier ?? '';
			this.author = track.info?.author ?? '';
			this.isStream = track.info?.isStream ?? false;
			this.position = track.info?.position ?? 0;
			this.title = filter.filterField('song', track.info?.title ?? '');
			this.uri = track.info?.uri ?? '';
			this.isSeekable = track.info?.isSeekable ?? true;
			this.sourceName = track.info?.sourceName ?? 'youtube';
			this.thumbnail = track.info?.artworkUrl || this.getThumbnailFallback();
		} else {
			this.track = track;
			const decoded = decode(this.track);
			this.length = Number(decoded.length);
			this.identifier = decoded.identifier;
			this.author = decoded.author;
			this.isStream = decoded.isStream;
			this.position = Number(decoded.position);
			this.title = filter.filterField('song', decoded.title);
			this.uri = decoded.uri!;
			this.isSeekable = !decoded.isStream;
			this.sourceName = decoded.source;
			this.thumbnail = this.getThumbnailFallback();
		}
	}

	private getThumbnailFallback(): string {
		switch (this.sourceName) {
			case 'vimeo':
				return 'https://i.imgur.com/npxyTWi.png';
			case 'youtube':
				return `https://img.youtube.com/vi/${this.identifier}/hqdefault.jpg`;
			case 'twitch':
				return 'https://i.imgur.com/nO3f4jq.png';
			default:
				return 'https://cdn.discordapp.com/embed/avatars/1.png';
		}
	}
}

interface RequesterInfo {
	avatar?: string | null;
	defaultAvatarURL?: string;
	id?: string;
	name?: string;
}

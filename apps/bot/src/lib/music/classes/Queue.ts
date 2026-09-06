// In-Memory Queue Store (Zero External Redis Dependency)
import type {
	CommandInteraction,
	Guild,
	GuildMember,
	TextChannel,
	VoiceChannel
} from 'discord.js';
import type { Song } from './Song';
import type { Player } from 'lavalink-client';
import { container } from '@sapphire/framework';
import type { QueueStore } from './QueueStore';
import { deletePlayerEmbed } from '../buttonsCollector';
import { trpcNode } from '../../../trpc';
import Logger from '../../logger';

export enum LoopType {
	None,
	Queue,
	Song
}

export interface QueueEvents {
	trackStart: (song: Song) => void;
	trackEnd: (song: Song) => void;
	finish: () => void;
}

export interface Loop {
	type: LoopType;
	current: number;
	max: number;
}

export interface AddOptions {
	requester?: string;
	userInfo?: GuildMember;
	added?: number;
	next?: boolean;
}

export type Addable = string | Song;

export interface NowPlaying {
	song: Song;
	position: number;
}

export class Queue {
	public skipped = false;
	private _tracks: Song[] = [];
	private _current: Song | null = null;
	private _replay = false;
	private _systemPaused = false;
	private _volume = 100;
	private _textChannelId: string | null = null;
	private _embedId: string | null = null;

	public constructor(
		public readonly store: QueueStore,
		public readonly guildID: string
	) {}

	public get client() {
		return container.client;
	}

	public get player(): Player {
		return this.store.client.getPlayer(this.guildID)!;
	}

	public get playing(): boolean {
		return Boolean(
			this.player?.playing ||
			(this.player?.voiceChannelId && this.player?.connected)
		);
	}

	public async isPlaying(): Promise<boolean> {
		return Boolean(this._current);
	}

	public get paused(): boolean {
		return Boolean(this.player?.paused);
	}

	public get guild(): Guild {
		return this.client.guilds.cache.get(this.guildID) as Guild;
	}

	public get voiceChannel(): VoiceChannel | null {
		const id = this.voiceChannelID;
		return id
			? ((this.guild?.channels.cache.get(id) as VoiceChannel) ?? null)
			: null;
	}

	public get voiceChannelID(): string | null {
		if (!this.player) return null;
		return this.player.voiceChannelId ?? null;
	}

	public createPlayer(voiceChannelId?: string): Player {
		let player = this.player;
		if (!player) {
			player = this.store.client.createPlayer({
				guildId: this.guildID,
				voiceChannelId: voiceChannelId || '',
				selfDeaf: true
			});
		} else if (voiceChannelId) {
			player.options.voiceChannelId = voiceChannelId;
			player.voiceChannelId = voiceChannelId;
		}
		return player;
	}

	public async destroyPlayer(): Promise<void> {
		if (this.player) {
			await this.player.destroy();
		}
	}

	public async start(replaying = false): Promise<boolean> {
		const np = await this.nowPlaying();
		if (!np) return this.next();

		const player = this.player || this.createPlayer();
		if (!player) {
			Logger.error(
				`Could not retrieve or create Lavalink player for guild ${this.guildID}`
			);
			return false;
		}

		try {
			const volume = await this.getVolume();
			await player.setVolume(volume);
			const trackString = (np.song as Song).track;
			await player.node.updatePlayer({
				guildId: this.guildID,
				noReplace: false,
				playerOptions: {
					track: {
						encoded: trackString
					},
					volume,
					position: 0,
					paused: false
				}
			});
			player.playing = true;
			player.paused = false;
		} catch (err) {
			Logger.error('Failed to start track on Lavalink: ', err);
			await this.leave();
			return false;
		}

		this.client.emit(
			replaying ? 'musicSongReplay' : 'musicSongPlay',
			this,
			np.song as Song
		);
		return true;
	}

	public async canStart(): Promise<boolean> {
		return Boolean(this._current || this._tracks.length > 0);
	}

	public async add(
		songs: Song | Array<Song>,
		options: AddOptions = {}
	): Promise<number> {
		const list = Array.isArray(songs) ? songs : [songs];
		if (!list.length) return 0;

		if (options.next) {
			this._tracks.unshift(...list);
		} else {
			this._tracks.push(...list);
		}
		return list.length;
	}

	public async pause(interaction?: CommandInteraction) {
		if (this.player) await this.player.pause();
		await this.setSystemPaused(false);
		if (interaction) {
			this.client.emit('musicSongPause', interaction);
		}
	}

	public async resume(interaction?: CommandInteraction) {
		if (this.player) await this.player.resume();
		await this.setSystemPaused(false);
		if (interaction) {
			this.client.emit('musicSongResume', interaction);
		}
	}

	public async getSystemPaused(): Promise<boolean> {
		return this._systemPaused;
	}

	public async setSystemPaused(value: boolean): Promise<boolean> {
		this._systemPaused = value;
		return value;
	}

	public async getReplay(): Promise<boolean> {
		return this._replay;
	}

	public async setReplay(value: boolean): Promise<boolean> {
		this._replay = value;
		this.client.emit('musicReplayUpdate', this, value);
		return value;
	}

	public async getVolume(): Promise<number> {
		return this._volume;
	}

	public async setVolume(
		value: number
	): Promise<{ previous: number; next: number }> {
		const previous = this._volume;
		this._volume = value;
		if (this.player) await this.player.setVolume(value);

		await trpcNode.guild.updateVolume
			.mutate({
				guildId: this.guildID,
				volume: value
			})
			.catch(() => {});

		this.client.emit('musicSongVolumeUpdate', this, value);
		return { previous, next: value };
	}

	public async seek(position: number): Promise<void> {
		if (this.player) await this.player.seek(position);
	}

	public async connect(channelID: string): Promise<void> {
		const player = this.createPlayer(channelID);
		player.options.voiceChannelId = channelID;
		player.voiceChannelId = channelID;
		await player.connect();
	}

	public async leave(): Promise<void> {
		if (await this.getEmbed()) {
			await deletePlayerEmbed(this);
		}
		if (this.client.leaveTimers[this.guildID]) {
			clearTimeout(this.client.leaveTimers[this.guildID]);
			delete this.client.leaveTimers[this.guildID];
		}
		if (this.player) {
			await this.player.disconnect();
			await this.destroyPlayer();
		}
		await this.setTextChannelID(null);
		await this.clear();
	}

	public async getTextChannel(): Promise<TextChannel | null> {
		const id = await this.getTextChannelID();
		if (id === null) return null;

		const channel = this.guild?.channels.cache.get(id) ?? null;
		if (channel === null) {
			await this.setTextChannelID(null);
			return null;
		}

		return channel as TextChannel;
	}

	public async getTextChannelID(): Promise<string | null> {
		return this._textChannelId;
	}

	public async setTextChannelID(
		channelID: string | null
	): Promise<string | null> {
		this._textChannelId = channelID;
		return channelID;
	}

	public async getCurrentTrack(): Promise<Song | null> {
		return this._current;
	}

	public async getAt(index: number): Promise<Song | undefined> {
		return this._tracks[index];
	}

	public async removeAt(position: number): Promise<void> {
		if (position >= 0 && position < this._tracks.length) {
			this._tracks.splice(position, 1);
		}
	}

	public async next({ skipped = false } = {}): Promise<boolean> {
		if (skipped) this.skipped = true;
		const replaying = this._replay;

		if (!skipped && replaying && this._current) {
			return await this.start(true);
		}

		if (replaying) this._replay = false;

		const nextEntry = this._tracks.shift() ?? null;
		this._current = nextEntry;

		if (nextEntry) {
			return this.start(false);
		} else {
			await this.leave();
			this.client.emit('musicFinish', this, true);
			return false;
		}
	}

	public async count(): Promise<number> {
		return this._tracks.length;
	}

	public async moveTracks(from: number, to: number): Promise<void> {
		if (from >= 0 && from < this._tracks.length && to >= 0 && to < this._tracks.length) {
			const [item] = this._tracks.splice(from, 1);
			if (item) this._tracks.splice(to, 0, item);
		}
	}

	public async shuffleTracks(): Promise<void> {
		for (let i = this._tracks.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this._tracks[i], this._tracks[j]] = [this._tracks[j], this._tracks[i]];
		}
	}

	public async stop(): Promise<void> {
		await this.destroyPlayer();
	}

	public async clearTracks(): Promise<void> {
		this._tracks = [];
	}

	public async skipTo(position: number): Promise<void> {
		if (position > 0 && position < this._tracks.length) {
			this._tracks.splice(0, position);
		}
		await this.next({ skipped: true });
	}

	public async refresh(): Promise<void> {
		// In-memory state does not expire
	}

	public async clear(): Promise<number> {
		const count = this._tracks.length;
		this._tracks = [];
		this._current = null;
		this._replay = false;
		this._systemPaused = false;
		this._embedId = null;
		return count;
	}

	public async nowPlaying(): Promise<NowPlaying | null> {
		if (!this._current) return null;
		return {
			song: this._current,
			position: this.player?.position ?? 0
		};
	}

	public async tracks(start = 0, end = -1): Promise<Song[]> {
		if (end === -1 || end === Infinity) {
			return this._tracks.slice(start);
		}
		return this._tracks.slice(start, end + 1);
	}

	public async setEmbed(id: string): Promise<void> {
		this._embedId = id;
	}

	public async getEmbed(): Promise<string | null> {
		return this._embedId;
	}

	public async deleteEmbed(): Promise<void> {
		this._embedId = null;
	}

	public stringifySong(song: Song): string {
		return JSON.stringify(song);
	}

	public parseSongString(song: string): Song {
		return typeof song === 'string' ? JSON.parse(song) : song;
	}
}

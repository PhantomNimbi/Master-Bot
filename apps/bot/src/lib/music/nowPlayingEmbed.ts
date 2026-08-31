import { ColorResolvable, EmbedBuilder } from 'discord.js';
import type { Song } from './classes/Song';

type PositionType = number | undefined;

export class NowPlayingEmbed {
	track: Song;
	position: PositionType;
	length: number;
	volume: number;
	queue?: Song[];
	last?: Song;
	paused?: Boolean;

	public constructor(
		track: Song,
		position: PositionType,
		length: number,
		volume: number,
		queue?: Song[],
		last?: Song,
		paused?: Boolean
	) {
		this.track = track;
		this.position = position;
		this.length = length;
		this.volume = volume;
		this.queue = queue;
		this.last = last;
		this.paused = paused;
	}

	public async NowPlayingEmbed(): Promise<EmbedBuilder> {
		const totalMs =
			Number(this.length) ||
			Number(this.track?.length) ||
			Number((this.track as any)?.info?.duration) ||
			Number((this.track as any)?.duration) ||
			0;
		const isSeekable =
			this.track?.isSeekable ??
			(this.track as any)?.info?.isSeekable ??
			!(this.track?.isStream || (this.track as any)?.info?.isStream);

		const trackLength = this.formatDuration(totalMs);
		const durationText = isSeekable && totalMs > 0
			? `:stopwatch: ${trackLength}`
			: `:red_circle: Live Stream`;

		const userAvatar = this.track?.requester?.avatar
			? `https://cdn.discordapp.com/avatars/${this.track.requester?.id}/${this.track.requester?.avatar}.png`
			: this.track?.requester?.defaultAvatarURL ??
			  'https://cdn.discordapp.com/embed/avatars/1.png';

		let embedColor: ColorResolvable;
		let sourceTxt: string;
		let sourceIcon: string;

		const source = this.track?.sourceName || (this.track as any)?.info?.sourceName || 'youtube';

		switch (source) {
			case 'vimeo': {
				sourceTxt = 'Vimeo';
				sourceIcon = 'https://i.imgur.com/npxyTWi.png';
				embedColor = '#1AB7EA';
				break;
			}
			case 'twitch': {
				sourceTxt = 'Twitch';
				sourceIcon =
					'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png';
				embedColor = '#6441A5';
				break;
			}
			case 'youtube': {
				sourceTxt = 'YouTube';
				sourceIcon =
					'https://www.youtube.com/s/desktop/acce624e/img/favicon_32x32.png';
				embedColor = '#FF0000';
				break;
			}
			default: {
				sourceTxt = 'Music Stream';
				sourceIcon = 'https://cdn.discordapp.com/embed/avatars/1.png';
				embedColor = '#5865F2';
				break;
			}
		}

		const vol = this.volume;
		let volumeIcon: string = ':speaker:';
		if (vol > 50) volumeIcon = ':loud_sound:';
		if (vol <= 50 && vol > 20) volumeIcon = ':sound:';

		const embedFieldData = [
			{
				name: 'Artist / Channel',
				value: this.track?.author || (this.track as any)?.info?.author || 'Unknown Artist',
				inline: true
			},
			{
				name: 'Duration',
				value: durationText,
				inline: true
			},
			{
				name: 'Volume',
				value: `${volumeIcon} ${this.volume}%`,
				inline: true
			}
		];

		if (this.queue?.length) {
			embedFieldData.push(
				{
					name: 'Queue Status',
					value: `:notes: ${this.queue.length} ${
						this.queue.length === 1 ? 'song' : 'songs'
					} remaining`,
					inline: true
				},
				{
					name: 'Up Next',
					value: `[${this.queue[0].title}](${this.queue[0].uri})`,
					inline: false
				}
			);
		}

		const embed = new EmbedBuilder()
			.setTitle(
				`${this.paused ? '⏸️ Paused:' : '▶️ Now Playing:'} ${this.track?.title || 'Unknown Track'}`
			)
			.setAuthor({
				name: sourceTxt,
				iconURL: sourceIcon
			})
			.setURL(this.track?.uri || null)
			.setThumbnail(this.track?.thumbnail || null)
			.setColor(embedColor)
			.addFields(embedFieldData)
			.setTimestamp(this.track?.added ?? Date.now())
			.setFooter({
				text: `Requested by ${this.track?.requester?.name || 'User'}`,
				iconURL: userAvatar
			});

		return embed;
	}

	private formatDuration(milliseconds: number): string {
		if (!milliseconds || isNaN(milliseconds) || milliseconds <= 0) return '0:00';
		const totalSeconds = Math.floor(milliseconds / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

		if (hours > 0) {
			const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
			return `${hours}:${paddedMinutes}:${paddedSeconds}`;
		}
		return `${minutes}:${paddedSeconds}`;
	}
}

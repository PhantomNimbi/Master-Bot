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
		const trackLength = this.timeString(
			this.millisecondsToTimeObject(this.length)
		);

		const durationText = this.track.isSeekable
			? `:stopwatch: ${trackLength}`
			: `:red_circle: Live Stream`;
		const userAvatar = this.track.requester?.avatar
			? `https://cdn.discordapp.com/avatars/${this.track.requester?.id}/${this.track.requester?.avatar}.png`
			: this.track.requester?.defaultAvatarURL ??
			  'https://cdn.discordapp.com/embed/avatars/1.png';

		let embedColor: ColorResolvable;
		let sourceTxt: string;
		let sourceIcon: string;

		switch (this.track.sourceName) {
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
				value: this.track.author || 'Unknown Artist',
				inline: true
			},
			{ name: 'Duration', value: durationText, inline: true },
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
				`${this.paused ? '⏸️ Paused:' : '▶️ Now Playing:'} ${this.track.title}`
			)
			.setAuthor({
				name: sourceTxt,
				iconURL: sourceIcon
			})
			.setURL(this.track.uri)
			.setThumbnail(this.track.thumbnail)
			.setColor(embedColor)
			.addFields(embedFieldData)
			.setTimestamp(this.track.added ?? Date.now())
			.setFooter({
				text: `Requested by ${this.track.requester?.name || 'User'}`,
				iconURL: userAvatar
			});

		return embed;
	}

	private timeString(timeObject: any) {
		if (timeObject[1] === true) return timeObject[0];
		return `${timeObject.hours ? timeObject.hours + ':' : ''}${
			timeObject.minutes ? timeObject.minutes : '00'
		}:${
			timeObject.seconds < 10
				? '0' + timeObject.seconds
				: timeObject.seconds
				? timeObject.seconds
				: '00'
		}`;
	}

	private millisecondsToTimeObject(milliseconds: number) {
		return {
			seconds: Math.floor((milliseconds / 1000) % 60),
			minutes: Math.floor((milliseconds / (1000 * 60)) % 60),
			hours: Math.floor((milliseconds / (1000 * 60 * 60)) % 24)
		};
	}
}

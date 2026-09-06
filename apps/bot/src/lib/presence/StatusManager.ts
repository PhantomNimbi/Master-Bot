import { ActivityType, type Client } from 'discord.js';
import Logger from '../logger.js';

interface StatusItem {
	text: string | ((client: Client) => string);
	type: ActivityType;
}

export class StatusManager {
	private static client: Client | null = null;
	private static interval: NodeJS.Timeout | null = null;
	private static currentIndex = 0;

	private static readonly statuses: StatusItem[] = [
		{
			text: '/help • /play',
			type: ActivityType.Listening
		},
		{
			text: client => {
				const serverCount = client.guilds.cache.size;
				return `/help | ${serverCount} server${serverCount === 1 ? '' : 's'}`;
			},
			type: ActivityType.Watching
		},
		{
			text: '/play • High-Fidelity Audio 🎵',
			type: ActivityType.Listening
		},
		{
			text: client => {
				const userCount = client.guilds.cache.reduce(
					(total, guild) => total + (guild.memberCount || 0),
					0
				);
				return `/reminder • ${userCount.toLocaleString()} members`;
			},
			type: ActivityType.Watching
		},
		{
			text: '/connect-four • /tic-tac-toe 🎮',
			type: ActivityType.Competing
		},
		{
			text: '/dashboard • Web Management 🌐',
			type: ActivityType.Playing
		}
	];

	public static start(client: Client, rotationIntervalSeconds = 25): void {
		this.client = client;
		if (this.interval) clearInterval(this.interval);

		// Set initial activity immediately
		this.updatePresence();

		// Schedule periodic rotation
		this.interval = setInterval(() => {
			this.updatePresence();
		}, rotationIntervalSeconds * 1000);

		Logger.info(
			`StatusManager initialized with ${this.statuses.length} rotating presence statuses (${rotationIntervalSeconds}s interval).`
		);
	}

	public static stop(): void {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
		this.client = null;
	}

	public static updatePresence(): void {
		if (!this.client?.user) return;

		try {
			// Check if any players are actively playing music
			const extendedClient = this.client as any;
			const players = extendedClient.music?.players;
			let activePlayingCount = 0;
			let currentTrackTitle: string | null = null;

			if (players && typeof players.values === 'function') {
				for (const player of players.values()) {
					if (player.playing && player.queue?.current) {
						activePlayingCount++;
						if (!currentTrackTitle) {
							currentTrackTitle = player.queue.current.info.title;
						}
					}
				}
			}

			// If music is actively playing in servers, occasionally feature music status
			if (
				activePlayingCount > 0 &&
				this.currentIndex % 2 === 0 &&
				currentTrackTitle
			) {
				const displayTitle =
					currentTrackTitle.length > 40
						? `${currentTrackTitle.slice(0, 37)}...`
						: currentTrackTitle;

				this.client.user.setPresence({
					status: 'online',
					activities: [
						{
							name: `🎵 ${displayTitle}`,
							type: ActivityType.Listening
						}
					]
				});
				this.currentIndex = (this.currentIndex + 1) % this.statuses.length;
				return;
			}

			const item = this.statuses[this.currentIndex];
			const text =
				typeof item.text === 'function' ? item.text(this.client) : item.text;

			this.client.user.setPresence({
				status: 'online',
				activities: [
					{
						name: text,
						type: item.type
					}
				]
			});

			this.currentIndex = (this.currentIndex + 1) % this.statuses.length;
		} catch (err) {
			Logger.error('StatusManager failed to update presence:', err);
		}
	}
}

import { SapphireClient } from '@sapphire/framework';
import '@sapphire/plugin-hmr/register';
import { QueueClient } from '../music/classes/QueueClient';
import Redis from 'ioredis';
import {
	IntentsBitField,
	NewsChannel,
	TextChannel,
	ThreadChannel
} from 'discord.js';
import { deletePlayerEmbed } from '../music/buttonsCollector';
import type { ClientTwitchExtension } from './../../lib/twitch/twitchAPI-types';
import { TwitchAPI } from '../twitch/twitchAPI';
import Logger from '../logger';
import type { TriviaSession } from '../music/classes/TriviaSession';

export class ExtendedClient extends SapphireClient {
	readonly music: QueueClient;
	leaveTimers: { [key: string]: NodeJS.Timeout };
	triviaSessions: Map<string, TriviaSession> = new Map();
	twitch: ClientTwitchExtension = {
		api: new TwitchAPI(
			process.env.TWITCH_CLIENT_ID,
			process.env.TWITCH_CLIENT_SECRET
		),
		auth: {
			access_token: '',
			refresh_token: '',
			expires_in: 0,
			token_type: '',
			scope: ['']
		},
		notifyList: {}
	};
	public constructor() {
		super({
			intents: [
				IntentsBitField.Flags.Guilds,
				IntentsBitField.Flags.GuildMembers,
				IntentsBitField.Flags.GuildMessages,
				IntentsBitField.Flags.GuildMessageReactions,
				IntentsBitField.Flags.GuildVoiceStates
			],
			logger: { level: 100 },
			loadMessageCommandListeners: true,
			hmr: {
				enabled: process.env.NODE_ENV === 'development'
			}
		});

		this.music = new QueueClient({
			redis: process.env.REDIS_URL
				? new Redis(process.env.REDIS_URL)
				: new Redis({
						host: process.env.REDIS_HOST || 'localhost',
						port: Number.parseInt(process.env.REDIS_PORT!) || 6379,
						password: process.env.REDIS_PASSWORD || '',
						db: Number.parseInt(process.env.REDIS_DB!) || 0
					}),
			node: {
				host:
					process.env.LAVA_HOST && process.env.LAVA_HOST !== '0.0.0.0'
						? process.env.LAVA_HOST
						: '127.0.0.1',
				authorization: process.env.LAVA_PASS || 'youshallnotpass',
				port: process.env.LAVA_PORT ? +process.env.LAVA_PORT : 2333,
				secure: process.env.LAVA_SECURE === 'true',
				id: 'main'
			},
			clientId: process.env.DISCORD_CLIENT_ID
		});

		this.on('raw', async (data: any) => {
			if (data.t === 'VOICE_STATE_UPDATE') {
				const d = data.d;
				if (!d.channel_id && d.user_id === this.application?.id) {
					const queue = this.music.queues.get(d.guild_id);
					if (queue) {
						await deletePlayerEmbed(queue);
						await queue.clear();
						await queue.destroyPlayer();
					}
				}
			}
			await this.music.sendRawData(data);
		});

		if (process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET) {
			this.twitch.api?.getAccessToken('user:read:email').then(response => {
				this.twitch.auth = {
					access_token: response.access_token,
					refresh_token: response.refresh_token,
					expires_in: response.expires_in,
					token_type: response.token_type,
					scope: response.scope
				};
			});

			setInterval(() => {
				this.twitch.api
					?.getAccessToken('user:read:email')
					.then(response => {
						this.twitch.auth = {
							access_token: response.access_token,
							refresh_token: response.refresh_token,
							expires_in: response.expires_in,
							token_type: response.token_type,
							scope: response.scope
						};
					})
					.catch(error => {
						Logger.error(error);
					});
			}, 4.32e7); // refresh every 12 hours
		} else {
			Logger.info('Twitch-Features are Disabled');
		}

		this.leaveTimers = {};
	}
}
export type MessageChannel = TextChannel | ThreadChannel | NewsChannel | null;

declare module '@sapphire/framework' {
	interface SapphireClient {
		readonly music: QueueClient;
		leaveTimers: { [key: string]: NodeJS.Timeout };
		triviaSessions: Map<string, TriviaSession>;
		twitch: ClientTwitchExtension;
	}
}

declare module 'lavalink-client' {
	interface Player {
		nightcore?: boolean;
		vaporwave?: boolean;
		karaoke?: boolean;
		bassboost?: boolean;
	}
}

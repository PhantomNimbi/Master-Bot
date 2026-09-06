import { setDatabasePath } from '@master-bot/db';
import { ExtendedClient } from './lib/structures/ExtendedClient.js';
import {
	getBotToken,
	getDbPath,
	isLavalinkEnabled,
	isTwitchEnabled
} from './env.js';
import { BotCallbackServer } from './server.js';
import {
	ApplicationCommandRegistries,
	Events,
	RegisterBehavior
} from '@sapphire/framework';
import { ReminderManager } from './lib/reminders/ReminderManager.js';
import { StatusManager } from './lib/presence/StatusManager.js';
import Logger from './lib/logger.js';
import { notify } from './lib/twitch/notifyChannels.js';
import { dataService } from './dataService.js';

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
	RegisterBehavior.Overwrite
);

const lavalinkEnabled = isLavalinkEnabled();

function registerClientEvents(client: ExtendedClient) {
	client.on(Events.ClientReady, async () => {
		if (!client.user) return;

if (lavalinkEnabled) {
			try {
				await client.music.init({
					id: client.user.id,
					username: client.user.username
				});
				Logger.info('Lavalink client initialized successfully.');
			} catch (err) {
				Logger.error('Failed to initialize Lavalink client: ', err);
			}
		} else {
			Logger.info(
				'Lavalink audio engine is currently disabled while music commands undergo upgrades.'
			);
		}

		// Initialize dynamic rotating presence status
		StatusManager.start(client);

		// Initialize Reminder Manager scheduler
		ReminderManager.start(client);

		const twitchEnabled = isTwitchEnabled();

		if (
			twitchEnabled &&
			process.env.TWITCH_CLIENT_ID &&
			process.env.TWITCH_CLIENT_SECRET
		) {
			const initTwitch = async () => {
				try {
					const notifyDB = await dataService.twitch.getAll();
					const query = notifyDB.notifications.map(user => {
						client.twitch.notifyList[user.twitchId] = {
							sendTo: user.channelIds,
							logo: user.logo,
							live: user.live,
							messageSent: user.sent,
							messageHandler: {}
						};
						return user.twitchId;
					});

					if (query.length > 0) {
						await notify(query);
					}

					setInterval(async () => {
						try {
							const newQuery = Object.keys(client.twitch.notifyList);
							if (newQuery.length > 0) {
								await notify(newQuery);
							}
						} catch (intervalErr) {
							Logger.error('Twitch notification polling error: ', intervalErr);
						}
					}, 60 * 1000);
				} catch (err) {
					Logger.error('Twitch database sync error: ', err);
				}
			};

			// If access token is already available, run immediately; otherwise wait briefly for auth
			if (client.twitch.auth.access_token) {
				void initTwitch();
			} else {
				setTimeout(() => void initTwitch(), 3000);
			}
		}
	});

	// Sapphire Framework Error Events
	client.on(Events.ChatInputCommandError, (error, payload) => {
		Logger.error(
			`Command Chat Input Error [${payload?.command?.name || 'unknown'}]: `,
			error
		);
	});

	client.on(Events.ContextMenuCommandError, (error, payload) => {
		Logger.error(
			`Command Context Menu Error [${payload?.command?.name || 'unknown'}]: `,
			error
		);
	});

	client.on(Events.CommandAutocompleteInteractionError, (error, payload) => {
		Logger.error(
			`Command Autocomplete Error [${payload?.command?.name || 'unknown'}]: `,
			error
		);
	});

	client.on(Events.CommandApplicationCommandRegistryError, (error, command) => {
		Logger.error(
			`Command Registry Error [${command?.name || 'unknown'}]: `,
			error
		);
	});

	client.on(Events.MessageCommandError, (error, payload) => {
		Logger.error(
			`Message Command Error [${payload?.command?.name || 'unknown'}]: `,
			error
		);
	});

	client.on(Events.InteractionHandlerError, (error, payload) => {
		Logger.error(
			`Interaction Handler Error [${payload?.handler?.name || 'unknown'}]: `,
			error
		);
	});

	client.on(Events.InteractionHandlerParseError, (error, payload) => {
		Logger.error(
			`Interaction Handler Parse Error [${payload?.handler?.name || 'unknown'}]: `,
			error
		);
	});

	client.on(Events.ListenerError, (error, payload) => {
		Logger.error(
			`Client Listener Error [${payload?.piece?.name || 'unknown'}]: `,
			error
		);
	});

	// Lavalink Node & Track Event Handlers (Gated behind lavalinkEnabled)
	if (lavalinkEnabled) {
		client.music.nodeManager.on('connect', node => {
			Logger.info(
				`Lavalink Node [${node?.id || 'main'}] connected successfully.`
			);
		});

		client.music.nodeManager.on('error', (node, err) => {
			const errMsg = String((err as any)?.message || err);
			if (errMsg.includes('ECONNREFUSED')) {
				Logger.warn(
					`Lavalink Node [${node?.id || 'main'}] initial connection pending (server starting up)...`
				);
			} else {
				Logger.error(`Lavalink Node Error [${node?.id || 'unknown'}]: `, err);
			}
		});

		client.music.on('trackError', async (player, track, payload) => {
			Logger.error(
				`Playback Error on Guild [${player.guildId}] for track "${track?.info?.title || 'Unknown'}": `,
				payload?.error || payload
			);
			const queue = client.music.queues.get(player.guildId);
			if (queue) {
				const channel = await queue.getTextChannel();
				if (channel) {
					await channel
						.send({
							content: `:x: Playback failed for [**${track?.info?.title || 'Track'}**](<${track?.info?.uri || ''}>). Skipping to next track...`,
							flags: ['SuppressEmbeds']
						})
						.catch(() => {});
				}
				await queue.next();
			}
		});

		client.music.on('trackStuck', async (player, track, payload) => {
			Logger.warn(
				`Track Stuck on Guild [${player.guildId}] for track "${track?.info?.title || 'Unknown'}": `,
				payload
			);
			const queue = client.music.queues.get(player.guildId);
			if (queue) {
				const channel = await queue.getTextChannel();
				if (channel) {
					await channel
						.send({
							content: `:warning: Track [**${track?.info?.title || 'Track'}**](<${track?.info?.uri || ''}>) became stuck. Skipping to next track...`,
							flags: ['SuppressEmbeds']
						})
						.catch(() => {});
				}
				await queue.next();
			}
		});

		const handleTrackCompletion = async (
			player: any,
			_track: any,
			payload: any
		) => {
			const reason = (payload?.reason || '').toLowerCase();
			if (reason === 'replaced' || reason === 'cleanup') return;

			const queue = client.music.queues.get(player.guildId);
			if (queue) {
				if (queue.skipped) {
					queue.skipped = false;
					return;
				}
				await queue.next();
			}
		};

		client.music.on('trackEnd', handleTrackCompletion);
	}
}

const main = async () => {
	setDatabasePath(getDbPath());

	let client = new ExtendedClient({ withPrivilegedIntents: true });
	registerClientEvents(client);

	try {
		await Promise.all([client.login(getBotToken()), new BotCallbackServer().start()]);
	} catch (error: any) {
		const errorStr = String(error?.message || error);
		if (
			errorStr.includes('DisallowedIntents') ||
			errorStr.includes('DISALLOWED_INTENTS') ||
			errorStr.includes('Privileged intent') ||
			error?.code === 'DisallowedIntents'
		) {
			Logger.warn(
				'Privileged Gateway Intent (GuildMembers) was disallowed by Discord Developer Portal. Automatically falling back to standard intents...'
			);
			client.destroy();
			client = new ExtendedClient({ withPrivilegedIntents: false });
			registerClientEvents(client);
			try {
				await Promise.all([client.login(getBotToken()), new BotCallbackServer().start()]);
				Logger.info(
					'Master-Bot successfully logged in with standard Gateway intents.'
				);
			} catch (fallbackError) {
				Logger.error('Bot failed fallback login: ', fallbackError);
				client.destroy();
				process.exit(1);
			}
		} else {
			Logger.error('Bot failed to login / errored out: ', error);
			client.destroy();
			process.exit(1);
		}
	}
};

void main();


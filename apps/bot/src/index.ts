import { ExtendedClient } from './lib/structures/ExtendedClient';
import { env } from './env';
import {
	ApplicationCommandRegistries,
	Events,
	RegisterBehavior
} from '@sapphire/framework';
import { ReminderManager } from './lib/reminders/ReminderManager';
import { StatusManager } from './lib/presence/StatusManager';
import { notify } from './lib/twitch/notifyChannels';
import { DEFAULT_WELCOME_MESSAGE, DEFAULT_TICKET_MESSAGE } from './lib/session/types';
import Logger from './lib/logger';

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
	RegisterBehavior.Overwrite
);

const client = new ExtendedClient();

const isLavalinkEnabled =
	(env.LAVA_ENABLED || process.env.LAVA_ENABLED)?.toLowerCase() === 'true';

client.on(Events.ClientReady, async () => {
	if (!client.user) return;

	if (isLavalinkEnabled) {
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

	// Publish guild data to Redis for dashboard live view
	// (the DB is only used for persistence across boots; dashboard reads live from Redis)
	if (client.music.queues.redis) {
		await Promise.all(
			Array.from(client.session.guilds.entries()).map(
				async ([guildId, guild]) => {
					try {
						await client.music.queues.redis.hset(
							'guilds',
							guildId,
							JSON.stringify({ name: guild.name, id: guild.id, icon: null })
						);
					} catch {}
				}
			)
		);
	}

	// Twitch notification setup
	const isTwitchEnabled =
		(env.TWITCH_ENABLED || process.env.TWITCH_ENABLED)?.toLowerCase() !==
		'false';

	if (
		isTwitchEnabled &&
		process.env.TWITCH_CLIENT_ID &&
		process.env.TWITCH_CLIENT_SECRET
	) {
		const initTwitch = async () => {
			try {
				const notifyDB = await client.session.getAllTwitchConfig();
				const query = notifyDB.notifications.map(user => {
					client.twitch.notifyList[user.twitchId] = {
						sendTo: user.channelIds,
						logo: user.logo ?? '',
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

// Lavalink Node & Track Event Handlers (Gated behind isLavalinkEnabled)
if (isLavalinkEnabled) {
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
		// In Lavalink, 'replaced' occurs when a new track is started explicitly (skip / new play)
		// 'cleanup' occurs when player is destroyed
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

const main = async () => {
	try {
		await client.session.init();
		await client.login(env.DISCORD_TOKEN);
	} catch (error) {
		Logger.error('Bot failed to login / errored out: ', error);
		client.destroy();
		process.exit(1);
	}

	// Sync all actual Discord guilds to DB/Redis on ready (fix missing guild rows)
	client.once('ready', async () => {
		try {
			for (const [gid, guild] of client.session.guilds.entries()) {
				try {
					await client.session.store.ensureGuildRow(guild);
				} catch {}
				if (client.music.queues?.redis) {
					await client.music.queues.redis.hset(
						'guilds', gid,
						JSON.stringify({ name: guild.name || 'Unknown', id: gid, icon: null })
					);
				}
			}
		} catch (e) {
			Logger.warn('Guild sync note: ' + (e instanceof Error ? e.message : String(e)));
		}
	});
};

void main();



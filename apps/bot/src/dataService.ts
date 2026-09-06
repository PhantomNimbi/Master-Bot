import { BotDatabase } from '@master-bot/db';
import type {
	Guild,
	Playlist,
	Reminder,
	Song,
	SongInput,
	TempChannel,
	Ticket,
	TwitchNotify,
	User
} from '@master-bot/db';

/**
 * In-process data service replacing the deleted tRPC client.
 *
 * Mirrors the router procedure I/O shapes 1:1 (see the deleted routers under
 * `packages/api/src/routers`) but resolves everything synchronously against
 * the shared `BotDatabase` SQLite singleton. No HTTP, no serialization.
 */
function parseStringArray(value: string | string[] | null | undefined): string[] {
	if (Array.isArray(value)) return value;
	try {
		const parsed = JSON.parse(value || '[]');
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

type ParsedTwitchNotify = Omit<TwitchNotify, 'channelIds'> & { channelIds: string[] };

function parseTwitchNotification(notification: TwitchNotify): ParsedTwitchNotify {
	return {
		...notification,
		channelIds: parseStringArray(notification.channelIds)
	};
}

export const dataService = {
	user: {
		async create(input: {
			id: string;
			name: string;
		}): Promise<{ user: User }> {
			const user = BotDatabase.getInstance().upsertUser(input.id, input.name);
			return { user };
		}
	},

	playlist: {
		async getPlaylist(input: {
			userId: string;
			name: string;
		}): Promise<{ playlist: (Playlist & { songs: Song[] }) | null }> {
			const playlist = BotDatabase.getInstance().getPlaylist(
				input.userId,
				input.name
			);
			return { playlist };
		},

		async getAll(input: {
			userId: string;
		}): Promise<{ playlists: (Playlist & { songs: Song[] })[] }> {
			const playlists = BotDatabase.getInstance().getAllPlaylists(input.userId);
			return { playlists };
		},

		async create(input: {
			userId: string;
			name: string;
		}): Promise<{ playlist: Playlist }> {
			const playlist = BotDatabase.getInstance().createPlaylist(
				input.userId,
				input.name
			);
			return { playlist };
		},

		async delete(input: {
			userId: string;
			name: string;
		}): Promise<{ playlist: { count: number } }> {
			const playlist = BotDatabase.getInstance().deletePlaylist(
				input.userId,
				input.name
			);
			return { playlist };
		}
	},

	song: {
		async createMany(input: {
			songs: SongInput[];
		}): Promise<{ songsCreated: { count: number } }> {
			const songsCreated = BotDatabase.getInstance().createSongs(input.songs);
			return { songsCreated };
		},

		async delete(input: { id: number }): Promise<{ song: Song | null }> {
			const song = BotDatabase.getInstance().deleteSong(input.id);
			return { song };
		}
	},

	guild: {
		async getGuild(input: { id: string }): Promise<{ guild: Guild | null }> {
			const guild = BotDatabase.getInstance().getGuild(input.id);
			return { guild };
		},

		async create(input: {
			id: string;
			ownerId: string;
			name: string;
		}): Promise<{ guild: Guild }> {
			const guild = BotDatabase.getInstance().upsertGuild(
				input.id,
				input.ownerId,
				input.name
			);
			return { guild };
		},

		async delete(input: { id: string }): Promise<{ guild: Guild | null }> {
			const guild = BotDatabase.getInstance().deleteGuild(input.id);
			return { guild };
		},

		async updateVolume(input: {
			guildId: string;
			volume: number;
		}): Promise<void> {
			BotDatabase.getInstance().updateGuildVolume(input.guildId, input.volume);
		},

		async setLogChannel(input: {
			guildId: string;
			channelId: string | null;
		}): Promise<{ guild: Guild | null }> {
			const guild = BotDatabase.getInstance().setGuildLogChannel(
				input.guildId,
				input.channelId
			);
			return { guild };
		},

		async toggleLogChannel(input: {
			guildId: string;
			status: boolean;
		}): Promise<{ guild: Guild | null }> {
			const guild = BotDatabase.getInstance().toggleGuildLogChannel(
				input.guildId,
				input.status
			);
			return { guild };
		}
	},

	hub: {
		async getTempChannel(input: {
			guildId: string;
			ownerId: string;
		}): Promise<{ tempChannel: TempChannel | null }> {
			const tempChannel = BotDatabase.getInstance().getTempChannel(
				input.guildId,
				input.ownerId
			);
			return { tempChannel };
		},

		async createTempChannel(input: {
			guildId: string;
			ownerId: string;
			channelId: string;
		}): Promise<{ tempChannel: TempChannel }> {
			const tempChannel = BotDatabase.getInstance().createTempChannel(
				input.guildId,
				input.ownerId,
				input.channelId
			);
			return { tempChannel };
		},

		async deleteTempChannel(input: {
			channelId: string;
		}): Promise<{ tempChannel: TempChannel | null }> {
			const tempChannel =
				BotDatabase.getInstance().deleteTempChannelByChannelId(input.channelId);
			return { tempChannel };
		}
	},

	twitch: {
		async getAll(): Promise<{
			notifications: ParsedTwitchNotify[];
		}> {
			const notifications =
				BotDatabase.getInstance()
					.getAllTwitchNotifications()
					.map(parseTwitchNotification);
			return { notifications };
		},

		async findUserById(input: {
			id: string;
		}): Promise<{
			notification: ParsedTwitchNotify | null;
		}> {
			const notification = BotDatabase.getInstance().getTwitchNotification(
				input.id
			);
			return {
				notification: notification
					? parseTwitchNotification(notification)
					: null
			};
		},

		async create(input: {
			userId: string;
			userImage: string;
			channelId: string;
			sendTo: string[];
		}): Promise<void> {
			BotDatabase.getInstance().upsertTwitchNotification(
				input.userId,
				input.userImage,
				input.sendTo,
				input.channelId
			);
		},

		async updateNotification(input: {
			userId: string;
			channelIds: string[];
		}): Promise<{
			notification: ParsedTwitchNotify | null;
		}> {
			const notification = BotDatabase.getInstance().updateTwitchNotification(
				input.userId,
				input.channelIds
			);
			return {
				notification: notification
					? parseTwitchNotification(notification)
					: null
			};
		},

		async delete(input: {
			userId: string;
		}): Promise<{ notification: TwitchNotify | null }> {
			const notification =
				BotDatabase.getInstance().deleteTwitchNotification(input.userId);
			return { notification };
		},

		async createViaTwitchNotification(input: {
			guildId: string;
			userId: string;
			ownerId: string;
			name: string;
			notifyList: string[];
		}): Promise<void> {
			BotDatabase.getInstance().upsertGuildFull(
				input.guildId,
				input.ownerId,
				input.name,
				input.notifyList
			);
		},

		async updateTwitchNotifications(input: {
			guildId: string;
			notifyList: string[];
		}): Promise<void> {
			const db = BotDatabase.getInstance();
			const guild = db.getGuild(input.guildId);
			if (guild) {
				db.upsertGuildFull(
					input.guildId,
					guild.ownerId,
					guild.name,
					input.notifyList
				);
			}
		},

		async updateNotificationStatus(input: {
			userId: string;
			live: boolean;
			sent: boolean;
		}): Promise<{
			notification: ParsedTwitchNotify | null;
		}> {
			const notification =
				BotDatabase.getInstance().updateTwitchNotificationStatus(
					input.userId,
					input.live,
					input.sent
				);
			return {
				notification: notification
					? parseTwitchNotification(notification)
					: null
			};
		}
	},

	command: {
		async getDisabledCommands(input: {
			guildId: string;
		}): Promise<{ disabledCommands: string[] }> {
			const guild = BotDatabase.getInstance().getGuild(input.guildId);
			return {
				disabledCommands: guild
					? parseStringArray(guild.disabledCommands)
					: []
			};
		}
	},

	tickets: {
		async getConfig(input: {
			guildId: string;
		}): Promise<{ guild: Guild | null; recentTickets: Ticket[] }> {
			const db = BotDatabase.getInstance();
			return {
				guild: db.getGuild(input.guildId),
				recentTickets: db.getRecentTickets(input.guildId, 10)
			};
		},

		async setChannel(input: {
			guildId: string;
			channelId: string | null;
		}): Promise<{ guild: Guild | null }> {
			const guild = BotDatabase.getInstance().setTicketChannel(
				input.guildId,
				input.channelId
			);
			return { guild };
		},

		async toggle(input: {
			guildId: string;
			status: boolean;
		}): Promise<{ guild: Guild | null }> {
			const guild = BotDatabase.getInstance().toggleTicket(
				input.guildId,
				input.status
			);
			return { guild };
		},

		async setTranscriptChannel(input: {
			guildId: string;
			channelId: string | null;
		}): Promise<{ guild: Guild | null }> {
			const guild = BotDatabase.getInstance().setTicketTranscriptChannel(
				input.guildId,
				input.channelId
			);
			return { guild };
		},

		async setRole(input: {
			guildId: string;
			roleId: string | null;
		}): Promise<{ guild: Guild | null }> {
			const guild = BotDatabase.getInstance().setTicketRole(
				input.guildId,
				input.roleId
			);
			return { guild };
		},

		async createTicket(input: {
			guildId: string;
			threadId: string;
			creatorId: string;
		}): Promise<{ ticket: Ticket }> {
			const ticket = BotDatabase.getInstance().createTicket(
				input.guildId,
				input.threadId,
				input.creatorId
			);
			return { ticket };
		},

		async closeTicket(input: {
			threadId: string;
		}): Promise<{ ticket: Ticket | null }> {
			const ticket = BotDatabase.getInstance().closeTicket(input.threadId);
			return { ticket };
		}
	},

	welcome: {
		async setChannel(input: {
			guildId: string;
			channelId: string;
		}): Promise<{ guild: Guild | null }> {
			const guild = BotDatabase.getInstance().setWelcomeChannel(
				input.guildId,
				input.channelId
			);
			return { guild };
		},

		async setMessage(input: {
			guildId: string;
			message: string;
		}): Promise<{ guild: Guild | null }> {
			const guild = BotDatabase.getInstance().setWelcomeMessage(
				input.guildId,
				input.message
			);
			return { guild };
		},

		async toggle(input: {
			guildId: string;
			status: boolean;
		}): Promise<{ guild: Guild | null }> {
			const guild = BotDatabase.getInstance().toggleWelcome(
				input.guildId,
				input.status
			);
			return { guild };
		}
	},

	reminder: {
		async getDueReminders(input: {
			beforeIsoDate: string;
		}): Promise<{ reminders: Reminder[] }> {
			const reminders = BotDatabase.getInstance().getDueReminders(
				input.beforeIsoDate
			);
			return { reminders };
		},

		async create(input: {
			userId: string;
			event: string;
			description: string | null;
			dateTime: string;
			repeat: string | null;
			timeOffset: number;
		}): Promise<{ reminder: Reminder }> {
			const reminder = BotDatabase.getInstance().createReminder(input);
			return { reminder };
		},

		async delete(input: {
			userId: string;
			event: string;
		}): Promise<{ reminder: { count: number } }> {
			const reminder = BotDatabase.getInstance().deleteRemindersByUserAndEvent(
				input.userId,
				input.event
			);
			return { reminder };
		},

		async getByUserId(input: {
			userId: string;
		}): Promise<{
			reminders: {
				id: number;
				event: string;
				dateTime: string;
				description: string | null;
			}[];
		}> {
			const reminders =
				BotDatabase.getInstance().getRemindersByUserIdSelect(input.userId);
			return { reminders };
		}
	}
};

export type DataService = typeof dataService;
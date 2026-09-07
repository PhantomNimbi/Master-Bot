export interface UserRecord {
	id: string;
	name: string;
	createdAt: Date;
	dbId?: string;
}

export interface SongRecord {
	id: number;
	length: number;
	track: string;
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
	playlistId: number;
}

export interface Playlist {
	id: number;
	name: string;
	userId: string;
	guildId: string;
	songs: SongRecord[];
}

export interface Reminder {
	id: number;
	createdAt: Date;
	repeat?: string | null;
	event: string;
	description: string;
	dateTime: string;
	userId: string;
	guildId: string;
	timeOffset: number;
}

export interface MemberRecord {
	guildId: string;
	userId: string;
	joinedAt: Date;
}

export interface Ticket {
	threadId: string;
	guildId: string;
	creatorId: string;
	createdAt: Date;
	closed: boolean;
}

export interface TempChannel {
	guildId: string;
	ownerId: string;
	id: string;
}

export interface TwitchNotification {
	userId: string;
	logo?: string;
	channelIds: string[];
	live: boolean;
	sent: boolean;
}

export interface GuildRecord {
	id: string;
	name: string;
	ownerId: string;
	volume: number;
	notifyList: string[];
	logEvents: string;
	disabledCommands: string[];
	logChannel?: string;
	logChannelEnabled: boolean;
	welcomeMessage: string;
	welcomeMessageChannel?: string;
	welcomeMessageEnabled: boolean;
	ticketChannel?: string;
	ticketTranscriptChannel?: string;
	ticketRoleId?: string;
	ticketEnabled: boolean;
	ticketMessage: string;
	hub?: string;
	hubChannel?: string;
}

export const DEFAULT_WELCOME_MESSAGE =
	'👋 Welcome {user} to **{server}**! You are member #{memberCount}.';
export const DEFAULT_TICKET_MESSAGE =
	'👋 Welcome to **{server}** Support!\n\n' +
	'Need assistance, have an inquiry, or want to speak with server staff?\n' +
	'• Please have any relevant screenshots, error logs, or details ready.\n' +
	'• A support representative or moderator will assist you shortly.\n\n' +
	'Click the **Open Ticket** button below to create your private support thread.';
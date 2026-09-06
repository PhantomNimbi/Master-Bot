export interface Account {
	id: string;
	userId: string;
	type: string;
	provider: string;
	providerAccountId: string;
	refresh_token: string | null;
	access_token: string | null;
	expires_at: number | null;
	token_type: string | null;
	scope: string | null;
	id_token: string | null;
	session_state: string | null;
}

export interface Session {
	id: string;
	sessionToken: string;
	userId: string;
	expires: string;
}

export interface User {
	id: string;
	name: string | null;
	discordId: string;
	email: string | null;
	emailVerified: string | null;
	image: string | null;
	timeOffset: number | null;
}

export interface VerificationToken {
	identifier: string;
	token: string;
	expires: string;
}

export interface Song {
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
	createdAt: string;
	name: string;
	userId: string | null;
	songs: Song[];
}

export interface Guild {
	id: string;
	name: string;
	added: string;
	volume: number;
	notifyList: string;
	ownerId: string;
	disabledCommands: string;
	logChannel: string | null;
	logChannelEnabled: boolean;
	logEvents: string;
	welcomeMessageChannel: string | null;
	welcomeMessage: string | null;
	welcomeMessageEnabled: boolean;
	ticketChannel: string | null;
	ticketTranscriptChannel: string | null;
	ticketRoleId: string | null;
	ticketEnabled: boolean;
	ticketMessage: string | null;
	ticketMessageEnabled: boolean;
	hub: string | null;
	hubChannel: string | null;
}

export interface Ticket {
	id: string;
	guildId: string;
	threadId: string;
	creatorId: string;
	closed: boolean;
	createdAt: string;
	closedAt: string | null;
}

export interface TempChannel {
	id: string;
	guildId: string;
	ownerId: string;
}

export interface TwitchNotify {
	twitchId: string;
	logo: string;
	live: boolean;
	channelIds: string;
	sent: boolean;
}

export interface Reminder {
	id: number;
	createdAt: string;
	repeat: string | null;
	event: string;
	description: string | null;
	dateTime: string;
	userId: string;
	timeOffset: number;
}

export interface SongInput {
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

import type {
	APIEmbedField,
	ColorResolvable,
	GuildMember,
	User
} from 'discord.js';

export const EmbedColors = {
	Brand: 0x5865f2, // Discord Blurple
	Success: 0x57f287, // Emerald Green
	Error: 0xed4245, // Crimson Red
	Warning: 0xfee75c, // Amber Yellow
	Info: 0x3498db, // Sky Blue
	Music: 0x9b59b6, // Amethyst Purple
	Twitch: 0x9146ff, // Twitch Purple
	Dark: 0x2b2d31, // Neutral Dark Card
	Light: 0xebeef0, // Off-white
	Gold: 0xf1c40f // Trophy Gold
} as const;

export type EmbedVariant =
	| 'brand'
	| 'success'
	| 'error'
	| 'warning'
	| 'info'
	| 'music'
	| 'twitch'
	| 'dark'
	| 'gold';

export interface EmbedAuthorOptions {
	name: string;
	iconURL?: string;
	url?: string;
}

export interface EmbedFooterOptions {
	text: string;
	iconURL?: string;
}

export interface BaseEmbedOptions {
	title?: string;
	description?: string;
	variant?: EmbedVariant;
	color?: ColorResolvable;
	fields?: (APIEmbedField | null | undefined | false)[];
	author?: EmbedAuthorOptions | User | GuildMember;
	footer?: EmbedFooterOptions | string;
	thumbnail?: string | null;
	image?: string | null;
	url?: string;
	timestamp?: Date | number | boolean;
	user?: User | GuildMember;
}

export interface CardEmbedOptions extends BaseEmbedOptions {
	category?: string;
	badge?: string;
}

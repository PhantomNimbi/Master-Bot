import type { User } from 'discord.js';

export interface GifTag {
	name: string;
	label: string;
	description: string;
	searchKeyword: string;
	targetSupported?: boolean;
	formatAction?: (user: User, target?: User | null) => string;
}

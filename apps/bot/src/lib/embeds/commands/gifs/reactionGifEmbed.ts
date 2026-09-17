import { EmbedBuilder, type GuildMember, type User } from 'discord.js';
import { EmbedHandler } from '../../embedHandler';

export interface ReactionGifEmbedOptions {
	actionDescription: string;
	gifUrl: string;
	user?: User | GuildMember;
}

export function createReactionGifEmbed(
	options: ReactionGifEmbedOptions
): EmbedBuilder {
	return EmbedHandler.media({
		description: options.actionDescription,
		image: options.gifUrl,
		user: options.user
	});
}

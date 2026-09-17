import { EmbedBuilder, type User } from 'discord.js';
import { EmbedHandler } from '../../embedHandler';

export interface QuoteEmbedOptions {
	title: string;
	quote: string;
	author?: string;
	category?: string;
	thumbnail?: string;
	user?: User;
}

export function createQuoteEmbed(options: QuoteEmbedOptions): EmbedBuilder {
	const description = options.author
		? `${EmbedHandler.quote(options.quote)}\n\n— **${options.author}**`
		: EmbedHandler.quote(options.quote);

	return EmbedHandler.create({
		title: options.title,
		description,
		variant: 'brand',
		thumbnail: options.thumbnail,
		user: options.user
	});
}

export function createEightBallEmbed(
	question: string,
	answer: string,
	user?: User
): EmbedBuilder {
	return EmbedHandler.create({
		title: '🎱 Magic 8-Ball',
		variant: 'brand',
		fields: [
			EmbedHandler.field('❓ Question', question, false),
			EmbedHandler.field('🔮 Prediction', `**${answer}**`, false)
		],
		user
	});
}

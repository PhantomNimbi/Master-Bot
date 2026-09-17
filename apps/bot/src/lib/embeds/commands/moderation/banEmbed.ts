import { EmbedBuilder, type User } from 'discord.js';
import { EmbedHandler } from '../../embedHandler';

export interface BanEmbedOptions {
	targetUser: User;
	moderator: User;
	reason?: string;
}

export function createBanEmbed(options: BanEmbedOptions): EmbedBuilder {
	const targetTag = options.targetUser.tag ?? options.targetUser.username;
	const modTag = options.moderator.tag ?? options.moderator.username;

	return EmbedHandler.create({
		title: '🔨 Member Banned',
		variant: 'error',
		thumbnail: options.targetUser.displayAvatarURL(),
		fields: [
			EmbedHandler.field(
				'👤 Target Member',
				`${targetTag} (<@${options.targetUser.id}>)`,
				true
			),
			EmbedHandler.field(
				'🛡️ Moderator',
				`${modTag} (<@${options.moderator.id}>)`,
				true
			),
			EmbedHandler.field(
				'📝 Reason',
				options.reason || '*No reason provided*',
				false
			)
		],
		footer: `User ID: ${options.targetUser.id}`,
		timestamp: true
	});
}

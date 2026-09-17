import { EmbedBuilder, type User } from 'discord.js';
import { EmbedHandler } from '../../embedHandler';

export interface KickEmbedOptions {
	targetUser: User;
	moderator: User;
	reason?: string;
}

export function createKickEmbed(options: KickEmbedOptions): EmbedBuilder {
	const targetTag = options.targetUser.tag ?? options.targetUser.username;
	const modTag = options.moderator.tag ?? options.moderator.username;

	return EmbedHandler.create({
		title: '👢 Member Kicked',
		variant: 'warning',
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

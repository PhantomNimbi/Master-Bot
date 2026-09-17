import { EmbedBuilder, type User } from 'discord.js';
import { EmbedHandler } from '../../embedHandler';

export interface TimeoutEmbedOptions {
	targetUser: User;
	moderator: User;
	durationSeconds: number;
	reason?: string;
}

export function createTimeoutEmbed(options: TimeoutEmbedOptions): EmbedBuilder {
	const targetTag = options.targetUser.tag ?? options.targetUser.username;
	const modTag = options.moderator.tag ?? options.moderator.username;
	const isRemoved = options.durationSeconds === 0;

	return EmbedHandler.create({
		title: isRemoved ? '🔊 Timeout Removed' : '🔇 Member Timed Out',
		variant: isRemoved ? 'success' : 'warning',
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
				'⏳ Duration',
				isRemoved
					? '**Removed**'
					: EmbedHandler.timestamp(
							Date.now() + options.durationSeconds * 1000,
							'R'
						),
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

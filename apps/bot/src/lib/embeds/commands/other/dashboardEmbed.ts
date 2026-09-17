import { EmbedBuilder, type User } from 'discord.js';
import { EmbedHandler } from '../../embedHandler';

export interface DashboardEmbedOptions {
	publicUrl?: string;
	internalUrl?: string;
	user: User;
	isOwner?: boolean;
}

export function createDashboardEmbed(
	options: DashboardEmbedOptions
): EmbedBuilder {
	const fields = [];

	if (options.publicUrl) {
		fields.push(
			EmbedHandler.field(
				'🔗 Public Dashboard',
				`[Click here to open the dashboard](${options.publicUrl})`,
				false
			)
		);
	}

	if (options.internalUrl && options.isOwner) {
		fields.push(
			EmbedHandler.field(
				'🏠 Internal Link (Owner)',
				`[Open internal dashboard](${options.internalUrl})`,
				false
			)
		);
	}

	return EmbedHandler.create({
		title: '🌐 Web Dashboard',
		description:
			'> Manage your server settings, view audit logs, and more through the web dashboard.',
		variant: 'brand',
		fields,
		user: options.user
	});
}

export function createDashboardUnavailableEmbed(user: User): EmbedBuilder {
	return EmbedHandler.warning({
		title: 'Dashboard Unavailable',
		description:
			'The web dashboard is not currently configured for this bot instance.',
		user
	});
}

import type { Client, User } from 'discord.js';
import Logger from '../logger';

/**
 * Fetches the Discord Application Owner to restrict sensitive administrative commands.
 */
export async function getApplicationOwnerUser(
	client: Client
): Promise<User | null> {
	try {
		await client.application?.fetch();
		const app = client.application;
		if (!app || !app.owner) return null;

		let ownerId: string | null = null;
		if ('ownerId' in app.owner && app.owner.ownerId) {
			ownerId = app.owner.ownerId as string;
		} else if ('id' in app.owner && app.owner.id) {
			ownerId = app.owner.id;
		}

		if (ownerId) {
			return await client.users.fetch(ownerId).catch(() => null);
		}
	} catch (err) {
		Logger.error(`Failed to fetch application owner user: ${err}`);
	}
	return null;
}

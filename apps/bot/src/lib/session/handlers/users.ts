import type { UserRecord } from '../types';
import type { SessionStore } from '../SessionStore';

export function createUsersHandlers(store: SessionStore) {
	return {
		create: (input: { id: string; name: string }): UserRecord => {
			const existing = store.usersMap.get(input.id);
			if (existing) return existing;
			const user: UserRecord = {
				id: input.id,
				name: input.name,
				createdAt: new Date()
			};
			store.usersMap.set(input.id, user);
			store.persist(async () => {
				const created = await store.db.user.upsert({
					where: { discordId: input.id },
					create: { discordId: input.id, name: input.name },
					update: { name: input.name }
				});
				user.dbId = created.id;
			});
			return user;
		}
	};
}
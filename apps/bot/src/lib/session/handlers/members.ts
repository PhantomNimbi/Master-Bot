import type { MemberRecord } from '../types';
import type { SessionStore } from '../SessionStore';

export function createMembersHandlers(store: SessionStore) {
	return {
		create: (input: { guildId: string; userId: string }): MemberRecord => {
			const key = store.memberKey(input.guildId, input.userId);
			const existing = store.membersMap.get(key);
			if (existing) return existing;
			const member: MemberRecord = {
				guildId: input.guildId,
				userId: input.userId,
				joinedAt: new Date()
			};
			store.membersMap.set(key, member);
			store.persist(async () => {
				const guild = store.getOrCreateGuild(input.guildId);
				await store.ensureGuildRow(guild);
				await store.getUserDbId(input.userId);
				await store.db.guildMember.upsert({
					where: {
						guildId_userId: {
							guildId: input.guildId,
							userId: input.userId
						}
					},
					create: {
						guildId: input.guildId,
						userId: input.userId
					},
					update: {}
				});
			});
			return member;
		},
		delete: (input: { guildId: string; userId: string }): boolean => {
			const deleted = store.membersMap.delete(
				store.memberKey(input.guildId, input.userId)
			);
			if (deleted) {
				store.persist(async () => {
					try {
						await store.db.guildMember.delete({
							where: {
								guildId_userId: {
									guildId: input.guildId,
									userId: input.userId
								}
							}
						});
					} catch {
						// row may not exist yet; deletes are best-effort
					}
				});
			}
			return deleted;
		}
	};
}
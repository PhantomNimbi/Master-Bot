import type { SessionStore } from '../SessionStore';

export function createCommandsHandlers(store: SessionStore) {
	return {
		getDisabledCommands: (input: {
			guildId: string;
		}): { disabledCommands: string[] } => {
			const guild = store.guilds.get(input.guildId);
			return { disabledCommands: guild?.disabledCommands || [] };
		}
	};
}
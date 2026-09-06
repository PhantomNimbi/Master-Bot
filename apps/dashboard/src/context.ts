export interface DashboardGuildInfo {
	id: string;
	name: string;
	icon: string | null;
	ownerId: string;
	memberCount: number;
	channelMap: Record<string, string>;
	settings: Record<string, any>;
}

export interface DashboardBotState {
	isReady: boolean;
	gatewayLatency: number;
	guilds: DashboardGuildInfo[];
}

/**
 * Context injected by the Master-Bot process so the dashboard can reach the
 * live Discord client and shared database without importing @master-bot/bot
 * (which would create a circular package dependency).
 */
export interface DashboardContext {
	/** Live snapshot of the connected Discord bot client. */
	getBotState(): DashboardBotState;
	/** Send a plain message to any guild channel the bot can see. */
	sendChannelMessage(channelId: string, message: string): Promise<boolean>;
	/** The bot's current gateway latency in milliseconds. */
	getGatewayLatency(): number;
	/** Whether the requesting user is the configured bot owner. */
	isOwner(userId?: string): boolean;
}

export type { DashboardGuildInfo as LiveGuildInfo };
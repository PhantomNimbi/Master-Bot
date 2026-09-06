import http from 'node:http';
import { BotDatabase } from '@master-bot/db';
import type { DashboardContext } from '../context.js';
import { getNextAuthConfig } from '../auth/config.js';
import {
	getBotToken,
	getCallbackUrl,
	getClientId,
	getInviteUrl
} from './env.js';

export function handleDashboardStats(
	req: http.IncomingMessage,
	res: http.ServerResponse,
	ctx: DashboardContext
): void {
	const db = BotDatabase.getInstance();
	const stats = db.getStats();
	const botState = ctx.getBotState();

	const data = {
		bot: {
			status: getBotToken() ? (botState.isReady ? 'online' : 'configured') : 'unconfigured',
			isReady: botState.isReady,
			gatewayLatencyMs: ctx.getGatewayLatency(),
			clientId: getClientId() || null,
			guildCount: botState.guilds.length,
			callbackUrl: getCallbackUrl(),
			inviteUrl: getInviteUrl(),
			version: '1.0.0',
			uptimeSeconds: Math.floor(process.uptime()),
			connectedGuilds: botState.guilds.map(g => ({ id: g.id, name: g.name, icon: g.icon }))
		},
		database: {
			...stats,
			directConnection: true,
			latencyMs: 0 // In-process SQLite has 0 network latency
		},
		auth: {
			enabled: Boolean(getNextAuthConfig().clientId),
			url: getNextAuthConfig().url
		}
	};

	res.writeHead(200, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify(data));
}
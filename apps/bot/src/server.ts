import http from 'node:http';
import { URL } from 'node:url';
import pc from 'picocolors';
import {
	routeDashboardRequest,
	setDashboardContext,
	type DashboardContext,
	type DashboardGuildInfo,
	type DashboardBotState
} from '@master-bot/dashboard';
import { getCallbackUrl, getPort, normalizeCallbackBaseUrl, getOwnerId } from './env.js';
import Logger from './lib/logger.js';
import { container } from '@sapphire/framework';

export interface BotServerOptions {
	callbackUrl?: string;
}

export class BotCallbackServer {
	private server: http.Server | null = null;
	private port: number;
	private baseUrl: string;

	constructor(options: BotServerOptions = {}) {
		this.baseUrl = normalizeCallbackBaseUrl(options.callbackUrl || getCallbackUrl());
		this.port = getPort();
	}

	public start(): Promise<void> {
		this.registerContext();

		return new Promise((resolve, reject) => {
			this.server = http.createServer(async (req, res) => {
				// First try routing to Dashboard, NextAuth & API endpoints
				const dashboardHandled = await routeDashboardRequest(req, res, this.baseUrl);
				if (dashboardHandled) return;

				const reqUrl = req.url || '/';
				const parsed = new URL(reqUrl, `http://localhost:${this.port}`);

				if (parsed.pathname === '/api/health' || parsed.pathname === '/health') {
					res.writeHead(200, { 'Content-Type': 'application/json' });
					res.end(
						JSON.stringify({
							status: 'ok',
							service: 'master-bot',
							timestamp: new Date().toISOString()
						})
					);
					return;
				}

				res.writeHead(200, { 'Content-Type': 'text/plain' });
				res.end('Master-Bot Callback Server is running.');
			});

			this.server.on('error', (err) => {
				Logger.warn(`Callback server warning: ${err.message}`);
				resolve(); // Continue even if port is already occupied
			});

			this.server.listen(this.port, '0.0.0.0', () => {
				const callbackEndpoint = `${this.baseUrl.replace(/\/$/, '')}/api/auth/callback/discord`;
				const dashboardEndpoint = `${this.baseUrl.replace(/\/$/, '')}/dashboard`;
				Logger.info(`OAuth2 Callback Server listening at: ${pc.cyan(callbackEndpoint)}`);
				Logger.info(`Discord Bot Dashboard running at: ${pc.bold(pc.cyan(dashboardEndpoint))}`);
				resolve();
			});
		});
	}

	public stop(): Promise<void> {
		return new Promise((resolve) => {
			if (this.server) {
				this.server.close(() => resolve());
			} else {
				resolve();
			}
		});
	}

	/**
	 * Injects the runtime context the dashboard needs to reach the live client
	 * and the shared sqlite database — HELIX keeps these in one package;
	 * Master-Bot passes them across the @master-bot/bot / @master-bot/dashboard
	 * package boundary.
	 */
	private registerContext(): void {
		const ctx: DashboardContext = {
			getBotState: (): DashboardBotState => {
				const client = container.client;
				const isReady = client?.isReady() ?? false;
				const gatewayLatency = client?.ws.ping ?? -1;
				const guilds: DashboardGuildInfo[] = client
					? [...client.guilds.cache.values()].map(g => ({
							id: g.id,
							name: g.name,
							icon: g.icon,
							ownerId: g.ownerId,
							memberCount: g.memberCount,
							channelMap: {},
							settings: {}
						}))
					: [];
				return { isReady, gatewayLatency, guilds };
			},
			sendChannelMessage: async (channelId, message) => {
				try {
					const client = container.client;
					if (!client) return false;
					const ch = await client.channels.fetch(channelId);
					if (ch && ch.isTextBased() && !ch.isDMBased()) {
						await (ch as any).send(message);
						return true;
					}
					return false;
				} catch {
					return false;
				}
			},
			getGatewayLatency: () => container.client?.ws.ping ?? -1,
			isOwner: (userId?: string) => {
				if (!userId) return false;
				const ownerId = getOwnerId();
				if (ownerId) return userId === ownerId;
				const appOwner = container.client?.application?.owner;
				return appOwner ? userId === appOwner.id : false;
			}
		};
		setDashboardContext(ctx);
	}
}
import http from 'node:http';
import { BotDatabase } from '@master-bot/db';
import type { DashboardContext } from '../context.js';

export async function handleDashboardGuilds(
	req: http.IncomingMessage,
	res: http.ServerResponse,
	ctx: DashboardContext
): Promise<void> {
	const db = BotDatabase.getInstance();

	if (req.method === 'GET') {
		const botState = ctx.getBotState();
		const guildSettings: Record<string, Record<string, any>> = {};
		for (const g of botState.guilds) {
			const guild = db.getGuild(g.id);
			guildSettings[g.id] = guild || {};
		}

		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(
			JSON.stringify({
				liveGuilds: botState.guilds,
				guildSettings,
				guildCount: botState.guilds.length
			})
		);
		return;
	}

	if (req.method === 'POST') {
		let body = '';
		req.on('data', chunk => (body += chunk));
		req.on('end', () => {
			try {
				const payload = JSON.parse(body || '{}');
				const guildId = payload.guildId as string;
				if (!guildId) {
					res.writeHead(400, { 'Content-Type': 'application/json' });
					res.end(JSON.stringify({ error: 'guildId is required' }));
					return;
				}

				const existing = db.getGuild(guildId);
				if (!existing) {
					const live = ctx.getBotState().guilds.find(g => g.id === guildId);
					db.upsertGuild(guildId, live?.ownerId || '', live?.name || guildId);
				}

				if (payload.welcomeMessage !== undefined) {
					db.setWelcomeMessage(guildId, String(payload.welcomeMessage));
				}
				if (payload.welcomeChannel !== undefined) {
					db.setWelcomeChannel(guildId, String(payload.welcomeChannel));
				}
				if (payload.welcomeEnabled !== undefined) {
					db.toggleWelcome(guildId, Boolean(payload.welcomeEnabled));
				}
				if (payload.ticketChannel !== undefined) {
					db.setTicketChannel(guildId, String(payload.ticketChannel));
				}
				if (payload.ticketTranscriptChannel !== undefined) {
					db.setTicketTranscriptChannel(guildId, String(payload.ticketTranscriptChannel));
				}
				if (payload.ticketRole !== undefined) {
					db.setTicketRole(guildId, String(payload.ticketRole));
				}
				if (payload.ticketEnabled !== undefined) {
					db.toggleTicket(guildId, Boolean(payload.ticketEnabled));
				}
				if (payload.logChannel !== undefined) {
					db.setGuildLogChannel(guildId, String(payload.logChannel));
				}
				if (payload.volume !== undefined) {
					db.updateGuildVolume(guildId, Number(payload.volume));
				}

				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ success: true, guildId, message: 'Settings saved' }));
			} catch (err: any) {
				res.writeHead(400, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ error: err.message || 'Invalid payload' }));
			}
		});
		return;
	}

	res.writeHead(405, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify({ error: 'Method not allowed' }));
}
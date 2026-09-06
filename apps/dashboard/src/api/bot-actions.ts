import http from 'node:http';
import type { DashboardContext } from '../context.js';

export async function handleDashboardBotActions(
	req: http.IncomingMessage,
	res: http.ServerResponse,
	action: string,
	ctx: DashboardContext
): Promise<void> {
	if (action === 'broadcast' && req.method === 'POST') {
		let body = '';
		req.on('data', chunk => (body += chunk));
		req.on('end', async () => {
			try {
				const payload = JSON.parse(body || '{}');
				const channelId = String(payload.channelId || '').trim();
				const message = String(payload.message || '').trim();

				if (!channelId || !message) {
					res.writeHead(400, { 'Content-Type': 'application/json' });
					res.end(JSON.stringify({ error: 'channelId and message are required' }));
					return;
				}

				const botState = ctx.getBotState();
				if (!botState.isReady) {
					res.writeHead(503, { 'Content-Type': 'application/json' });
					res.end(JSON.stringify({ error: 'Discord bot is not currently connected to gateway' }));
					return;
				}

				const sent = await ctx.sendChannelMessage(channelId, message);
				if (sent) {
					res.writeHead(200, { 'Content-Type': 'application/json' });
					res.end(JSON.stringify({ success: true, channelId, message: 'Message broadcast successfully' }));
				} else {
					res.writeHead(400, { 'Content-Type': 'application/json' });
					res.end(JSON.stringify({ error: 'Failed to send message to specified channel. Check permissions and channel ID.' }));
				}
			} catch (err: any) {
				res.writeHead(500, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ error: err.message || 'Broadcast failed' }));
			}
		});
		return;
	}

	res.writeHead(404, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify({ error: `Unknown bot action: ${action}` }));
}
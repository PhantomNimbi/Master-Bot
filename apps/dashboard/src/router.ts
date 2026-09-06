import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { URL } from 'node:url';
import { handleNextAuth } from './auth/handlers.js';
import { handleDashboardStats } from './api/stats.js';
import { handleDashboardGuilds } from './api/guilds.js';
import { handleDashboardBotActions } from './api/bot-actions.js';
import { renderDashboardHtml } from './ui/html.js';
import type { DashboardContext } from './context.js';
import { getClientId } from './api/env.js';
import { getDashboardBaseUrl } from './auth/config.js';

let _ctx: DashboardContext | null = null;

/**
 * Registers the bot-injected runtime context. Must be called once by the
 * hosting Master-Bot process before routing begins.
 */
export function setDashboardContext(ctx: DashboardContext): void {
	_ctx = ctx;
}

export function getDashboardContext(): DashboardContext {
	if (!_ctx) {
		throw new Error('DashboardContext has not been registered. Call setDashboardContext() first.');
	}
	return _ctx;
}

function renderMissingClientIdPage(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Discord Bot Setup Needed</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0b0f19] text-white flex items-center justify-center min-h-screen font-sans p-6">
  <div class="max-w-md w-full bg-gray-900/90 border border-gray-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl backdrop-blur-xl">
    <div class="text-4xl">🤖</div>
    <h2 class="text-xl font-bold text-cyan-400">Discord Client ID Needed</h2>
    <p class="text-sm text-gray-400">Please configure <code class="text-cyan-300 bg-gray-800 px-2 py-0.5 rounded font-mono">DISCORD_CLIENT_ID</code> in your environment variables before inviting the bot.</p>
    <a href="/dashboard" class="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/30">Back to Dashboard</a>
  </div>
</body>
</html>`;
}

export async function routeDashboardRequest(
	req: http.IncomingMessage,
	res: http.ServerResponse,
	baseUrl: string = 'http://localhost:3000'
): Promise<boolean> {
	const reqUrl = req.url || '/';
	const parsed = new URL(reqUrl, baseUrl);
	const pathname = parsed.pathname;
	const ctx = getDashboardContext();
	const resolvedBase = getDashboardBaseUrl() || baseUrl;

	// 1. Dashboard UI Shell
	if (pathname === '/dashboard' || pathname === '/') {
		res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
		res.end(renderDashboardHtml());
		return true;
	}

	// 2. Bot Invite Redirect Endpoint ({CALLBACK_URL}/invite)
	if (pathname === '/invite' || pathname === '/api/bot/invite') {
		const clientId = parsed.searchParams.get('client_id') || getClientId();
		const permissions = parsed.searchParams.get('permissions') || '8';
		const scope = parsed.searchParams.get('scope') || 'bot applications.commands';
		const explicitRedirect = parsed.searchParams.get('redirect_uri');

		if (!clientId) {
			res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
			res.end(renderMissingClientIdPage());
			return true;
		}

		let discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=${encodeURIComponent(scope)}`;
		if (explicitRedirect) {
			discordAuthUrl += `&redirect_uri=${encodeURIComponent(explicitRedirect)}&response_type=code`;
		}
		res.writeHead(302, { Location: discordAuthUrl });
		res.end();
		return true;
	}

	// 3. NextAuth-compatible API Endpoints
	if (pathname.startsWith('/api/auth/')) {
		const handled = await handleNextAuth(req, res, pathname, parsed.searchParams, resolvedBase);
		if (handled) return true;
	}

	// 4. Direct Dashboard API Endpoints
	if (pathname === '/api/dashboard/stats') {
		handleDashboardStats(req, res, ctx);
		return true;
	}

	if (pathname === '/api/dashboard/guilds') {
		await handleDashboardGuilds(req, res, ctx);
		return true;
	}

	// 5. Direct Zero-Lag Bot Actions (Broadcast)
	if (pathname.startsWith('/api/dashboard/bot/')) {
		const action = pathname.replace('/api/dashboard/bot/', '');
		await handleDashboardBotActions(req, res, action, ctx);
		return true;
	}

	// 6. Bot & Dashboard Icon Endpoint
	if (pathname === '/icon.jpg' || pathname === '/favicon.ico' || pathname === '/api/bot/icon') {
		const iconCandidates = [
			path.resolve(process.cwd(), 'icon.jpg'),
			path.resolve(process.cwd(), '..', 'icon.jpg')
		];
		for (const iconPath of iconCandidates) {
			if (fs.existsSync(iconPath)) {
				const imageBuffer = fs.readFileSync(iconPath);
				res.writeHead(200, {
					'Content-Type': 'image/jpeg',
					'Content-Length': imageBuffer.length,
					'Cache-Control': 'public, max-age=86400'
				});
				res.end(imageBuffer);
				return true;
			}
		}
	}

	return false;
}
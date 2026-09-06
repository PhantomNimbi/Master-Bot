import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import http, { createServer, type Server } from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
	routeDashboardRequest,
	setDashboardContext
} from '@master-bot/dashboard';
import type { DashboardContext } from '@master-bot/dashboard';
import { setDatabasePath, BotDatabase } from '@master-bot/db';

function mockContext(): DashboardContext {
	return {
		getBotState: () => ({
			isReady: true,
			gatewayLatency: 42,
			guilds: []
		}),
		sendChannelMessage: async () => true,
		getGatewayLatency: () => 42,
		isOwner: (userId?: string) => userId === 'owner-123'
	};
}

function request(
	url: string
): Promise<{
	status: number;
	headers: http.IncomingHttpHeaders;
	body: string;
}> {
	return new Promise((resolve, reject) => {
		const req = http.get(url, res => {
			const chunks: Buffer[] = [];
			res.on('data', (c: Buffer) => chunks.push(c));
			res.on('end', () =>
				resolve({
					status: res.statusCode ?? 0,
					headers: res.headers,
					body: Buffer.concat(chunks.map(c => new Uint8Array(c))).toString(
					'utf8'
				)
				})
			);
		});
		req.on('error', reject);
	});
}

describe('Dashboard HTTP API Integration', () => {
	let server: Server;
	let baseUrl: string;
	let tempDir: string;

	beforeAll(async () => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'master-bot-dash-'));
		setDatabasePath(path.join(tempDir, 'dashboard.sqlite'));
		setDashboardContext(mockContext());

		server = createServer((req, res) => {
			routeDashboardRequest(req, res, `http://${req.headers.host}`)
				.then(handled => {
					if (!handled) {
						res.writeHead(404, { 'Content-Type': 'text/plain' });
						res.end('Not Found');
					}
				})
				.catch(() => {
					res.writeHead(500, { 'Content-Type': 'text/plain' });
					res.end('Internal Server Error');
				});
		});

		await new Promise<void>(resolve => server.listen(0, resolve));
		const addr = server.address();
		if (!addr || typeof addr === 'string') {
			throw new Error('Failed to bind test server');
		}
		baseUrl = `http://127.0.0.1:${addr.port}`;
	});

	afterAll(async () => {
		await new Promise<void>(resolve => server.close(() => resolve()));
		BotDatabase.resetInstance();
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	it('serves the dashboard shell at the root', async () => {
		const { status, headers } = await request(`${baseUrl}/`);
		expect(status).toBe(200);
		expect(String(headers['content-type'])).toContain('text/html');
	});

	it('redirects to the Discord authorization endpoint with a client id', async () => {
		const { status, headers } = await request(`${baseUrl}/invite?client_id=12345`);
		expect(status).toBe(302);
		expect(String(headers.location)).toContain('discord.com/oauth2/authorize');
	});

	it('renders a setup page when no client id is configured', async () => {
		delete process.env.DISCORD_CLIENT_ID;
		delete process.env.CLIENT_ID;
		delete process.env.DISCORD_APP_ID;
		delete process.env.APPLICATION_ID;
		delete process.env.APP_ID;
		const { status, headers } = await request(`${baseUrl}/invite`);
		expect(status).toBe(200);
		expect(String(headers['content-type'])).toContain('text/html');
	});

	it('serves stats as JSON without requiring a session', async () => {
		const { status, headers, body } = await request(`${baseUrl}/api/dashboard/stats`);
		expect(status).toBe(200);
		expect(String(headers['content-type'])).toContain('application/json');
		const parsed = JSON.parse(body);
		expect(parsed).toHaveProperty('bot');
		expect(parsed).toHaveProperty('database');
	});
});
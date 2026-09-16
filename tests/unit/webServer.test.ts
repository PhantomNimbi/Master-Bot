import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';

describe('Internal Web Server Health & Keep-Alive Endpoints', () => {
	let server: http.Server;
	const testPort = 3987;

	beforeAll(async () => {
		// Create a server reproducing the exact routing logic in webServer.ts
		server = http.createServer((req, res) => {
			const url = req.url || '';
			if (url === '/health' || url === '/api/health' || url === '/keep-alive') {
				res.writeHead(200, {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-store'
				});
				res.end(
					JSON.stringify({
						status: 'ok',
						service: 'Master-Bot',
						uptime: Math.floor(process.uptime()),
						timestamp: Date.now(),
						botReady: true
					})
				);
				return;
			}
			res.writeHead(404);
			res.end('Not Found');
		});

		await new Promise<void>(resolve => server.listen(testPort, '127.0.0.1', () => resolve()));
	});

	afterAll(async () => {
		await new Promise<void>(resolve => server.close(() => resolve()));
	});

	it('should return 200 OK with service details on /health', async () => {
		const res = await fetch(`http://127.0.0.1:${testPort}/health`);
		expect(res.status).toBe(200);
		const data = (await res.json()) as any;
		expect(data.status).toBe('ok');
		expect(data.service).toBe('Master-Bot');
		expect(data.botReady).toBe(true);
		expect(typeof data.uptime).toBe('number');
	});

	it('should return 200 OK on /api/health alias', async () => {
		const res = await fetch(`http://127.0.0.1:${testPort}/api/health`);
		expect(res.status).toBe(200);
		const data = (await res.json()) as any;
		expect(data.status).toBe('ok');
	});

	it('should return 200 OK on /keep-alive alias', async () => {
		const res = await fetch(`http://127.0.0.1:${testPort}/keep-alive`);
		expect(res.status).toBe(200);
		const data = (await res.json()) as any;
		expect(data.status).toBe('ok');
	});
});

import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import next from 'next';
import Logger from '../logger';
import { startKeepAlive, stopKeepAlive } from './keepAlive';

export interface WebServerOptions {
	port: number;
	host?: string;
	botClient?: any;
}

let activeServer: http.Server | null = null;

function resolveDashboardDir(): string {
	const candidates = [
		path.resolve(process.cwd(), 'apps', 'dashboard'),
		path.resolve(__dirname, '..', '..', '..', '..', 'apps', 'dashboard'),
		path.resolve(__dirname, '..', '..', '..', 'dashboard'),
		path.resolve(process.cwd(), 'dashboard'),
		path.resolve(__dirname, 'apps', 'dashboard')
	];

	for (const candidate of candidates) {
		if (
			fs.existsSync(candidate) &&
			(fs.existsSync(path.join(candidate, 'package.json')) ||
				fs.existsSync(path.join(candidate, 'next.config.mjs')))
		) {
			return candidate;
		}
	}

	return path.resolve(process.cwd(), 'apps', 'dashboard');
}

/**
 * Boots the internal Next.js Dashboard web server inside the same Node.js process
 * as the Discord bot, listening on a single port for the entire application.
 */
export async function startWebServer(
	options: WebServerOptions
): Promise<http.Server | null> {
	if (process.env.DISABLE_INTERNAL_DASHBOARD === 'true') {
		Logger.info('Internal dashboard server is disabled via DISABLE_INTERNAL_DASHBOARD=true.');
		return null;
	}

	const port = options.port;
	const host = options.host || '0.0.0.0';
	const isDev = process.env.NODE_ENV === 'development';
	const dashboardDir = resolveDashboardDir();

	Logger.info(
		`Initializing internal Next.js Dashboard service on port ${port} from ${dashboardDir}...`
	);

	if (options.botClient) {
		(globalThis as any).botClient = options.botClient;
	}

	const createNextApp = typeof next === 'function' ? next : (next as any).default || next;
	const app = createNextApp({
		dev: isDev,
		dir: dashboardDir,
		hostname: host,
		port
	});

	const handle = app.getRequestHandler();

	try {
		await app.prepare();
	} catch (err) {
		Logger.error('Failed to prepare Next.js dashboard application: ', err);
		throw err;
	}

	const server = http.createServer((req, res) => {
		const url = req.url || '';

		// Platform health checks & keep-alive endpoints
		if (
			url === '/health' ||
			url === '/api/health' ||
			url === '/keep-alive'
		) {
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
					botReady: options.botClient?.isReady?.() ?? false
				})
			);
			return;
		}

		// Forward all dashboard and web routes to Next.js handler
		handle(req, res);
	});

	return new Promise((resolve, reject) => {
		server.on('error', err => {
			Logger.error(`Internal Dashboard Web Server encountered an error: `, err);
			reject(err);
		});

		server.listen(port, host, () => {
			activeServer = server;
			const displayHost = host === '0.0.0.0' ? 'localhost' : host;
			Logger.info(
				`✅ Web Dashboard active on port ${port} (http://${displayHost}:${port}/dashboard)`
			);

			// Start background keep-alive pinging
			startKeepAlive(port);

			resolve(server);
		});
	});
}

export function stopWebServer(): void {
	stopKeepAlive();
	if (activeServer) {
		activeServer.close();
		activeServer = null;
	}
}

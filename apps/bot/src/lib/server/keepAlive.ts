import axios from 'axios';
import Logger from '../logger';

let keepAliveTimer: NodeJS.Timeout | null = null;

/**
 * Starts a periodic keep-alive pinger designed to prevent cloud hosts
 * like Render from putting the web service to sleep due to inbound HTTP inactivity.
 *
 * Render spins down free-tier web services after 15 minutes without inbound HTTP traffic.
 * This pinger fires every 10 minutes to maintain active service status 24/7.
 */
export function startKeepAlive(port: number): void {
	if (process.env.KEEP_ALIVE_ENABLED?.toLowerCase() === 'false') {
		Logger.info('Keep-alive ping service is disabled via KEEP_ALIVE_ENABLED=false.');
		return;
	}

	// Resolve the public or local target URL
	const rawBaseUrl =
		process.env.KEEP_ALIVE_URL?.trim() ||
		process.env.RENDER_EXTERNAL_URL?.trim() ||
		process.env.PUBLIC_URL?.trim() ||
		process.env.NEXTAUTH_URL?.trim() ||
		`http://localhost:${port}`;

	const baseUrl = rawBaseUrl.replace(/\/+$/, '');
	const pingUrl = `${baseUrl}/health`;

	const intervalMs = Number.parseInt(
		process.env.KEEP_ALIVE_INTERVAL_MS || String(10 * 60 * 1000), // 10 minutes default
		10
	);

	Logger.info(
		`Keep-alive service active. Target: ${pingUrl} (Interval: ${Math.round(
			intervalMs / 60000
		)} min)`
	);

	const ping = async () => {
		try {
			const res = await axios.get(pingUrl, {
				timeout: 10000,
				headers: {
					'User-Agent': 'Master-Bot-KeepAlive/1.0'
				},
				validateStatus: () => true // treat all HTTP statuses as non-throwing
			});

			if (res.status >= 200 && res.status < 400) {
				Logger.debug(`[KeepAlive] Ping successful to ${pingUrl} (HTTP ${res.status})`);
			} else {
				Logger.warn(`[KeepAlive] Ping responded with HTTP ${res.status}`);
			}
		} catch (err: any) {
			Logger.debug(`[KeepAlive] Ping notice (${pingUrl}): ${err?.message || err}`);
		}
	};

	// First ping after 30 seconds, then recurring
	setTimeout(() => {
		void ping();
		keepAliveTimer = setInterval(() => void ping(), intervalMs);
	}, 30000);
}

export function stopKeepAlive(): void {
	if (keepAliveTimer) {
		clearInterval(keepAliveTimer);
		keepAliveTimer = null;
	}
}

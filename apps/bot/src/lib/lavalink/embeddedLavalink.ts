import { startServer, LavalinkConfigError } from '@helix-origin/lavalink-server';
import type { ServerHandle } from '@helix-origin/lavalink-server';
import Logger from '../logger';
import fs from 'node:fs';
import path from 'node:path';

let embeddedHandle: ServerHandle | null = null;

export interface EmbeddedLavalinkOptions {
	port?: number;
	host?: string;
	pass?: string;
	enableSupervisor?: boolean;
}

/**
 * Initializes the embedded Lavalink v4 audio server from @helix-origin/lavalink-server.
 * Runs in-process alongside Master-Bot unless LAVA_EXTERNAL is explicitly set to true.
 */
export async function startEmbeddedLavalink(
	options: EmbeddedLavalinkOptions = {}
): Promise<ServerHandle | null> {
	if (embeddedHandle) {
		return embeddedHandle;
	}

	const isExternal =
		(process.env.LAVA_EXTERNAL || '').toLowerCase() === 'true';

	if (isExternal) {
		Logger.info(
			'[Embedded Lavalink] LAVA_EXTERNAL is enabled; skipping embedded audio server.'
		);
		return null;
	}

	const port =
		options.port ??
		(process.env.LAVA_PORT ? Number.parseInt(process.env.LAVA_PORT, 10) : 2333);
	const host = options.host ?? process.env.LAVA_HOST ?? '127.0.0.1';
	const pass = options.pass ?? process.env.LAVA_PASS ?? 'youshallnotpass';

	// Check if Lavalink.jar exists in project root for local supervisor execution
	const rootJar = path.resolve(process.cwd(), 'Lavalink.jar');
	const hasJar = fs.existsSync(rootJar);
	const canSupervise = options.enableSupervisor ?? (hasJar || process.env.LAVA_JAR_AUTO_DOWNLOAD === 'true');

	try {
		Logger.info(
			`[Embedded Lavalink] Initializing embedded audio server on ${host}:${port} (Supervisor: ${canSupervise ? 'ENABLED' : 'STANDBY'})...`
		);

		embeddedHandle = await startServer({
			overrides: {
				gatewayHost: host,
				gatewayPort: port,
				internalHost: host,
				internalPort: port,
				pass: pass,
				supervisorEnabled: canSupervise,
				dashboardEnabled: false
			},
			features: {
				dashboard: false,
				supervisor: canSupervise,
				youtubeOAuth: Boolean(process.env.YOUTUBE_CLIENT_ID)
			}
		});

		embeddedHandle.server.listen(port, host, () => {
			Logger.info(
				`[Embedded Lavalink] Embedded audio server listening at http://${host}:${port}`
			);
		});

		return embeddedHandle;
	} catch (err: any) {
		if (err instanceof LavalinkConfigError) {
			Logger.warn(
				`[Embedded Lavalink] Configuration notice: ${err.message}. Operating in external node mode.`
			);
		} else {
			Logger.warn(
				`[Embedded Lavalink] Notice during embedded initialization: ${err?.message || err}. Continuing with configured audio node settings.`
			);
		}
		return null;
	}
}

/**
 * Gracefully shuts down the embedded Lavalink server and process supervisor.
 */
export async function stopEmbeddedLavalink(): Promise<void> {
	if (!embeddedHandle) return;

	try {
		Logger.info('[Embedded Lavalink] Stopping embedded audio server...');
		await embeddedHandle.stop();
		embeddedHandle = null;
		Logger.info('[Embedded Lavalink] Embedded audio server stopped.');
	} catch (err) {
		Logger.error('[Embedded Lavalink] Error stopping embedded audio server:', err);
	}
}

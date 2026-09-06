import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Client, User } from 'discord.js';
import Logger from '../logger';

const CLIENT_ID =
	'861556708454-d6dlm3lh05idd8npek18k6be8ba3oc68.apps.googleusercontent.com';
const CLIENT_SECRET = 'SboVhoG9s0rNafixCSGGKXAT';
const SCOPE =
	'http://gdata.youtube.com https://www.googleapis.com/auth/youtube';
const DEVICE_CODE_URL = 'https://www.youtube.com/o/oauth2/device/code';
const TOKEN_URL = 'https://www.youtube.com/o/oauth2/token';

export interface DeviceFlowResponse {
	device_code: string;
	user_code: string;
	verification_url: string;
	expires_in: number;
	interval: number;
}

/**
 * Initiates the Google OAuth 2.0 Device Authorization Flow for YouTube (InnerTube TV endpoint).
 */
export async function initiateDeviceFlow(): Promise<DeviceFlowResponse> {
	const deviceId = crypto.randomUUID().replace(/-/g, '');
	const payload = {
		client_id: CLIENT_ID,
		scope: SCOPE,
		device_id: deviceId,
		device_model: 'ytlr::'
	};

	const res = await fetch(DEVICE_CODE_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
		},
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		const errorText = await res.text();
		throw new Error(`Device code request failed (${res.status}): ${errorText}`);
	}

	const data = (await res.json()) as any;
	return {
		device_code: data.device_code,
		user_code: data.user_code,
		verification_url: data.verification_url || 'https://www.google.com/device',
		expires_in: data.expires_in || 1800,
		interval: data.interval || 5
	};
}

/**
 * Polls YouTube OAuth token endpoint until the user authorizes the device code.
 */
export async function pollForRefreshToken(
	deviceCode: string,
	interval = 5,
	expiresIn = 1800
): Promise<string | null> {
	const startTime = Date.now();
	const pollIntervalMs = Math.max(interval, 5) * 1000;

	return new Promise(resolve => {
		const timer = setInterval(async () => {
			if (Date.now() - startTime > expiresIn * 1000) {
				clearInterval(timer);
				resolve(null);
				return;
			}

			try {
				const payload = {
					client_id: CLIENT_ID,
					client_secret: CLIENT_SECRET,
					code: deviceCode,
					grant_type: 'http://oauth.net/grant_type/device/1.0'
				};

				const res = await fetch(TOKEN_URL, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'User-Agent':
							'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
					},
					body: JSON.stringify(payload)
				});

				const data = (await res.json()) as any;

				if (res.ok && data?.refresh_token) {
					clearInterval(timer);
					const refreshToken = data.refresh_token as string;
					saveYouTubeRefreshToken(refreshToken);
					resolve(refreshToken);
					return;
				}

				if (
					data?.error === 'authorization_pending' ||
					data?.error === 'slow_down'
				) {
					return;
				}

				clearInterval(timer);
				Logger.error(
					`OAuth Polling Error: ${data?.error_description || data?.error}`
				);
				resolve(null);
			} catch (err: any) {
				clearInterval(timer);
				Logger.error(`OAuth Request Error: ${err?.message || err}`);
				resolve(null);
			}
		}, pollIntervalMs);
	});
}

/**
 * Atomically saves the YouTube OAuth refresh token to .youtube-oauth.json (gitignored)
 * and updates process.env in memory. (Strict compliance with Rule 2: Zero .env mutation).
 */
export function saveYouTubeRefreshToken(token: string): void {
	if (!token || !token.startsWith('1/')) return;

	process.env.YOUTUBE_REFRESH_TOKEN = token;

	const candidateDirs = [
		path.resolve(process.cwd(), '../../'),
		process.cwd(),
		path.resolve(__dirname, '../../../../')
	];

	for (const dir of candidateDirs) {
		const filePath = path.join(dir, '.youtube-oauth.json');
		const tmpPath = `${filePath}.tmp`;
		try {
			const data = JSON.stringify(
				{
					refresh_token: token,
					updated_at: new Date().toISOString()
				},
				null,
				2
			);
			fs.writeFileSync(tmpPath, data, 'utf-8');
			fs.renameSync(tmpPath, filePath);
			Logger.info(
				`YouTube OAuth refresh token saved atomically to ${filePath}`
			);
			break;
		} catch (err) {
			Logger.error(`Failed to save .youtube-oauth.json in ${dir}: ${err}`);
		}
	}
}

/**
 * Fetches the Discord Application Owner to restrict sensitive administrative commands.
 */
export async function getApplicationOwnerUser(
	client: Client
): Promise<User | null> {
	try {
		await client.application?.fetch();
		const app = client.application;
		if (!app || !app.owner) return null;

		let ownerId: string | null = null;
		if ('ownerId' in app.owner && app.owner.ownerId) {
			ownerId = app.owner.ownerId as string;
		} else if ('id' in app.owner && app.owner.id) {
			ownerId = app.owner.id;
		}

		if (ownerId) {
			return await client.users.fetch(ownerId).catch(() => null);
		}
	} catch (err) {
		Logger.error(`Failed to fetch application owner user: ${err}`);
	}
	return null;
}

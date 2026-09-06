/**
 * apps/bot/src/env.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Central environment handler for the Master-Bot subsystem.
 *
 * All bot and dashboard files import their env keys from here instead of
 * reading process.env directly. This is a HELIX-faithful alignment:
 *   • Typed, defaulted accessors — no `process.env.X || 'default'` scatter
 *   • NEXTAUTH_URL / NEXTAUTH_INTERNAL_URL are AUTO-RESOLVED from PORT —
 *     the user never provides them, exactly like HELIX
 *   • A single place to add validation or change key names
 *   • saveBotEnvValue() for writing config back to .env at runtime
 *
 * The ONLY extra keys beyond HELIX are those required for Master-Bot's
 * Lavalink and external API services (KLIPY/NEWS/IGDB/Twitch/Spotify/etc.).
 *
 * Load order (HELIX clone):
 *   <root>/.env  →  cwd/.env  →  home overrides  →  dotenv CWD fallback
 * ──────────────────────────────────────────────────────────────────────────
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function resolveBotRootDir(): string {
	const probes = [
		process.cwd(),
		path.resolve(process.cwd(), '..'),
		path.resolve(process.cwd(), '..', '..'),
		__dirname,
		path.resolve(__dirname, '..'),
		path.resolve(__dirname, '..', '..'),
		path.resolve(__dirname, '..', '..', '..'),
		path.resolve(__dirname, '..', '..', '..', '..')
	];
	for (const dir of probes) {
		try {
			const rootPkg = path.join(dir, 'package.json');
			if (fs.existsSync(rootPkg)) {
				const pkg = JSON.parse(fs.readFileSync(rootPkg, 'utf-8'));
				if (pkg.name === 'master-bot-turbo' || pkg.workspaces || pkg.name === '@master-bot/bot') {
					return dir;
				}
			}
			if (fs.existsSync(path.join(dir, '.env')) && !dir.endsWith('dist') && !dir.endsWith('src')) {
				return dir;
			}
		} catch {
			// Ignore unreadable or invalid package.json during probing
		}
	}
	return process.cwd();
}

export const BOT_ROOT_DIR = resolveBotRootDir();

// ─── Bootstrap ───────────────────────────────────────────────────────────────

let _loaded = false;

export function loadBotEnv(): void {
	if (_loaded) return;
	_loaded = true;

	const candidates: string[] = [
		path.resolve(BOT_ROOT_DIR, '.env'),
		path.resolve(process.cwd(), '.env'),
		path.resolve(process.cwd(), '..', '.env'),
		path.resolve(__dirname, '.env'),
		path.resolve(__dirname, '..', '.env'),
		path.resolve(__dirname, '..', '..', '.env'),
		path.resolve(os.homedir(), '.master-bot', '.env'),
		path.resolve(os.homedir(), '.env')
	];

	for (const p of candidates) {
		try {
			if (fs.existsSync(p)) {
				dotenv.config({ path: p });
			}
		} catch {
			// Ignore unreadable .env candidates
		}
	}
	// Standard dotenv CWD lookup as final fallback
	dotenv.config();
}

// Load immediately on import
loadBotEnv();

// ─── Discord Credentials ─────────────────────────────────────────────────────

function stripQuotesAndAuth(value: string, stripBotPrefix = false): string {
	let cleaned = value.trim();
	if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
		cleaned = cleaned.slice(1, -1).trim();
	}
	if (stripBotPrefix && cleaned.startsWith('Bot ')) {
		cleaned = cleaned.slice(4).trim();
	}
	return cleaned;
}

/** Discord Bot Token — required for gateway connection. */
export function getBotToken(): string {
	return stripQuotesAndAuth(
		process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN || process.env.TOKEN || '',
		true
	);
}

/** Discord Application Client ID — required for OAuth2 and slash commands. */
export function getClientId(): string {
	return stripQuotesAndAuth(
		process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID || process.env.DISCORD_APP_ID || process.env.APPLICATION_ID || process.env.APP_ID || ''
	);
}

/** Discord Application Client Secret — required for the dashboard OAuth2 flow. */
export function getClientSecret(): string {
	return stripQuotesAndAuth(
		process.env.DISCORD_CLIENT_SECRET || process.env.CLIENT_SECRET || process.env.DISCORD_SECRET || ''
	);
}

/** Discord server / user ID treated as the bot owner. */
export function getOwnerId(): string {
	return (
		process.env.DISCORD_OWNER_ID || process.env.BOT_OWNER_ID || process.env.OWNER_ID || ''
	).trim();
}

// ─── Ports & URLs (auto-resolved, HELIX-faithful) ───────────────────────────

/**
 * HTTP port the dashboard and OAuth2 server listens on. Defaults to 3000
 * (Master-Bot's port; HELIX uses 5000 so the two never conflict).
 */
export function getPort(): number {
	const raw = process.env.PORT || process.env.BOT_PORT || process.env.DASHBOARD_PORT;
	if (raw) {
		const n = parseInt(raw, 10);
		if (!isNaN(n)) return n;
	}
	return 3000;
}

/**
 * Normalizes a callback URL to its BASE URL form.
 * Accepts either a bare base (`https://app.example.com`) or the full callback
 * path (`https://app.example.com/api/auth/callback/discord`) and strips any
 * trailing auth/callback path.
 */
export function normalizeCallbackBaseUrl(raw: string): string {
	const trimmed = (raw || '').trim();
	if (!trimmed) return '';
	const lower = trimmed.toLowerCase();
	const marker = lower.indexOf('/api/auth/callback/');
	const base = marker !== -1 ? trimmed.slice(0, marker) : trimmed;
	return base.replace(/\/+$/, '');
}

/**
 * Public-facing NextAuth / Dashboard URL (e.g. `https://bot.example.com`).
 * AUTO-RESOLVED just like HELIX: explicit `NEXTAUTH_URL` for public
 * deployments, else `DISCORD_CALLBACK_URL`, else `http://localhost:<PORT>`.
 * Users never need to provide NEXTAUTH_URL for local setups.
 */
export function getNextAuthUrl(): string {
	const port = getPort();
	const explicit = (process.env.NEXTAUTH_URL || '').trim();
	if (explicit) {
		const clean = explicit.replace(/\/+$/, '');
		const url = clean.includes('://')
			? clean
			: clean.includes('localhost') || clean.includes('127.0.0.1')
				? `http://${clean}`
				: `https://${clean}`;
		try {
			const u = new URL(url);
			if (!u.port && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) {
				u.port = String(port);
			}
			return u.toString().replace(/\/+$/, '');
		} catch {
			return url;
		}
	}

	const explicitCallback = normalizeCallbackBaseUrl(process.env.DISCORD_CALLBACK_URL || '');
	if (explicitCallback) {
		return explicitCallback;
	}

	return `http://localhost:${port}`;
}

/**
 * Internal URL NextAuth uses for server-side self-requests.
 * AUTO-RESOLVED (defaults to `http://localhost:<port>`).
 */
export function getNextAuthInternalUrl(): string {
	const port = getPort();
	const raw = (process.env.NEXTAUTH_INTERNAL_URL || 'http://localhost').trim().replace(/\/+$/, '');
	try {
		const u = new URL(raw.includes('://') ? raw : `http://${raw}`);
		if (!u.port) u.port = String(port);
		return u.toString().replace(/\/+$/, '');
	} catch {
		return `http://localhost:${port}`;
	}
}

/**
 * Base OAuth2 callback URL (no trailing slash).
 * Returns `DISCORD_CALLBACK_URL` if set, otherwise auto-resolves to `getNextAuthUrl()`.
 */
export function getCallbackUrl(): string {
	const explicit = normalizeCallbackBaseUrl(process.env.DISCORD_CALLBACK_URL || '');
	if (explicit) {
		return explicit;
	}
	return getNextAuthUrl();
}

/** Pre-built administrator bot invite URL. Quotes are stripped automatically. */
export function getInviteUrl(): string {
	const raw = (process.env.NEXT_PUBLIC_INVITE_URL || '').trim();
	const invite = stripQuotesAndAuth(raw);
	if (!invite) {
		const clientId = getClientId();
		if (clientId && clientId !== 'yourclientid') {
			return `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;
		}
	}
	return invite;
}

/** HMAC secret for signing NextAuth session tokens. */
export function getNextAuthSecret(): string {
	return process.env.NEXTAUTH_SECRET || 'master_bot_dashboard_secret_key_32_bytes_min';
}

/**
 * Absolute path to the SQLite database file.
 * Defaults to `<root>/data/bot.sqlite`, overridable via `DISCORD_DB_PATH`.
 */
export function getDbPath(): string {
	const defaultDir = path.resolve(BOT_ROOT_DIR, 'data');
	try {
		fs.mkdirSync(defaultDir, { recursive: true });
	} catch {
		// Directory may already exist or be unwritable — proceed regardless
	}
	return process.env.DISCORD_DB_PATH || path.resolve(defaultDir, 'bot.sqlite');
}

// ─── Master-Bot Lavalink & API Service Extras ───────────────────────────────

function toBool(value: string | undefined, fallback: boolean): boolean {
	if (value === undefined) return fallback;
	return value.toLowerCase() === 'true';
}

/** MasterBot Feature Toggles */
export function isLavalinkEnabled(): boolean {
	return toBool(process.env.LAVA_ENABLED, true);
}

export function isGifsEnabled(): boolean {
	return toBool(process.env.GIFS_ENABLED, true);
}

export function isTwitchEnabled(): boolean {
	return toBool(process.env.TWITCH_ENABLED, true);
}

export function isNewsEnabled(): boolean {
	return toBool(process.env.NEWS_ENABLED, true);
}

export function isIgdbEnabled(): boolean {
	return toBool(process.env.IGDB_ENABLED, true);
}

export interface LavalinkConfig {
	external: boolean;
	host: string;
	port: number;
	password: string;
	secure: boolean;
	clientId: string;
}

export function getLavalinkConfig(): LavalinkConfig {
	return {
		external: toBool(process.env.LAVA_EXTERNAL, false),
		host: process.env.LAVA_HOST || '127.0.0.1',
		port: process.env.LAVA_PORT ? parseInt(process.env.LAVA_PORT, 10) : 2333,
		password: process.env.LAVA_PASS || 'youshallnotpass',
		secure: toBool(process.env.LAVA_SECURE, false),
		clientId: process.env.DISCORD_CLIENT_ID || ''
	};
}

export interface ApiServiceKeys {
	klipyApi: string;
	newsApi: string;
	youtubeApiKey: string;
	youtubeRefreshToken: string;
	youtubeCipherUrl: string;
	youtubeCipherPassword: string;
	spotifyClientId: string;
	spotifyClientSecret: string;
	soundcloudClientId: string;
	soundcloudClientSecret: string;
	igdbEnabled: boolean;
}

export function getApiServiceKeys(): ApiServiceKeys {
	return {
		klipyApi: process.env.KLIPY_API || '',
		newsApi: process.env.NEWS_API || '',
		youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
		youtubeRefreshToken: process.env.YOUTUBE_REFRESH_TOKEN || '',
		youtubeCipherUrl: process.env.YOUTUBE_CIPHER_URL || '',
		youtubeCipherPassword: process.env.YOUTUBE_CIPHER_PASSWORD || '',
		spotifyClientId: process.env.SPOTIFY_CLIENT_ID || '',
		spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
		soundcloudClientId: process.env.SOUNDCLOUD_CLIENT_ID || '',
		soundcloudClientSecret: process.env.SOUNDCLOUD_CLIENT_SECRET || '',
		igdbEnabled: isIgdbEnabled()
	};
}

// ─── Convenience snapshot ────────────────────────────────────────────────────

export interface BotEnvConfig {
	botToken: string;
	clientId: string;
	clientSecret: string;
	ownerId: string;
	callbackUrl: string;
	inviteUrl: string;
	port: number;
	nextAuthUrl: string;
	nextAuthInternalUrl: string;
	nextAuthSecret: string;
	dbPath: string;
}

/** Returns a snapshot of all bot env values at the moment of calling. */
export function getBotEnv(): BotEnvConfig {
	return {
		botToken: getBotToken(),
		clientId: getClientId(),
		clientSecret: getClientSecret(),
		ownerId: getOwnerId(),
		callbackUrl: getCallbackUrl(),
		inviteUrl: getInviteUrl(),
		port: getPort(),
		nextAuthUrl: getNextAuthUrl(),
		nextAuthInternalUrl: getNextAuthInternalUrl(),
		nextAuthSecret: getNextAuthSecret(),
		dbPath: getDbPath()
	};
}

// ─── Write helper ─────────────────────────────────────────────────────────────

/**
 * Write or update a single key in the project `.env` file.
 * Also sets `process.env[key]` immediately so the running process reflects
 * the new value without a restart.
 */
export function saveBotEnvValue(key: string, value: string, envPath?: string): string {
	const target = envPath || path.resolve(BOT_ROOT_DIR, '.env');
	let content = '';
	try {
		content = fs.existsSync(target) ? fs.readFileSync(target, 'utf-8') : '';
	} catch {
		// Fall through with empty content
	}
	const regex = new RegExp(`^${key}=.*$`, 'm');
	content = regex.test(content) ? content.replace(regex, `${key}=${value}`) : `${content.trimEnd()}\n${key}=${value}\n`;
	fs.writeFileSync(target, content, 'utf-8');
	process.env[key] = value;
	return target;
}
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const rootDir = path.resolve(__dirname, '..');
export const logsDir = path.join(rootDir, 'logs');

export function loadEnv() {
	const envPath = path.join(rootDir, '.env');
	if (fs.existsSync(envPath)) {
		const envContent = fs.readFileSync(envPath, 'utf-8');
		for (const line of envContent.split(/\r?\n/)) {
			const match = line.match(/^\s*([\w.-]+)\s*=\s*['"]?(.*?)['"]?\s*$/);
			if (match && !process.env[match[1]]) {
				process.env[match[1]] = match[2];
			}
		}
	}
}

export function extractPortFromUrl(urlStr, defaultPort) {
	if (!urlStr) return defaultPort;
	try {
		const parsed = new URL(urlStr);
		if (parsed.port) return parseInt(parsed.port, 10);
		return parsed.protocol === 'https:' ? 443 : 80;
	} catch {
		const match = urlStr.match(/:(\d+)/);
		if (match) return parseInt(match[1], 10);
		return defaultPort;
	}
}

export function freePort(port) {
	if (!port) return;
	const isWindows = process.platform === 'win32';
	try {
		if (isWindows) {
			const stdout = execSync(`netstat -ano | findstr :${port}`, {
				encoding: 'utf-8',
				stdio: ['pipe', 'pipe', 'ignore']
			});
			const lines = stdout.split(/\r?\n/);
			const pidsToKill = new Set();
			for (const line of lines) {
				if (line.includes('LISTENING')) {
					const parts = line.trim().split(/\s+/);
					const pid = parts[parts.length - 1];
					if (pid && pid !== '0' && /^\d+$/.test(pid)) {
						pidsToKill.add(pid);
					}
				}
			}
			for (const pid of pidsToKill) {
				try {
					execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
				} catch {}
			}
		} else {
			execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, {
				stdio: 'ignore'
			});
		}
	} catch {}
}

/**
 * Validates that Java >= 17 is installed and accessible on PATH.
 * Lavalink v4 requires Java 17+; Java 21 LTS is recommended.
 * Returns { ok: true, version } on success, { ok: false, error } on failure.
 */
export function checkJavaVersion() {
	try {
		const output = execSync('java -version 2>&1', { encoding: 'utf-8', stdio: 'pipe' });
		// java -version prints to stderr; execSync captures both via 2>&1
		const match = output.match(/version\s+"?(\d+)(?:\.(\d+))?/);
		if (!match) {
			return { ok: false, error: 'Could not parse Java version output.' };
		}
		// Java 9+ uses single-component versioning (e.g. "17", "21")
		// Java 8 uses "1.8" format
		const major = parseInt(match[1], 10);
		const actualMajor = major === 1 ? parseInt(match[2] || '0', 10) : major;
		if (actualMajor < 17) {
			return {
				ok: false,
				error: `Java ${actualMajor} detected. Lavalink v4 requires Java 17 or higher (Java 21 LTS recommended). Please upgrade: https://www.azul.com/downloads/?package=jdk#zulu`
			};
		}
		return { ok: true, version: actualMajor };
	} catch {
		return {
			ok: false,
			error: 'Java not found on PATH. Lavalink requires Java 17+ to run. Install Java 21 LTS: https://www.azul.com/downloads/?package=jdk#zulu'
		};
	}
}

export function clearYouTubeRefreshToken() {
	delete process.env.YOUTUBE_REFRESH_TOKEN;
}

/**
 * Checks for configured music API keys in process.env.
 * Returns boolean flags for youtube, spotify, soundcloud, and hasAny.
 */
export function getLavalinkKeyStatus() {
	const ytToken = process.env.YOUTUBE_REFRESH_TOKEN?.trim();
	const validYtToken = ytToken && ytToken.startsWith('1/') ? ytToken : null;

	// If a token exists in env but doesn't start with 1/, auto-clear it in memory
	if (ytToken && !validYtToken) {
		clearYouTubeRefreshToken();
	}

	const youtube = !!(process.env.YOUTUBE_API_KEY || validYtToken);
	const spotify = !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
	const soundcloud = !!(process.env.SOUNDCLOUD_CLIENT_ID && process.env.SOUNDCLOUD_CLIENT_SECRET);
	const hasAny = youtube || spotify || soundcloud;

	return {
		youtube,
		spotify,
		soundcloud,
		hasAny
	};
}

export function extractYouTubeRefreshToken(line) {
	// Matches 1/ or 1// starting after whitespace, colon, equals, quote, or parenthesis
	const match = line.match(/(?:^|[\s:='"(])(1\/[a-zA-Z0-9_\-.~/]+)/);
	if (!match) return null;

	// Trim trailing quotes, braces, commas, parentheses, dots, or whitespace
	let token = match[1].replace(/[}"',.;!)\s]+$/, '');

	if (token.length >= 20 && token.startsWith('1/')) {
		return token;
	}
	return null;
}

export function saveYouTubeRefreshToken(token) {
	if (!token || !token.startsWith('1/')) return;

	// Deduplicate: if the exact token is already active in memory, do nothing
	if (process.env.YOUTUBE_REFRESH_TOKEN === token) {
		return;
	}

	process.env.YOUTUBE_REFRESH_TOKEN = token;

	const successBanner = `\n\x1b[1;32m====================================================================\x1b[0m\n\x1b[1;32m✅ [YOUTUBE REFRESH TOKEN CAPTURED IN MEMORY]\x1b[0m\n\x1b[1;36m Token:\x1b[0m ${token}\n\x1b[1;32m The token is active in process memory for this session.\x1b[0m\n\x1b[1;32m====================================================================\x1b[0m\n\n`;
	process.stdout.write(successBanner);
}

export function isAuthInfo(line) {
	const lower = line.toLowerCase();

	if (
		lower.includes('exception') ||
		lower.includes('caused by:') ||
		lower.includes('unsatisfieddependencyexception') ||
		lower.includes('beancreationexception')
	) {
		return false;
	}

	return (
		line.includes('google.com/device') ||
		line.includes('https://www.google.com/device') ||
		line.includes('To authenticate') ||
		(lower.includes('device') && lower.includes('code') && lower.includes('enter')) ||
		(lower.includes('user_code') && lower.includes('verification_url'))
	);
}

export function createLogWriter(fileStream, combinedStream) {
	return function writeLog(prefix, data) {
		const timestamp = new Date().toISOString();
		const lines = data.toString().split(/\r?\n/);
		for (const line of lines) {
			if (!line.trim()) continue;

			// Auto-capture YouTube OAuth refresh token output from youtube-plugin
			const token = extractYouTubeRefreshToken(line);
			if (token) {
				saveYouTubeRefreshToken(token);
			}

			if (line.includes('Invalid status code for oauth2 token fetch: 400')) {
				clearYouTubeRefreshToken();
				const errBanner = `\n\x1b[1;31m====================================================================\x1b[0m\n\x1b[1;31m⚠️  [INVALID YOUTUBE REFRESH TOKEN DETECTED]\x1b[0m\n\x1b[1;33m Google rejected the stored YouTube refresh token (HTTP 400 Bad Request).\x1b[0m\n\x1b[1;33m The invalid token has been automatically cleared from .env.\x1b[0m\n\x1b[1;36m Lavalink will now prompt for a fresh YouTube device authorization code.\x1b[0m\n\x1b[1;31m====================================================================\x1b[0m\n\n`;
				process.stdout.write(errBanner);
			}

			if (isAuthInfo(line)) {
				// DO NOT write sensitive auth info to disk log files!
				// Display directly in custom console output for the user:
				const authBanner = `\n\x1b[1;33m====================================================================\x1b[0m\n\x1b[1;32m🔑 [YOUTUBE OAUTH DEVICE AUTHENTICATION REQUIRED]\x1b[0m\n\x1b[1;36m Source:\x1b[0m [${prefix}]\n\x1b[1;37m ${line.trim()}\x1b[0m\n\x1b[1;33m====================================================================\x1b[0m\n\n`;
				process.stdout.write(authBanner);
			} else {
				const entry = `[${timestamp}] [${prefix}] ${line}\n`;
				fileStream.write(entry);
				combinedStream.write(entry);
			}
		}
	};
}

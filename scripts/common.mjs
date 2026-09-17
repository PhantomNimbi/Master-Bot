import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const rootDir = path.resolve(__dirname, '..');
export const logsDir = path.join(rootDir, 'logs');

/** Path to the dedicated YouTube OAuth token file (gitignored). */
export const youtubeOAuthPath = path.join(rootDir, '.youtube-oauth.json');

/**
 * Loads key-value pairs from .env into process.env without modifying the file.
 */
export function loadEnv() {
	const envPath = path.join(rootDir, '.env');
	if (fs.existsSync(envPath)) {
		const envContent = fs.readFileSync(envPath, 'utf-8');
		for (const rawLine of envContent.split(/\r?\n/)) {
			const line = rawLine.trim();
			if (!line || line.startsWith('#')) continue;

			const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)$/);
			if (match) {
				const key = match[1];
				let val = match[2].trim();

				if (val.startsWith('"')) {
					const quoteEnd = val.indexOf('"', 1);
					val = quoteEnd !== -1 ? val.substring(1, quoteEnd) : val.substring(1);
				} else if (val.startsWith("'")) {
					const quoteEnd = val.indexOf("'", 1);
					val = quoteEnd !== -1 ? val.substring(1, quoteEnd) : val.substring(1);
				} else {
					const hashIndex = val.indexOf('#');
					if (hashIndex !== -1) {
						val = val.substring(0, hashIndex).trim();
					}
				}

				if (!process.env[key]) {
					process.env[key] = val;
				}
			}
		}
	}
}

/**
 * Extracts a numeric port from an address or URL string.
 */
export function extractPort(urlStr, defaultPort = 3000) {
	if (!urlStr) return defaultPort;
	try {
		const parsed = new URL(urlStr.startsWith('http') ? urlStr : `http://${urlStr}`);
		if (parsed.port) return parseInt(parsed.port, 10);
		return parsed.protocol === 'https:' ? 443 : 80;
	} catch {
		const match = urlStr.match(/:(\d+)/);
		if (match) return parseInt(match[1], 10);
		const directPort = parseInt(urlStr, 10);
		if (!isNaN(directPort) && directPort > 0) return directPort;
		return defaultPort;
	}
}

/**
 * Ensures any processes holding a specified port are terminated.
 */
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
 * Kills a process and all of its spawned child processes recursively.
 */
export function killProcessTree(proc) {
	if (!proc || !proc.pid) return;
	try {
		if (process.platform === 'win32') {
			execSync(`taskkill /PID ${proc.pid} /T /F`, { stdio: 'ignore' });
		} else {
			proc.kill('SIGTERM');
		}
	} catch {}
}

/**
 * Checks whether a TCP port is actively open and listening.
 */
export function isPortInUse(port, host = '127.0.0.1', timeoutMs = 1500) {
	return new Promise((resolve) => {
		import('node:net').then(({ default: net }) => {
			const socket = new net.Socket();
			socket.setTimeout(timeoutMs);
			socket.on('connect', () => {
				socket.destroy();
				resolve(true);
			});
			socket.on('error', () => {
				socket.destroy();
				resolve(false);
			});
			socket.on('timeout', () => {
				socket.destroy();
				resolve(false);
			});
			socket.connect(port, host);
		});
	});
}

/**
 * Polls a TCP port until a connection succeeds or timeout expires.
 */
export function waitForPort(port, host = '127.0.0.1', timeoutMs = 25000) {
	return new Promise((resolve) => {
		const start = Date.now();
		const check = () => {
			if (Date.now() - start > timeoutMs) {
				return resolve(false);
			}
			import('node:net').then(({ default: net }) => {
				const socket = new net.Socket();
				socket.setTimeout(1000);
				socket.on('connect', () => {
					socket.destroy();
					resolve(true);
				});
				socket.on('error', () => {
					socket.destroy();
					setTimeout(check, 500);
				});
				socket.on('timeout', () => {
					socket.destroy();
					setTimeout(check, 500);
				});
				socket.connect(port, host);
			});
		};
		check();
	});
}

/**
 * Validates that Java >= 17 is installed and accessible on PATH.
 */
export function checkJavaVersion() {
	try {
		const output = execSync('java -version 2>&1', {
			encoding: 'utf-8',
			stdio: 'pipe'
		});
		const match = output.match(/version\s+"?(\d+)(?:\.(\d+))?/);
		if (!match) {
			return { ok: false, error: 'Could not parse Java version output.' };
		}
		const major = parseInt(match[1], 10);
		const actualMajor = major === 1 ? parseInt(match[2] || '0', 10) : major;
		if (actualMajor < 17) {
			return {
				ok: false,
				error: `Java ${actualMajor} detected. Lavalink v4 requires Java 17 or higher (Java 21 LTS recommended).`
			};
		}
		return { ok: true, version: actualMajor };
	} catch {
		return {
			ok: false,
			error: 'Java not found on PATH. Embedded Lavalink requires Java 17+.'
		};
	}
}

/**
 * Loads previously saved YouTube OAuth refresh token from .youtube-oauth.json into process.env.
 */
export function loadYouTubeToken() {
	const isLavalinkEnabled =
		(process.env.LAVA_ENABLED || 'true').toLowerCase() === 'true';
	if (!isLavalinkEnabled) return;

	const existing = process.env.YOUTUBE_REFRESH_TOKEN?.trim();
	if (existing && existing.startsWith('1/')) return;

	if (!fs.existsSync(youtubeOAuthPath)) return;

	try {
		const raw = fs.readFileSync(youtubeOAuthPath, 'utf-8');
		const data = JSON.parse(raw);
		if (
			data.refreshToken &&
			typeof data.refreshToken === 'string' &&
			data.refreshToken.startsWith('1/')
		) {
			process.env.YOUTUBE_REFRESH_TOKEN = data.refreshToken;
			console.log(
				`\x1b[1;32m✅ [YOUTUBE TOKEN LOADED]\x1b[0m Loaded YouTube OAuth refresh token from .youtube-oauth.json (saved ${data.savedAt || 'unknown date'})\n`
			);
		}
	} catch {}
}

export function clearYouTubeRefreshToken() {
	delete process.env.YOUTUBE_REFRESH_TOKEN;
	try {
		if (fs.existsSync(youtubeOAuthPath)) {
			fs.unlinkSync(youtubeOAuthPath);
		}
	} catch {}
}

export function extractYouTubeRefreshToken(line) {
	const match = line.match(/(?:^|[\s:='"(])(1\/[a-zA-Z0-9_\-.~/]+)/);
	if (!match) return null;

	const token = match[1].replace(/[}"',.;!)\s]+$/, '');
	if (token.length >= 20 && token.startsWith('1/')) {
		return token;
	}
	return null;
}

export function saveYouTubeRefreshToken(token) {
	if (!token || !token.startsWith('1/')) return;
	if (process.env.YOUTUBE_REFRESH_TOKEN === token) return;

	process.env.YOUTUBE_REFRESH_TOKEN = token;

	const data = JSON.stringify(
		{ refreshToken: token, savedAt: new Date().toISOString() },
		null,
		2
	);
	const tmpPath = youtubeOAuthPath + '.tmp';
	try {
		fs.writeFileSync(tmpPath, data, 'utf-8');
		fs.renameSync(tmpPath, youtubeOAuthPath);
	} catch {
		try {
			fs.writeFileSync(youtubeOAuthPath, data, 'utf-8');
		} catch {}
	}

	const banner = `\n\x1b[1;32m====================================================================\x1b[0m\n\x1b[1;32m✅ [YOUTUBE REFRESH TOKEN CAPTURED & SAVED]\x1b[0m\n\x1b[1;36m Token:\x1b[0m ${token}\n\x1b[1;32m Persisted to .youtube-oauth.json (survives restart).\x1b[0m\n\x1b[1;32m====================================================================\x1b[0m\n\n`;
	process.stdout.write(banner);
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

const prefixColors = {
	BOT: '\x1b[1;34m', // blue
	'BOT-ERR': '\x1b[1;31m', // red
	DASHBOARD: '\x1b[1;35m', // magenta
	'DASHBOARD-ERR': '\x1b[1;31m', // red
	LAVALINK: '\x1b[1;33m', // yellow
	'LAVALINK-ERR': '\x1b[1;31m', // red
	SYSTEM: '\x1b[1;36m' // cyan
};
const RESET = '\x1b[0m';

function isErrorLine(line) {
	const trimmed = line.trim();
	if (trimmed.startsWith('at ') || trimmed.startsWith('Caused by:')) return false;
	if (
		trimmed.includes('error.cause') ||
		trimmed.includes('errorFormatter') ||
		trimmed.includes('error_handler')
	)
		return false;

	return (
		/\bError\b/.test(trimmed) ||
		/\bERR\b/.test(trimmed) ||
		/\bFATAL\b/i.test(trimmed) ||
		/\bException\b/.test(trimmed) ||
		/exited with code/i.test(trimmed) ||
		(/\bfailed\b/i.test(trimmed) &&
			/\b(to|load|resolve|connect|start|build|compile)\b/i.test(trimmed)) ||
		/\bcrash/i.test(trimmed) ||
		/ECONNREFUSED|ENOTFOUND|EACCES|EPERM/i.test(trimmed)
	);
}

function isWarnLine(line) {
	const trimmed = line.trim();
	if (trimmed.startsWith('at ') || trimmed.startsWith('Caused by:')) return false;
	return /\bWARN\b/.test(trimmed);
}

export function createLogWriter(fileStream, combinedStream) {
	return function writeLog(prefix, data) {
		const timestamp = new Date().toISOString();
		const lines = data.toString().split(/\r?\n/);
		for (const line of lines) {
			if (!line.trim()) continue;

			const token = extractYouTubeRefreshToken(line);
			if (token) {
				saveYouTubeRefreshToken(token);
			}

			if (line.includes('Invalid status code for oauth2 token fetch: 400')) {
				clearYouTubeRefreshToken();
				const errBanner = `\n\x1b[1;31m====================================================================\x1b[0m\n\x1b[1;31m⚠️  [INVALID YOUTUBE REFRESH TOKEN DETECTED]\x1b[0m\n\x1b[1;33m Google rejected the stored YouTube refresh token (HTTP 400 Bad Request).\x1b[0m\n\x1b[1;33m The invalid token has been cleared from .youtube-oauth.json.\x1b[0m\n\x1b[1;36m Lavalink will now prompt for a fresh YouTube device authorization code.\x1b[0m\n\x1b[1;31m====================================================================\x1b[0m\n\n`;
				process.stdout.write(errBanner);
			}

			if (isAuthInfo(line)) {
				const authBanner = `\n\x1b[1;33m====================================================================\x1b[0m\n\x1b[1;32m🔑 [YOUTUBE OAUTH DEVICE AUTHENTICATION REQUIRED]\x1b[0m\n\x1b[1;36m Source:\x1b[0m [${prefix}]\n\x1b[1;37m ${line.trim()}\x1b[0m\n\x1b[1;33m====================================================================\x1b[0m\n\n`;
				process.stdout.write(authBanner);
			} else {
				const entry = `[${timestamp}] [${prefix}] ${line}\n`;
				if (fileStream) fileStream.write(entry);
				if (combinedStream) combinedStream.write(entry);

				const color = prefixColors[prefix] || '\x1b[1;37m';
				if (isErrorLine(line)) {
					process.stderr.write(
						`${color}⚠ [${prefix}]${RESET} \x1b[31m${line.trim()}${RESET}\n`
					);
				} else if (isWarnLine(line)) {
					process.stderr.write(
						`${color}⚡ [${prefix}]${RESET} \x1b[33m${line.trim()}${RESET}\n`
					);
				} else {
					// Forward stdout
					process.stdout.write(`${line}\n`);
				}
			}
		}
	};
}

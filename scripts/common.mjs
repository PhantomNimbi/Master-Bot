import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const rootDir = path.resolve(__dirname, '..');
export const logsDir = path.join(rootDir, 'logs');

/** Path to the dedicated YouTube OAuth token file (gitignored). */
const youtubeOAuthPath = path.join(rootDir, '.youtube-oauth.json');

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
 * Checks whether a TCP port is actively open and listening.
 */
export function isPortInUse(port, host = '127.0.0.1', timeoutMs = 1500) {
	return new Promise(resolve => {
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
 * Checks whether Redis cache is running, and launches redis-server if not running.
 * Returns { status: string, process: ChildProcess | null }
 */
export async function ensureRedisService(redisPort = 6379, redisHost = '127.0.0.1', writeRedisLog = null) {
	const hostToCheck = redisHost === '0.0.0.0' ? '127.0.0.1' : redisHost;
	const isAlreadyRunning = await isPortInUse(redisPort, hostToCheck, 1500);

	if (isAlreadyRunning) {
		if (writeRedisLog) {
			writeRedisLog(
				'SYSTEM',
				`Existing Redis server detected running on ${hostToCheck}:${redisPort}. Connected directly.`
			);
		}
		return {
			status: `RUNNING (Connected to ${hostToCheck}:${redisPort})`,
			process: null
		};
	}

	if (writeRedisLog) {
		writeRedisLog('SYSTEM', `Redis server not detected on port ${redisPort}. Attempting to launch redis-server...`);
	}

	try {
		const isWindows = process.platform === 'win32';
		const redisCmd = isWindows ? 'redis-server.exe' : 'redis-server';
		const redisProcess = spawn(redisCmd, {
			cwd: rootDir,
			shell: isWindows
		});

		if (writeRedisLog) {
			redisProcess.stdout?.on('data', data => writeRedisLog('REDIS', data));
			redisProcess.stderr?.on('data', data => writeRedisLog('REDIS-ERR', data));
		}

		console.log('\n⏳ Waiting for Redis cache server to become ready...');
		const isReady = await waitForPort(redisPort, hostToCheck, 10000);

		if (isReady) {
			console.log(`\x1b[1;32m✅ [REDIS READY]\x1b[0m Redis server listening on port ${redisPort}\n`);
			return {
				status: `RUNNING (Internal PID: ${redisProcess.pid})`,
				process: redisProcess
			};
		} else {
			return {
				status: 'WARN (Started but port check timed out)',
				process: redisProcess
			};
		}
	} catch (err) {
		if (writeRedisLog) {
			writeRedisLog('SYSTEM', `Could not automatically launch redis-server: ${err.message}`);
		}
		console.warn(`\n\x1b[1;33m⚠️  [REDIS WARNING]\x1b[0m Could not auto-launch redis-server (${err.message}). Ensure Redis is running on port ${redisPort}.\n`);
		return {
			status: `NOT DETECTED (${hostToCheck}:${redisPort})`,
			process: null
		};
	}
}

/**
 * Checks whether PostgreSQL database server is running, and attempts to start it if not running.
 * Returns { status: string, process: ChildProcess | null }
 */
export async function ensurePostgresService(postgresPort = 5432, postgresHost = '127.0.0.1', writePostgresLog = null) {
	const hostToCheck = postgresHost === '0.0.0.0' ? '127.0.0.1' : postgresHost;
	const isAlreadyRunning = await isPortInUse(postgresPort, hostToCheck, 1500);

	if (isAlreadyRunning) {
		if (writePostgresLog) {
			writePostgresLog(
				'SYSTEM',
				`Existing PostgreSQL database detected running on ${hostToCheck}:${postgresPort}. Connected directly.`
			);
		}
		return {
			status: `RUNNING (Connected to ${hostToCheck}:${postgresPort})`,
			process: null
		};
	}

	if (writePostgresLog) {
		writePostgresLog('SYSTEM', `PostgreSQL not detected on port ${postgresPort}. Attempting auto-start...`);
	}

	const isWindows = process.platform === 'win32';
	let started = false;

	// 1. Try starting PostgreSQL service on Windows
	if (isWindows) {
		try {
			execSync('net start postgresql-x64-16 2>nul || net start postgresql-x64-15 2>nul || net start postgresql-x64-14 2>nul || net start postgresql 2>nul', {
				stdio: 'ignore'
			});
			started = true;
		} catch {}
	} else if (process.platform === 'darwin') {
		try {
			execSync('brew services start postgresql@16 || brew services start postgresql || brew services start postgresql@15', {
				stdio: 'ignore'
			});
			started = true;
		} catch {}
	} else if (process.platform === 'linux') {
		try {
			execSync('sudo systemctl start postgresql || systemctl start postgresql || service postgresql start', {
				stdio: 'ignore'
			});
			started = true;
		} catch {}
	}

	// 2. Fallback: Try docker compose for postgres container
	if (!started) {
		try {
			execSync('docker compose up -d postgres', {
				cwd: rootDir,
				stdio: 'ignore'
			});
			started = true;
		} catch {}
	}

	console.log('\n⏳ Waiting for PostgreSQL database server to become ready...');
	const isReady = await waitForPort(postgresPort, hostToCheck, 10000);

	if (isReady) {
		console.log(`\x1b[1;32m✅ [POSTGRES READY]\x1b[0m PostgreSQL database listening on port ${postgresPort}\n`);
		return {
			status: `RUNNING (Auto-started on ${hostToCheck}:${postgresPort})`,
			process: null
		};
	} else {
		if (writePostgresLog) {
			writePostgresLog('SYSTEM', `PostgreSQL server could not be auto-started on port ${postgresPort}.`);
		}
		console.warn(`\n\x1b[1;33m⚠️  [POSTGRES WARNING]\x1b[0m PostgreSQL server not detected on port ${postgresPort}. Ensure your PostgreSQL service or Docker container is running.\n`);
		return {
			status: `NOT DETECTED (${hostToCheck}:${postgresPort})`,
			process: null
		};
	}
}

/**
 * Polls a TCP port until a connection succeeds or timeout expires.
 * Used to ensure Lavalink has booted and is listening before spawning the bot.
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

// ---------------------------------------------------------------------------
// YouTube OAuth Token Persistence (Item 1C)
// Tokens are stored in .youtube-oauth.json (gitignored) with atomic writes.
// The .env file is NEVER modified at runtime.
// ---------------------------------------------------------------------------

/**
 * Loads a previously saved YouTube OAuth refresh token from .youtube-oauth.json
 * into process.env.YOUTUBE_REFRESH_TOKEN. Call this after loadEnv() and before
 * getLavalinkKeyStatus() / spawning Lavalink.
 *
 * If the .env already has a valid token, the file token is only used as a
 * fallback (env takes precedence so users can override via .env if desired).
 */
export function loadYouTubeToken() {
	const isLavalinkEnabled =
		(process.env.LAVA_ENABLED || process.env.ENABLE_LAVALINK)?.toLowerCase() ===
		'true';
	if (!isLavalinkEnabled) {
		return;
	}

	// If a valid token is already set (e.g. from .env), keep it
	const existing = process.env.YOUTUBE_REFRESH_TOKEN?.trim();
	if (existing && existing.startsWith('1/')) {
		return;
	}

	if (!fs.existsSync(youtubeOAuthPath)) return;

	try {
		const raw = fs.readFileSync(youtubeOAuthPath, 'utf-8');
		const data = JSON.parse(raw);
		if (data.refreshToken && typeof data.refreshToken === 'string' && data.refreshToken.startsWith('1/')) {
			process.env.YOUTUBE_REFRESH_TOKEN = data.refreshToken;
			console.log(
				`\x1b[1;32m✅ [YOUTUBE TOKEN LOADED]\x1b[0m Loaded YouTube OAuth refresh token from .youtube-oauth.json (saved ${data.savedAt || 'unknown date'})\n`
			);
		}
	} catch {
		// Corrupted file — ignore, Lavalink will re-prompt device flow
	}
}

export function clearYouTubeRefreshToken() {
	delete process.env.YOUTUBE_REFRESH_TOKEN;
	// Also remove the persisted file so a stale token isn't reloaded on next launch
	try {
		if (fs.existsSync(youtubeOAuthPath)) {
			fs.unlinkSync(youtubeOAuthPath);
		}
	} catch {}
}

/**
 * Checks for configured music API keys in process.env.
 * Returns boolean flags for youtube, spotify, and hasAny.
 * SoundCloud uses Lavalink's built-in free source — no keys needed.
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
	const hasAny = youtube || spotify;

	return {
		youtube,
		spotify,
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

/**
 * Saves a YouTube OAuth refresh token to .youtube-oauth.json using atomic
 * write (write to .tmp then rename) and sets it in process.env.
 * The .env file is NEVER modified.
 */
export function saveYouTubeRefreshToken(token) {
	if (!token || !token.startsWith('1/')) return;

	// Deduplicate: if the exact token is already active in memory, do nothing
	if (process.env.YOUTUBE_REFRESH_TOKEN === token) {
		return;
	}

	process.env.YOUTUBE_REFRESH_TOKEN = token;

	// Persist to dedicated file with atomic write
	const data = JSON.stringify(
		{ refreshToken: token, savedAt: new Date().toISOString() },
		null,
		2
	);
	const tmpPath = youtubeOAuthPath + '.tmp';
	try {
		fs.writeFileSync(tmpPath, data, 'utf-8');
		fs.renameSync(tmpPath, youtubeOAuthPath);
	} catch (err) {
		// If atomic rename fails (e.g. cross-device), try direct write
		try {
			fs.writeFileSync(youtubeOAuthPath, data, 'utf-8');
		} catch {}
	}

	const successBanner = `\n\x1b[1;32m====================================================================\x1b[0m\n\x1b[1;32m✅ [YOUTUBE REFRESH TOKEN CAPTURED & SAVED]\x1b[0m\n\x1b[1;36m Token:\x1b[0m ${token}\n\x1b[1;32m Persisted to .youtube-oauth.json (survives restart).\x1b[0m\n\x1b[1;32m====================================================================\x1b[0m\n\n`;
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

// ---------------------------------------------------------------------------
// Error Detection & Console Surfacing (Item 1D)
// ---------------------------------------------------------------------------

/** ANSI color codes keyed by log prefix */
const prefixColors = {
	'BOT':            '\x1b[1;31m',  // red
	'BOT-ERR':        '\x1b[1;31m',  // red
	'DASHBOARD':      '\x1b[1;35m',  // magenta
	'DASHBOARD-ERR':  '\x1b[1;35m',  // magenta
	'LAVALINK':       '\x1b[1;33m',  // yellow
	'LAVALINK-ERR':   '\x1b[1;33m',  // yellow
	'SYSTEM':         '\x1b[1;36m',  // cyan
};
const RESET = '\x1b[0m';

/**
 * Returns true if a log line represents an error that should be surfaced
 * in the terminal console. Stack trace continuation lines (e.g. "    at ...")
 * are excluded to keep console output compact — full stacks stay in log files.
 */
function isErrorLine(line) {
	const trimmed = line.trim();

	// Skip stack trace continuation lines — they belong in logs only
	if (trimmed.startsWith('at ') || trimmed.startsWith('Caused by:')) return false;

	// Skip common false positives in source code references
	if (trimmed.includes('error.cause') || trimmed.includes('errorFormatter') || trimmed.includes('error_handler')) return false;

	// Match actual error indicators
	return (
		/\bError\b/.test(trimmed) ||
		/\bERR\b/.test(trimmed) ||
		/\bFATAL\b/i.test(trimmed) ||
		/\bException\b/.test(trimmed) ||
		/exited with code/i.test(trimmed) ||
		/\bfailed\b/i.test(trimmed) && /\b(to|load|resolve|connect|start|build|compile)\b/i.test(trimmed) ||
		/\bcrash/i.test(trimmed) ||
		/ECONNREFUSED|ENOTFOUND|EACCES|EPERM/i.test(trimmed)
	);
}

/**
 * Returns true if a line represents a warning worth surfacing.
 */
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

			// Auto-capture YouTube OAuth refresh token output from youtube-plugin
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
				// DO NOT write sensitive auth info to disk log files!
				// Display directly in custom console output for the user:
				const authBanner = `\n\x1b[1;33m====================================================================\x1b[0m\n\x1b[1;32m🔑 [YOUTUBE OAUTH DEVICE AUTHENTICATION REQUIRED]\x1b[0m\n\x1b[1;36m Source:\x1b[0m [${prefix}]\n\x1b[1;37m ${line.trim()}\x1b[0m\n\x1b[1;33m====================================================================\x1b[0m\n\n`;
				process.stdout.write(authBanner);
			} else {
				const entry = `[${timestamp}] [${prefix}] ${line}\n`;
				fileStream.write(entry);
				combinedStream.write(entry);

				// Surface errors and warnings to the terminal console (Item 1D)
				const color = prefixColors[prefix] || '\x1b[1;37m';
				if (isErrorLine(line)) {
					process.stderr.write(`${color}⚠ [${prefix}]${RESET} \x1b[31m${line.trim()}${RESET}\n`);
				} else if (isWarnLine(line)) {
					process.stderr.write(`${color}⚡ [${prefix}]${RESET} \x1b[33m${line.trim()}${RESET}\n`);
				}
			}
		}
	};
}

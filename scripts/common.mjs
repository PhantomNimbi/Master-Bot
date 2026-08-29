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

export function isAuthInfo(line) {
	const lower = line.toLowerCase();
	return (
		line.includes('google.com/device') ||
		line.includes('https://www.google.com/device') ||
		line.includes('To authenticate') ||
		line.includes('enter code') ||
		(lower.includes('device') && lower.includes('code')) ||
		(lower.includes('oauth') && lower.includes('code')) ||
		lower.includes('user_code') ||
		lower.includes('verification_url') ||
		lower.includes('access_token') ||
		lower.includes('refresh_token') ||
		lower.includes('discord_token')
	);
}

export function createLogWriter(fileStream, combinedStream) {
	return function writeLog(prefix, data) {
		const timestamp = new Date().toISOString();
		const lines = data.toString().split(/\r?\n/);
		for (const line of lines) {
			if (!line.trim()) continue;

			if (isAuthInfo(line)) {
				// DO NOT write sensitive auth info to disk log files!
				// Display directly in custom console output for the user:
				const authBanner = `\n\x1b[1;33m====================================================================\x1b[0m\n\x1b[1;32m🔑 [DIRECT CONSOLE AUTHENTICATION PROMPT]\x1b[0m\n\x1b[1;36m Source:\x1b[0m [${prefix}]\n\x1b[1;37m ${line.trim()}\x1b[0m\n\x1b[1;33m====================================================================\x1b[0m\n\n`;
				process.stdout.write(authBanner);
			} else {
				const entry = `[${timestamp}] [${prefix}] ${line}\n`;
				fileStream.write(entry);
				combinedStream.write(entry);
			}
		}
	};
}

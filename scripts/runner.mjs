import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const logsDir = path.join(rootDir, 'logs');

// Load root .env if present
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

if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir, { recursive: true });
}

function extractPortFromUrl(urlStr, defaultPort) {
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

function freePort(port) {
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

export function runProcesses(mode = 'dev') {
	const botLogFile = path.join(logsDir, 'bot.log');
	const dashboardLogFile = path.join(logsDir, 'dashboard.log');
	const lavalinkLogFile = path.join(logsDir, 'lavalink.log');
	const combinedLogFile = path.join(logsDir, 'combined.log');

	const botStream = fs.createWriteStream(botLogFile, { flags: 'a' });
	const dashboardStream = fs.createWriteStream(dashboardLogFile, { flags: 'a' });
	const lavalinkStream = fs.createWriteStream(lavalinkLogFile, { flags: 'a' });
	const combinedStream = fs.createWriteStream(combinedLogFile, { flags: 'a' });

	function writeLogToFile(prefix, data, fileStream) {
		const timestamp = new Date().toISOString();
		const lines = data.toString().split(/\r?\n/);
		for (const line of lines) {
			if (!line.trim()) continue;
			const entry = `[${timestamp}] [${prefix}] ${line}\n`;
			fileStream.write(entry);
			combinedStream.write(entry);

			// Print YouTube OAuth device flow authentication prompts directly to terminal console
			const isDeviceFlow =
				line.includes('google.com/device') ||
				line.includes('https://www.google.com/device') ||
				(line.toLowerCase().includes('device') && line.toLowerCase().includes('code')) ||
				(line.toLowerCase().includes('oauth') && line.toLowerCase().includes('code')) ||
				line.includes('To authenticate') ||
				line.includes('enter code');

			if (isDeviceFlow) {
				const box = `\n\x1b[1;33m====================================================================\x1b[0m\n\x1b[1;32m🔑 [YOUTUBE OAUTH DEVICE AUTHENTICATION REQUIRED]\x1b[0m\n\x1b[1;37m   ${line.trim()}\x1b[0m\n\x1b[1;33m====================================================================\x1b[0m\n\n`;
				process.stdout.write(box);
			}
		}
	}

	const isWindows = process.platform === 'win32';
	const pnpmCmd = isWindows ? 'pnpm.cmd' : 'pnpm';

	const dashboardPort = process.env.PORT
		? parseInt(process.env.PORT, 10)
		: extractPortFromUrl(
				process.env.NEXTAUTH_URL_INTERNAL || process.env.NEXTAUTH_URL,
				3000
		  );
	const lavaHost = process.env.LAVA_HOST || '0.0.0.0';
	const lavaPort = parseInt(process.env.LAVA_PORT || '2333', 10);
	const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

	const isLavaExternal = process.env.LAVA_EXTERNAL?.toLowerCase() === 'true';

	// Free up configured ports before launching services
	writeLogToFile(
		'SYSTEM',
		`Clearing active processes on configured ports (Dashboard: ${dashboardPort}, Redis: ${redisPort}${
			isLavaExternal ? '' : `, Lavalink: ${lavaPort}`
		})...`,
		combinedStream
	);

	freePort(dashboardPort);
	freePort(redisPort);
	if (!isLavaExternal) {
		freePort(lavaPort);
	}

	let lavalinkStatus = 'SKIPPED';
	let lavalinkProcess = null;

	// 1. Check & Launch Lavalink Server
	if (isLavaExternal) {
		lavalinkStatus = `EXTERNAL (${lavaHost}:${lavaPort})`;
		writeLogToFile(
			'SYSTEM',
			`LAVA_EXTERNAL=true detected. Connecting to external Lavalink server at ${lavaHost}:${lavaPort}.`,
			lavalinkStream
		);
	} else {
		const jarPath = path.join(rootDir, 'Lavalink.jar');
		if (fs.existsSync(jarPath)) {
			lavalinkStatus = 'RUNNING (Internal)';
			writeLogToFile(
				'SYSTEM',
				`Launching internal Lavalink server from ${jarPath}...`,
				lavalinkStream
			);
			lavalinkProcess = spawn('java', ['-jar', 'Lavalink.jar'], { cwd: rootDir });
			lavalinkProcess.stdout.on('data', data =>
				writeLogToFile('LAVALINK', data, lavalinkStream)
			);
			lavalinkProcess.stderr.on('data', data =>
				writeLogToFile('LAVALINK-ERR', data, lavalinkStream)
			);
		} else {
			lavalinkStatus = `EXTERNAL/DOCKER (${lavaHost}:${lavaPort})`;
			writeLogToFile(
				'SYSTEM',
				'Lavalink.jar not found in root directory. Assuming external or Docker Lavalink instance.',
				lavalinkStream
			);
		}
	}

	// 2. Launch Bot
	const botArgs =
		mode === 'dev'
			? ['--filter', '@master-bot/bot', 'dev']
			: ['--filter', '@master-bot/bot', 'start'];
	const botProcess = spawn(pnpmCmd, botArgs, { cwd: rootDir, shell: isWindows });
	botProcess.stdout.on('data', data => writeLogToFile('BOT', data, botStream));
	botProcess.stderr.on('data', data => writeLogToFile('BOT-ERR', data, botStream));

	// 3. Launch Dashboard
	const dashboardArgs =
		mode === 'dev'
			? ['--filter', '@master-bot/dashboard', 'dev']
			: ['--filter', '@master-bot/dashboard', 'start'];
	const dashboardProcess = spawn(pnpmCmd, dashboardArgs, {
		cwd: rootDir,
		shell: isWindows
	});
	dashboardProcess.stdout.on('data', data =>
		writeLogToFile('DASHBOARD', data, dashboardStream)
	);
	dashboardProcess.stderr.on('data', data =>
		writeLogToFile('DASHBOARD-ERR', data, dashboardStream)
	);

	// Display Clean Terminal Status Banner (Console screen clearing removed so auth codes are never erased)
	console.log(`
====================================================================
               🤖 MASTER-BOT UNIFIED CONTROL PANEL                   
====================================================================
  Execution Mode:    ${mode.toUpperCase()}
  Lavalink Mode:     ${isLavaExternal ? 'EXTERNAL' : 'INTERNAL'} (${lavaHost}:${lavaPort})
  Configured Ports:  Dashboard: ${dashboardPort} | Redis: ${redisPort} | Lavalink: ${lavaPort}
  
  Active Services:
    • 🤖 Bot Service:       RUNNING  └─ Log: logs/bot.log
    • 🌐 Web Dashboard:      RUNNING (http://localhost:${dashboardPort})
                                     └─ Log: logs/dashboard.log
    • 🎵 Lavalink Audio:     ${lavalinkStatus}
                                     └─ Log: logs/lavalink.log
  
  Combined System Log: logs/combined.log
  Live Owner Web Logs: http://localhost:${dashboardPort}/dashboard/logs
====================================================================
  All console logs are piped to file. Press Ctrl+C to stop services.
====================================================================
`);

	function cleanup() {
		console.log('\n🛑 Shutting down Master-Bot services...');
		try {
			if (lavalinkProcess) lavalinkProcess.kill('SIGINT');
			botProcess.kill('SIGINT');
			dashboardProcess.kill('SIGINT');
		} catch {}
		botStream.end();
		dashboardStream.end();
		lavalinkStream.end();
		combinedStream.end();
		process.exit(0);
	}

	process.on('SIGINT', cleanup);
	process.on('SIGTERM', cleanup);
	process.on('SIGHUP', cleanup);
}

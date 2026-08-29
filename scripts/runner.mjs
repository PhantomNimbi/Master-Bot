import { spawn } from 'node:child_process';
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
		}
	}

	const isWindows = process.platform === 'win32';
	const pnpmCmd = isWindows ? 'pnpm.cmd' : 'pnpm';

	const isLavaExternal = process.env.LAVA_EXTERNAL?.toLowerCase() === 'true';
	const lavaHost = process.env.LAVA_HOST || '0.0.0.0';
	const lavaPort = process.env.LAVA_PORT || '2333';

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

	// Display Clean Terminal Status Banner (No raw logs to console)
	console.clear();
	console.log(`
====================================================================
               🤖 MASTER-BOT UNIFIED CONTROL PANEL                   
====================================================================
  Execution Mode:    ${mode.toUpperCase()}
  Lavalink Mode:     ${isLavaExternal ? 'EXTERNAL' : 'INTERNAL'} (${lavaHost}:${lavaPort})
  
  Active Services:
    • 🤖 Bot Service:       RUNNING  └─ Log: logs/bot.log
    • 🌐 Web Dashboard:      RUNNING (http://localhost:3000)
                                     └─ Log: logs/dashboard.log
    • 🎵 Lavalink Audio:     ${lavalinkStatus}
                                     └─ Log: logs/lavalink.log
  
  Combined System Log: logs/combined.log
  Live Owner Web Logs: http://localhost:3000/dashboard/logs
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

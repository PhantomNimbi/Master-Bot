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

	function logLine(prefix, data, fileStream) {
		const timestamp = new Date().toISOString();
		const lines = data.toString().split(/\r?\n/);
		for (const line of lines) {
			if (!line.trim()) continue;
			const formattedConsole = `[${timestamp}] [${prefix}] ${line}\n`;
			process.stdout.write(formattedConsole);
			fileStream.write(formattedConsole);
			combinedStream.write(formattedConsole);
		}
	}

	const isWindows = process.platform === 'win32';
	const pnpmCmd = isWindows ? 'pnpm.cmd' : 'pnpm';

	console.log(
		`🚀 Starting Master-Bot services (Lavalink, Bot, Dashboard) in ${mode.toUpperCase()} mode...`
	);
	console.log(`📁 Logs are being captured in: ${logsDir}`);

	// 1. Launch Lavalink Server check (LAVA_EXTERNAL)
	let lavalinkProcess = null;
	const isLavaExternal = process.env.LAVA_EXTERNAL?.toLowerCase() === 'true';

	if (isLavaExternal) {
		logLine(
			'SYSTEM',
			`LAVA_EXTERNAL=true detected. Skipping internal Lavalink launch and connecting to external server (${process.env.LAVA_HOST || '0.0.0.0'}:${process.env.LAVA_PORT || '2333'}).`,
			lavalinkStream
		);
	} else {
		const jarPath = path.join(rootDir, 'Lavalink.jar');
		if (fs.existsSync(jarPath)) {
			logLine('SYSTEM', `Launching internal Lavalink server from ${jarPath}...`, lavalinkStream);
			lavalinkProcess = spawn('java', ['-jar', 'Lavalink.jar'], { cwd: rootDir });
			lavalinkProcess.stdout.on('data', data => logLine('LAVALINK', data, lavalinkStream));
			lavalinkProcess.stderr.on('data', data => logLine('LAVALINK-ERR', data, lavalinkStream));
		} else {
			logLine(
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
	botProcess.stdout.on('data', data => logLine('BOT', data, botStream));
	botProcess.stderr.on('data', data => logLine('BOT-ERR', data, botStream));

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
		logLine('DASHBOARD', data, dashboardStream)
	);
	dashboardProcess.stderr.on('data', data =>
		logLine('DASHBOARD-ERR', data, dashboardStream)
	);

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

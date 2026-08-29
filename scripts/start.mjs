import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
	rootDir,
	logsDir,
	loadEnv,
	extractPortFromUrl,
	freePort,
	createLogWriter
} from './common.mjs';

loadEnv();

if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir, { recursive: true });
}

const botLogFile = path.join(logsDir, 'bot.log');
const dashboardLogFile = path.join(logsDir, 'dashboard.log');
const lavalinkLogFile = path.join(logsDir, 'lavalink.log');
const combinedLogFile = path.join(logsDir, 'combined.log');

const botStream = fs.createWriteStream(botLogFile, { flags: 'a' });
const dashboardStream = fs.createWriteStream(dashboardLogFile, { flags: 'a' });
const lavalinkStream = fs.createWriteStream(lavalinkLogFile, { flags: 'a' });
const combinedStream = fs.createWriteStream(combinedLogFile, { flags: 'a' });

const writeBotLog = createLogWriter(botStream, combinedStream);
const writeDashboardLog = createLogWriter(dashboardStream, combinedStream);
const writeLavalinkLog = createLogWriter(lavalinkStream, combinedStream);

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

// Free up configured ports before launching production services
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
	writeLavalinkLog(
		'SYSTEM',
		`LAVA_EXTERNAL=true detected. Connecting to external Lavalink server at ${lavaHost}:${lavaPort}.`
	);
} else {
	const jarPath = path.join(rootDir, 'Lavalink.jar');
	if (fs.existsSync(jarPath)) {
		lavalinkStatus = 'RUNNING (Internal)';
		writeLavalinkLog(
			'SYSTEM',
			`Launching internal Lavalink server from ${jarPath}...`
		);
		lavalinkProcess = spawn('java', ['-jar', 'Lavalink.jar'], { cwd: rootDir });
		lavalinkProcess.stdout.on('data', data => writeLavalinkLog('LAVALINK', data));
		lavalinkProcess.stderr.on('data', data => writeLavalinkLog('LAVALINK-ERR', data));
	} else {
		lavalinkStatus = `EXTERNAL/DOCKER (${lavaHost}:${lavaPort})`;
		writeLavalinkLog(
			'SYSTEM',
			'Lavalink.jar not found in root directory. Assuming external or Docker Lavalink instance.'
		);
	}
}

// 2. Launch Bot in START (Production) mode
const botProcess = spawn(pnpmCmd, ['--filter', '@master-bot/bot', 'start'], {
	cwd: rootDir,
	shell: isWindows
});
botProcess.stdout.on('data', data => writeBotLog('BOT', data));
botProcess.stderr.on('data', data => writeBotLog('BOT-ERR', data));

// 3. Launch Dashboard in START (Production) mode
const dashboardProcess = spawn(
	pnpmCmd,
	['--filter', '@master-bot/dashboard', 'start'],
	{
		cwd: rootDir,
		shell: isWindows
	}
);
dashboardProcess.stdout.on('data', data => writeDashboardLog('DASHBOARD', data));
dashboardProcess.stderr.on('data', data => writeDashboardLog('DASHBOARD-ERR', data));

// Display Clean Terminal Status Banner
console.log(`
====================================================================
           🤖 MASTER-BOT UNIFIED CONSOLE (PRODUCTION)               
====================================================================
  Execution Mode:    PRODUCTION
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
  🔑 NOTE: YouTube OAuth / Device Auth prompts are output DIRECTLY 
  to this console. They are stripped & excluded from log files.
====================================================================
`);

function cleanup() {
	console.log('\n🛑 Shutting down Master-Bot production services...');
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

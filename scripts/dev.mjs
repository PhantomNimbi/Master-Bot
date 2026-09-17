import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import {
	rootDir,
	logsDir,
	loadEnv,
	extractPort,
	freePort,
	killProcessTree,
	checkJavaVersion,
	loadYouTubeToken,
	createLogWriter
} from './common.mjs';

loadEnv();
loadYouTubeToken();

if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir, { recursive: true });
}

const isParallel = process.argv.includes('--parallel') || process.env.DEV_PARALLEL === 'true';

const port = extractPort(process.env.PORT || process.env.INTERNAL_URL || '3000', 3000);
freePort(port);

const isLavalinkEnabled = (process.env.LAVA_ENABLED || 'true').toLowerCase() === 'true';
const isLavaExternal = process.env.LAVA_EXTERNAL === 'true';

if (isLavalinkEnabled && !isLavaExternal) {
	const javaCheck = checkJavaVersion();
	if (!javaCheck.ok) {
		console.warn(`\x1b[1;33m⚠️  [JAVA NOTICE]\x1b[0m ${javaCheck.error}`);
	}
}

const botStream = fs.createWriteStream(path.join(logsDir, 'bot.log'), { flags: 'w' });
const dashboardStream = fs.createWriteStream(path.join(logsDir, 'dashboard.log'), { flags: 'w' });
const combinedStream = fs.createWriteStream(path.join(logsDir, 'combined.log'), { flags: 'w' });

const writeBotLog = createLogWriter(botStream, combinedStream);
const writeDashboardLog = createLogWriter(dashboardStream, combinedStream);

let botProcess = null;
let dashboardProcess = null;

if (isParallel) {
	process.env.DISABLE_INTERNAL_DASHBOARD = 'true';

	botProcess = spawn('pnpm --filter @master-bot/bot dev', {
		cwd: rootDir,
		shell: true,
		env: { ...process.env, NODE_ENV: 'development' }
	});
	botProcess.stdout?.on('data', (data) => writeBotLog('BOT', data));
	botProcess.stderr?.on('data', (data) => writeBotLog('BOT-ERR', data));

	dashboardProcess = spawn('pnpm --filter @master-bot/dashboard dev', {
		cwd: rootDir,
		shell: true,
		env: { ...process.env, NODE_ENV: 'development' }
	});
	dashboardProcess.stdout?.on('data', (data) => writeDashboardLog('DASHBOARD', data));
	dashboardProcess.stderr?.on('data', (data) => writeDashboardLog('DASHBOARD-ERR', data));
} else {
	botProcess = spawn('pnpm --filter @master-bot/bot dev', {
		cwd: rootDir,
		shell: true,
		env: { ...process.env, NODE_ENV: 'development' }
	});
	botProcess.stdout?.on('data', (data) => writeBotLog('BOT', data));
	botProcess.stderr?.on('data', (data) => writeBotLog('BOT-ERR', data));
}

function cleanup() {
	console.log('\n🛑 Shutting down Master-Bot development services...');
	try {
		if (botProcess) killProcessTree(botProcess);
		if (dashboardProcess) killProcessTree(dashboardProcess);
	} catch {}
	try {
		botStream.end();
		dashboardStream.end();
		combinedStream.end();
	} catch {}
	process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('SIGHUP', cleanup);
process.on('exit', cleanup);

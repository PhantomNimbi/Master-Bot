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
const combinedStream = fs.createWriteStream(path.join(logsDir, 'combined.log'), { flags: 'w' });

const writeBotLog = createLogWriter(botStream, combinedStream);

console.log(
	'\x1b[1;36m\n' +
		'╔══════════════════════════════════════════════════════════════╗\n' +
		'║              🤖  Master-Bot  —  PRODUCTION MODE              ║\n' +
		'╚══════════════════════════════════════════════════════════════╝\x1b[0m\n' +
		`\x1b[90m  Logs → ${logsDir}\x1b[0m\n`
);

let botProcess = null;

botProcess = spawn('pnpm --filter @master-bot/bot start', {
	cwd: rootDir,
	shell: true,
	env: { ...process.env, NODE_ENV: 'production' }
});

botProcess.stdout?.on('data', (data) => writeBotLog('BOT', data));
botProcess.stderr?.on('data', (data) => writeBotLog('BOT-ERR', data));

botProcess.on('exit', (code, signal) => {
	if (code !== 0 && signal !== 'SIGTERM' && signal !== 'SIGINT') {
		console.error(
			`\x1b[1;31m✗ [BOT] Process exited unexpectedly (code=${code ?? 'null'}, signal=${signal ?? 'none'})\x1b[0m`
		);
	}
	cleanup(false);
});

let cleaningUp = false;
function cleanup(shouldExit = true) {
	if (cleaningUp) return;
	cleaningUp = true;

	console.log('\n\x1b[1;33m🛑 Shutting down Master-Bot production services...\x1b[0m');
	try {
		if (botProcess) killProcessTree(botProcess);
	} catch {}
	try {
		botStream.end();
		combinedStream.end();
	} catch {}
	if (shouldExit) process.exit(0);
}

process.on('SIGINT', () => cleanup(true));
process.on('SIGTERM', () => cleanup(true));
process.on('SIGHUP', () => cleanup(true));

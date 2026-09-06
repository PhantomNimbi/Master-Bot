import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
	rootDir,
	logsDir,
	loadEnv,
	loadYouTubeToken,
	freePort,
	isPortInUse,
	ensureSqliteDatabase,
	waitForPort,
	checkJavaVersion,
	getLavalinkKeyStatus,
	getLavalinkJavaArgs,
	createLogWriter,
	killProcessTree
} from './common.mjs';

loadEnv();

const isLavalinkEnabled =
	(process.env.LAVA_ENABLED || process.env.ENABLE_LAVALINK)?.toLowerCase() ===
	'true';

if (isLavalinkEnabled) {
	loadYouTubeToken();
}

const keyStatus = getLavalinkKeyStatus();

if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir, { recursive: true });
}

const botLogFile = path.join(logsDir, 'bot.log');
const lavalinkLogFile = path.join(logsDir, 'lavalink.log');
const combinedLogFile = path.join(logsDir, 'combined.log');

const botStream = fs.createWriteStream(botLogFile, { flags: 'w' });
const lavalinkStream = fs.createWriteStream(lavalinkLogFile, { flags: 'w' });
const combinedStream = fs.createWriteStream(combinedLogFile, { flags: 'w' });

const writeBotLog = createLogWriter(botStream, combinedStream);
const writeLavalinkLog = createLogWriter(lavalinkStream, combinedStream);

// Single unified HTTP port for the embedded dashboard + OAuth2 callback server
// (HELIX alignment). NEXTAUTH_URL / NEXTAUTH_INTERNAL_URL auto-resolve from it.
let port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
if (isNaN(port) || port <= 0) port = 3000;

const lavaHost = process.env.LAVA_HOST || '0.0.0.0';
const lavaPort = parseInt(process.env.LAVA_PORT || '2333', 10);
const isLavaExternal = process.env.LAVA_EXTERNAL?.toLowerCase() === 'true';

// Free up the unified HTTP port and optional Lavalink port before launching
freePort(port);
if (!isLavaExternal && isLavalinkEnabled) {
	freePort(lavaPort);
}

// 1. Ensure SQLite Database is initialized (auto-created on first start)
const { status: sqliteStatus } = ensureSqliteDatabase();

let lavalinkStatus = 'DISABLED';
let lavalinkProcess = null;

// 2. Dynamic Service Check & Launch for Lavalink (only if LAVA_ENABLED=true)
const hostToCheck = lavaHost === '0.0.0.0' ? '127.0.0.1' : lavaHost;

if (!isLavalinkEnabled) {
	lavalinkStatus = 'DISABLED';
	writeLavalinkLog(
		'SYSTEM',
		'Lavalink audio engine launch SKIPPED: Audio engine is currently disabled.'
	);
} else {
	const isAlreadyRunning = await isPortInUse(lavaPort, hostToCheck, 1500);

	if (isAlreadyRunning) {
		lavalinkStatus = `RUNNING (Connected to existing instance on ${hostToCheck}:${lavaPort})`;
		writeLavalinkLog(
			'SYSTEM',
			`Existing Lavalink server detected running on ${hostToCheck}:${lavaPort}. Connected directly.`
		);
		console.log(
			`\n\x1b[1;32m✅ [LAVALINK ACTIVE]\x1b[0m Connected to existing Lavalink instance on port ${lavaPort}\n`
		);
	} else if (isLavaExternal) {
		lavalinkStatus = `EXTERNAL (${lavaHost}:${lavaPort})`;
		writeLavalinkLog(
			'SYSTEM',
			`LAVA_EXTERNAL=true set. Waiting for external Lavalink server at ${lavaHost}:${lavaPort}...`
		);
		const isReady = await waitForPort(lavaPort, hostToCheck, 25000);
		if (isReady) {
			console.log(
				`\x1b[1;32m✅ [EXTERNAL LAVALINK READY]\x1b[0m Connected to external Lavalink on port ${lavaPort}\n`
			);
		}
	} else if (!keyStatus.hasAny) {
		lavalinkStatus = 'DISABLED (No API Keys Configured)';
		writeLavalinkLog(
			'SYSTEM',
			'Lavalink server launch SKIPPED: No music API keys (YouTube or Spotify) provided in .env.'
		);
		console.log(
			'\n\x1b[1;33m⚠️  [LAVALINK DISABLED]\x1b[0m No music API keys configured in .env (YouTube or Spotify). Internal Lavalink server skipped.\n'
		);
	} else {
		const jarPath = path.join(rootDir, 'Lavalink.jar');
		if (fs.existsSync(jarPath)) {
			lavalinkStatus = 'RUNNING (Internal)';
			writeLavalinkLog(
				'SYSTEM',
				`Launching internal Lavalink server from ${jarPath}...`
			);
			const javaCheck = checkJavaVersion();
			if (!javaCheck.ok) {
				console.error(
					`\n\x1b[1;31m⚠️  [JAVA VERSION ERROR]\x1b[0m\n${javaCheck.error}\n`
				);
				lavalinkStatus = 'ERROR (Java missing or too old)';
			} else {
				if (javaCheck.version < 21) {
					console.warn(
						`\n\x1b[1;33m⚠️  [JAVA VERSION WARNING]\x1b[0m Java ${javaCheck.version} detected. Java 21 LTS is recommended for best stability.\n`
					);
				}
				const javaArgs = getLavalinkJavaArgs();
				lavalinkProcess = spawn('java', javaArgs, {
					cwd: rootDir,
					env: { ...process.env }
				});
				lavalinkProcess.stdout.on('data', data =>
					writeLavalinkLog('LAVALINK', data)
				);
				lavalinkProcess.stderr.on('data', data =>
					writeLavalinkLog('LAVALINK-ERR', data)
				);
				console.log(
					'\n⏳ Waiting for Lavalink audio engine to become ready...'
				);
				const isReady = await waitForPort(lavaPort, hostToCheck, 25000);
				if (isReady) {
					console.log(
						`\x1b[1;32m✅ [LAVALINK READY]\x1b[0m Audio engine listening on port ${lavaPort}\n`
					);
				}
			}
		} else {
			lavalinkStatus = `EXTERNAL/DOCKER (${lavaHost}:${lavaPort})`;
			writeLavalinkLog(
				'SYSTEM',
				'Lavalink.jar not found in root directory. Assuming external or Docker Lavalink instance.'
			);
		}
	}
}

// 3. Launch the SINGLE Master-Bot process (Discord client + embedded dashboard
//    + OAuth2 callback server) bound to the unified PORT.
const botProcess = spawn(`pnpm --filter @master-bot/bot dev`, {
	cwd: rootDir,
	shell: true,
	env: {
		...process.env,
		PORT: String(port),
		BOT_PORT: String(port),
		DASHBOARD_PORT: String(port)
	}
});
botProcess.stdout.on('data', data => writeBotLog('BOT', data));
botProcess.stderr.on('data', data => writeBotLog('BOT-ERR', data));

const oauthNote = isLavalinkEnabled
	? `
====================================================================
  🔑 NOTE: YouTube OAuth / Device Auth prompts are output DIRECTLY 
  to this console. Tokens are persisted in .youtube-oauth.json upon authorization.
====================================================================`
	: `
====================================================================`;

const baseUrl = `http://localhost:${port}`;
const dashboardPublicUrl = process.env.NEXTAUTH_URL?.trim();
const dashboardUrlDisplay = dashboardPublicUrl
	? `${baseUrl} | Public: ${dashboardPublicUrl}`
	: baseUrl;

const activeServices = [
	`    • 🤖 Master-Bot:          RUNNING (Discord client + embedded dashboard, Port: ${port}) └─ Log: logs/bot.log`,
	`    • 🌐 Web Dashboard:      ${dashboardUrlDisplay}\n                                     └─ /dashboard · OAuth2: /api/auth/callback/discord`,
	`    • 💾 SQLite Database:    ${sqliteStatus}`,
	`    • ⚡ In-Memory Queue:    ACTIVE (Zero external dependency)`
];

if (isLavalinkEnabled && !lavalinkStatus.startsWith('DISABLED')) {
	const cipherInfo =
		process.env.YOUTUBE_CIPHER_URL?.trim() || 'https://cipher.kikkia.dev/';
	activeServices.push(
		`    • 🎵 Lavalink Audio:     ${lavalinkStatus}\n                                     └─ Cipher: ${cipherInfo}\n                                     └─ Log: logs/lavalink.log`
	);
}

// Display Clean Terminal Status Banner
console.log(`
====================================================================
            🤖 MASTER-BOT UNIFIED CONSOLE (DEV)                     
====================================================================
  Execution Mode:    DEVELOPMENT
  Unified Port:      ${port}${isLavalinkEnabled ? ` | Lavalink: ${lavaPort}` : ''}
  
  Active Services:
${activeServices.join('\n')}
  
  Combined System Log: logs/combined.log
  Live Owner Web Logs: ${baseUrl}/dashboard${oauthNote}
`);

function cleanup() {
	console.log('\n🛑 Shutting down Master-Bot dev services...');
	try {
		if (lavalinkProcess) killProcessTree(lavalinkProcess);
		killProcessTree(botProcess);
	} catch {}
	botStream.end();
	lavalinkStream.end();
	combinedStream.end();
	process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('SIGHUP', cleanup);
process.on('exit', cleanup);
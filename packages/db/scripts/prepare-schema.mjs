import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env file if DB_URI is not set
const rootDir = path.resolve(__dirname, '../../..');
const envPath = path.join(rootDir, '.env');
const examplePath = path.join(rootDir, '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
	try {
		fs.copyFileSync(examplePath, envPath);
		console.log('[prepare-schema] Created .env from .env.example');
	} catch (err) {
		console.warn('[prepare-schema] Could not copy .env.example:', err.message);
	}
}

if (fs.existsSync(envPath)) {
	try {
		const envContent = fs.readFileSync(envPath, 'utf8');
		for (const line of envContent.split('\n')) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;
			const eqIdx = trimmed.indexOf('=');
			if (eqIdx !== -1) {
				const key = trimmed.slice(0, eqIdx).trim();
				let val = trimmed.slice(eqIdx + 1).trim();
				if (
					(val.startsWith('"') && val.endsWith('"')) ||
					(val.startsWith("'") && val.endsWith("'"))
				) {
					val = val.slice(1, -1);
				}
				if (!process.env[key]) {
					process.env[key] = val;
				}
			}
		}
	} catch (err) {
		console.warn('[prepare-schema] Could not parse .env:', err.message);
	}
}

// Guarantee DB_URI default if unset
if (!process.env.DB_URI) {
	process.env.DB_URI = 'file:/data/db.sqlite';
}

const rawDbUrl = process.env.DB_URI?.trim() || '';
const isPostgres =
	rawDbUrl.startsWith('postgresql:') || rawDbUrl.startsWith('postgres:');

const provider = isPostgres ? 'postgresql' : 'sqlite';

// If SQLite, ensure the storage directory exists and migrate legacy database if needed
if (!isPostgres) {
	try {
		const filePath = rawDbUrl.replace(/^file:/, '');
		const dir = path.dirname(filePath);
		if (dir && !fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
			console.log(`[prepare-schema] Created SQLite directory: ${dir}`);
		}

		// Backward-compatible migration: if target db.sqlite doesn't exist but legacy database.db exists, copy it
		if (path.basename(filePath) === 'db.sqlite' && !fs.existsSync(filePath)) {
			const legacyPath = path.join(dir, 'database.db');
			if (fs.existsSync(legacyPath)) {
				fs.copyFileSync(legacyPath, filePath);
				console.log(`[prepare-schema] Migrated legacy database from ${legacyPath} to ${filePath}`);
			}
		}
	} catch (e) {
		console.warn(`[prepare-schema] Note: could not ensure SQLite directory: ${e.message}`);
	}
}

const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');

const schemaContent = `generator client {
    provider = "prisma-client-js"
}

datasource db {
    provider = "${provider}"
    url      = env("DB_URI")
}

// Necessary for Next auth
model Account {
    id                String  @id @default(cuid())
    userId            String  @unique
    type              String
    provider          String
    providerAccountId String
    refresh_token     String? ${isPostgres ? '@db.Text' : '// @db.Text'}
    access_token      String? ${isPostgres ? '@db.Text' : '// @db.Text'}
    expires_at        Int?
    token_type        String?
    scope             String?
    id_token          String? ${isPostgres ? '@db.Text' : '// @db.Text'}
    session_state     String?
    user              User    @relation(fields: [userId], references: [id])

    @@unique([provider, providerAccountId])
}

model Session {
    id           String   @id @default(cuid())
    sessionToken String   @unique
    userId       String
    expires      DateTime
    user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
    id            String     @id @default(cuid())
    name          String?
    discordId     String     @unique
    email         String?    @unique
    emailVerified DateTime?
    image         String?
    account       Account?
    sessions      Session[]
    playlists     Playlist[]
    guilds        Guild[]
    members       GuildMember[]
    reminders     Reminder[]
    timeOffset    Int?
}

model VerificationToken {
    identifier String
    token      String   @unique
    expires    DateTime

    @@unique([identifier, token])
}

model Song {
    id         Int      @id @default(autoincrement())
    length     Int
    track      String
    identifier String
    author     String
    isStream   Boolean
    position   Int
    title      String
    uri        String
    isSeekable Boolean
    sourceName String
    thumbnail  String
    added      Int
    playlistId Int
    playlist   Playlist @relation(fields: [playlistId], references: [id], onDelete: Cascade)
}

model Playlist {
    id        Int      @id @default(autoincrement())
    createdAt DateTime @default(now())
    name      String
    guildId   String   @map("guild_id")
    guild     Guild    @relation(fields: [guildId], references: [id], onDelete: Cascade)
    userId    String?
    user      User?    @relation(fields: [userId], references: [id])
    songs     Song[]

    @@unique([userId, guildId, name])
}

model Guild {
    id                    String        @id
    name                  String
    added                 DateTime      @default(now())
    volume                Int           @default(100)
    notifyList            String
    ownerId               String
    owner                 User          @relation(fields: [ownerId], references: [discordId])
    // Settings
    disabledCommands      String        @map("disabled_commands")
    logChannel            String?       @map("log_channel")
    logChannelEnabled     Boolean       @default(false) @map("log_channel_enabled")
    logEvents             String        @map("log_events")
    welcomeMessageChannel String?       @map("welcome_message_channel")
    welcomeMessage        String?       @map("welcome_message")
    welcomeMessageEnabled Boolean       @default(false) @map("welcome_message_enabled")
    // Support Tickets
    ticketChannel           String?       @map("ticket_channel")
    ticketTranscriptChannel String?       @map("ticket_transcript_channel")
    ticketRoleId            String?       @map("ticket_role_id")
    ticketEnabled           Boolean       @default(false) @map("ticket_enabled")
    ticketMessage           String?       @map("ticket_message")
    tickets               Ticket[]
    // Temp Channels
    hub                   String?
    hubChannel            String?       @map("hub_channel") // The channel that users enter to get redirected
    tempChannels          TempChannel[]
    members               GuildMember[]
    playlists             Playlist[]
    reminders             Reminder[]    @relation("ReminderGuild")
}

model Ticket {
    id        String    @id @default(cuid())
    guildId   String    @map("guild_id")
    guild     Guild     @relation(fields: [guildId], references: [id])
    threadId  String    @unique @map("thread_id")
    creatorId String    @map("creator_id")
    closed    Boolean   @default(false)
    createdAt DateTime  @default(now()) @map("created_at")
    closedAt  DateTime? @map("closed_at")
}

model TempChannel {
    id      String @id
    guildId String
    guild   Guild  @relation(fields: [guildId], references: [id])
    ownerId String @unique
}

model GuildMember {
    guildId  String
    userId   String
    joinedAt DateTime @default(now()) @map("joined_at")
    guild    Guild    @relation(fields: [guildId], references: [id], onDelete: Cascade)
    user     User     @relation(fields: [userId], references: [discordId], onDelete: Cascade)

    @@id([guildId, userId])
}

model TwitchNotify {
    twitchId   String   @id
    logo       String
    live       Boolean  @default(false)
    channelIds String
    sent       Boolean
}

model YouTubeNotify {
    channelId    String   @id
    channelTitle String
    logo         String?
    lastVideoId  String?
    lastStreamId String?
    isLive       Boolean  @default(false)
    channelIds   String   // JSON array of { channelId: string, alertType: string }
}

model Reminder {
    id          Int      @id @default(autoincrement())
    createdAt   DateTime @default(now())
    repeat      String?
    event       String
    description String?
    dateTime    String
    userId      String
    user        User?    @relation(fields: [userId], references: [discordId])
    guildId     String   @map("guild_id")
    guild       Guild    @relation("ReminderGuild", fields: [guildId], references: [id], onDelete: Cascade)
    timeOffset  Int
}
`;

fs.writeFileSync(schemaPath, schemaContent, 'utf8');
console.log(
	`[packages/db] Prepared Prisma schema for: ${isPostgres ? 'PostgreSQL (External)' : 'SQLite (Internal Fallback)'}`
);

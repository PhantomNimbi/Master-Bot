import { Collection } from 'discord.js';
import { existsSync, readFileSync } from 'fs';
import type { Redis, RedisKey } from 'ioredis';
import { join, resolve } from 'path';
import { Queue } from './Queue';
import type { QueueClient } from './QueueClient';
import Logger from '../../logger';

interface RedisCommand {
	name: string;
	keys: number;
}

const commands: RedisCommand[] = [
	{
		name: 'lmove',
		keys: 1
	},
	{
		name: 'lremat',
		keys: 1
	},
	{
		name: 'lshuffle',
		keys: 1
	},
	{
		name: 'rpopset',
		keys: 2
	}
];

//@ts-ignore
export interface ExtendedRedis extends Redis {
	lmove: (key: RedisKey, from: number, to: number) => Promise<'OK'>;
	lremat: (key: RedisKey, index: number) => Promise<'OK'>;
	lshuffle: (key: RedisKey, seed: number) => Promise<'OK'>;
	rpopset: (source: RedisKey, destination: RedisKey) => Promise<string | null>;
}

function getLuaScript(name: string): string {
	const candidates = [
		resolve(join(__dirname, '..', '..', '..'), 'audio', `${name}.lua`),
		resolve(
			join(__dirname, '..', '..', '..'),
			'scripts',
			'audio',
			`${name}.lua`
		),
		resolve(process.cwd(), 'scripts', 'audio', `${name}.lua`),
		resolve(process.cwd(), 'dist', 'audio', `${name}.lua`),
		resolve(process.cwd(), 'apps', 'bot', 'scripts', 'audio', `${name}.lua`)
	];

	for (const candidate of candidates) {
		if (existsSync(candidate)) {
			return readFileSync(candidate, 'utf-8');
		}
	}
	Logger.error(`Could not find Lua script ${name}.lua`);
	return '';
}

export class QueueStore extends Collection<string, Queue> {
	public redis: ExtendedRedis;

	public constructor(
		public readonly client: QueueClient,
		redis: Redis
	) {
		super();
		this.redis = redis as any;
		// Redis Errors
		redis.on('error', err => {
			Logger.error('Redis ' + err);
		});

		for (const command of commands) {
			const luaCode = getLuaScript(command.name);
			if (luaCode) {
				this.redis.defineCommand(command.name, {
					numberOfKeys: command.keys,
					lua: luaCode
				});
			}
		}
	}

	public get(key: string): Queue {
		let queue = super.get(key);
		if (!queue) {
			queue = new Queue(this, key);
			this.set(key, queue);
		}
		return queue;
	}

	public async start() {
		const guilds = await this.getPlayingEntries();
		await Promise.all(guilds.map(guild => this.get(guild).start()));
	}

	private async getPlayingEntries(): Promise<string[]> {
		const guilds = new Set<string>();

		let cursor = '0';
		do {
			const response = await this.redis.scan(
				cursor,
				'MATCH',
				'music.*.position'
			);
			[cursor] = response;

			for (const key of response[1]) {
				const id = key.slice(8, -2);
				guilds.add(id);
			}
		} while (cursor !== '0');

		return [...guilds];
	}
}

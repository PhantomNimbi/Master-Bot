import Redis from 'ioredis';
import type { RedisOptions } from 'ioredis';
import { LavalinkManager, LavalinkNodeOptions } from 'lavalink-client';
import { QueueStore } from './QueueStore';
import { container } from '@sapphire/framework';

export interface QueueClientOptions {
	redis: Redis | RedisOptions;
	node: LavalinkNodeOptions;
	clientId?: string;
}

export class QueueClient extends LavalinkManager {
	public readonly queues: QueueStore;

	public constructor(options: QueueClientOptions) {
		super({
			nodes: [options.node],
			sendToShard: (guildId, payload) => {
				container.client.guilds.cache.get(guildId)?.shard?.send(payload);
			},
			client: {
				id: options.clientId || process.env.DISCORD_CLIENT_ID || '',
				username: 'Master-Bot'
			}
		});

		this.queues = new QueueStore(
			this,
			options.redis instanceof Redis ? options.redis : new Redis(options.redis)
		);
	}

	public override destroyPlayer(guildId: string, destroyReason?: string) {
		return super.destroyPlayer(guildId, destroyReason);
	}
}

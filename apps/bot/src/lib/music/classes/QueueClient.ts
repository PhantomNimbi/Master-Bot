import { LavalinkManager, LavalinkNodeOptions } from 'lavalink-client';
import { QueueStore } from './QueueStore.js';
import { container } from '@sapphire/framework';

export interface QueueClientOptions {
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

		this.queues = new QueueStore(this);

		const patchNode = (node: any) => {
			const originalUpdatePlayer = node.updatePlayer.bind(node);
			node.updatePlayer = async (data: any) => {
				if (data?.playerOptions?.voice && !data.playerOptions.voice.channelId) {
					const player = this.getPlayer(data.guildId);
					data.playerOptions.voice.channelId =
						player?.voiceChannelId || player?.options?.voiceChannelId || '';
				}
				return originalUpdatePlayer(data);
			};
		};

		for (const node of this.nodeManager.nodes.values()) {
			patchNode(node);
		}
		this.nodeManager.on('create', node => patchNode(node));
	}

	public override destroyPlayer(guildId: string, destroyReason?: string) {
		return super.destroyPlayer(guildId, destroyReason);
	}
}


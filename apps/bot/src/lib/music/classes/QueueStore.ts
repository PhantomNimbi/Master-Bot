import { Collection } from 'discord.js';
import { Queue } from './Queue.js';
import type { QueueClient } from './QueueClient.js';

export class QueueStore extends Collection<string, Queue> {
	public constructor(public readonly client: QueueClient) {
		super();
	}

	public override get(key: string): Queue {
		let queue = super.get(key);
		if (!queue) {
			queue = new Queue(this, key);
			this.set(key, queue);
		}
		return queue;
	}

	public async start() {
		await Promise.all(this.map(queue => queue.start()));
	}
}


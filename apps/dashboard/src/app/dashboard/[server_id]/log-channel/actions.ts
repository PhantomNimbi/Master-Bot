'use server';

import { prisma } from '@master-bot/db';
import { revalidatePath } from 'next/cache';

export async function toggleLogChannel(status: boolean, server_id: string) {
	await prisma.guild.update({
		where: {
			id: server_id
		},
		data: {
			logChannelEnabled: status
		}
	});

	revalidatePath(`/dashboard/${server_id}/log-channel`);
	revalidatePath(`/dashboard/${server_id}`);
}

export async function updateLogEvents(events: string[], server_id: string) {
	await prisma.guild.update({
		where: {
			id: server_id
		},
		data: {
			logEvents: JSON.stringify(events)
		}
	});

	revalidatePath(`/dashboard/${server_id}/log-channel`);
	revalidatePath(`/dashboard/${server_id}`);
}

export async function setLogChannel(
	channelId: string | null,
	server_id: string
) {
	await prisma.guild.update({
		where: {
			id: server_id
		},
		data: {
			logChannel: channelId,
			logChannelEnabled: Boolean(channelId)
		}
	});

	revalidatePath(`/dashboard/${server_id}/log-channel`);
	revalidatePath(`/dashboard/${server_id}`);
}

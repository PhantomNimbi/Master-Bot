'use server';
import { prisma } from '@master-bot/db';
import { revalidatePath } from 'next/cache';

export async function toggleCommand(
	guildId: string,
	commandId: string,
	newStatus: boolean
) {
	const guild = await prisma.guild.findUnique({
		where: {
			id: guildId
		},
		select: {
			disabledCommands: true
		}
	});

	if (!guild) {
		throw new Error('Guild not found');
	}

	let disabledCommands: string[] = [];
	try {
		disabledCommands = JSON.parse(guild.disabledCommands || '[]');
	} catch {
		disabledCommands = [];
	}

	// newStatus === enabled: remove from the disabled list, otherwise add it
	const updated = newStatus
		? disabledCommands.filter(id => id !== commandId)
		: [...disabledCommands, commandId];

	await prisma.guild.update({
		where: {
			id: guildId
		},
		data: {
			disabledCommands: JSON.stringify(updated)
		}
	});

	revalidatePath(`/dashboard/${guildId}/commands`);
}
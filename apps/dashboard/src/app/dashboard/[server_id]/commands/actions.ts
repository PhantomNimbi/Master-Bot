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

	const currentList: string[] = Array.isArray(guild.disabledCommands)
		? guild.disabledCommands
		: JSON.parse(guild.disabledCommands ?? '[]');

	let updatedList: string[];
	if (newStatus) {
		updatedList = currentList.filter(id => id !== commandId);
	} else {
		updatedList = Array.from(new Set([...currentList, commandId]));
	}

	await prisma.guild.update({
		where: {
			id: guildId
		},
		data: {
			disabledCommands: JSON.stringify(updatedList)
		}
	});

	revalidatePath(`/dashboard/${guildId}/commands`);
}


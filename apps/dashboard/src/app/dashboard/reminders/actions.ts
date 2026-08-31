'use server';

import { auth } from '@master-bot/auth';
import { prisma } from '@master-bot/db';
import { revalidatePath } from 'next/cache';

export async function createReminder(formData: FormData) {
	const session = await auth();
	if (!session?.user) {
		throw new Error('Unauthorized');
	}
	const discordId = (session.user as any).discordId || session.user.id;

	const event = (formData.get('event') as string)?.trim();
	const description = (formData.get('description') as string)?.trim() || null;
	const dateTime = formData.get('dateTime') as string;

	if (!event) throw new Error('Event title is required');
	if (!dateTime) throw new Error('Date and time are required');

	const targetDate = new Date(dateTime);
	if (isNaN(targetDate.getTime()) || targetDate.getTime() <= Date.now()) {
		throw new Error('Please select a valid future date and time');
	}

	await prisma.reminder.create({
		data: {
			event,
			description,
			dateTime: targetDate.toISOString(),
			repeat: null,
			timeOffset: 0,
			user: { connect: { discordId } }
		}
	});

	revalidatePath('/dashboard/reminders');
}

export async function deleteReminder(formData: FormData) {
	const session = await auth();
	if (!session?.user) {
		throw new Error('Unauthorized');
	}
	const discordId = (session.user as any).discordId || session.user.id;

	const idStr = formData.get('id') as string;
	const id = parseInt(idStr, 10);

	if (isNaN(id)) throw new Error('Invalid reminder ID');

	await prisma.reminder.deleteMany({
		where: {
			id,
			userId: discordId
		}
	});

	revalidatePath('/dashboard/reminders');
}

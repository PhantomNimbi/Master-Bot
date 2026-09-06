'use server';

import { prisma } from '@master-bot/db';
import { revalidatePath } from 'next/cache';

async function sendTicketPanelRest(channelId: string, serverId: string) {
	const token = process.env.DISCORD_TOKEN;
	if (!token || !channelId) return;

	try {
		const guild = await prisma.guild.findUnique({
			where: { id: serverId },
			select: { name: true }
		});

		const payload = {
			embeds: [
				{
					title: `🎫 ${guild?.name ?? 'Server'} Support Tickets`,
					description:
						'Need help, have an inquiry, or want to speak with server staff?\n\n' +
						'Click the **Open Ticket** button below to create a private support thread with our moderation team.',
					color: 0x5865f2,
					footer: { text: 'Support Ticket System • Master-Bot' }
				}
			],
			components: [
				{
					type: 1,
					components: [
						{
							type: 2,
							style: 1,
							label: 'Open Ticket',
							custom_id: 'ticket_create',
							emoji: { name: '🎫' }
						}
					]
				}
			]
		};

		await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
			method: 'POST',
			headers: {
				Authorization: `Bot ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});
	} catch (err) {
		console.error('Failed to auto-send ticket panel via REST:', err);
	}
}

export async function toggleTicketSystem(status: boolean, server_id: string) {
	const guild = await prisma.guild.update({
		where: {
			id: server_id
		},
		data: {
			ticketEnabled: status
		}
	});

	if (status && guild.ticketChannel) {
		await sendTicketPanelRest(guild.ticketChannel, server_id);
	}

	revalidatePath(`/dashboard/${server_id}/tickets`);
	revalidatePath(`/dashboard/${server_id}`);
}

export async function setTicketChannel(
	channelId: string | null,
	server_id: string
) {
	await prisma.guild.update({
		where: {
			id: server_id
		},
		data: {
			ticketChannel: channelId,
			ticketEnabled: Boolean(channelId)
		}
	});

	if (channelId) {
		await sendTicketPanelRest(channelId, server_id);
	}

	revalidatePath(`/dashboard/${server_id}/tickets`);
	revalidatePath(`/dashboard/${server_id}`);
}

export async function setTicketMessage(data: FormData) {
	const guildId = data.get('guildId') as string;
	const message = data.get('message') as string;

	await prisma.guild.update({
		where: {
			id: guildId
		},
		data: {
			ticketMessage: message
		}
	});

	revalidatePath(`/dashboard/${guildId}/tickets`);
	revalidatePath(`/dashboard/${guildId}`);
}

export async function setTicketRole(roleId: string | null, server_id: string) {
	await prisma.guild.update({
		where: {
			id: server_id
		},
		data: {
			ticketRoleId: roleId
		}
	});

	revalidatePath(`/dashboard/${server_id}/tickets`);
	revalidatePath(`/dashboard/${server_id}`);
}

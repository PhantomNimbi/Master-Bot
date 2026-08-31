import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

const DEFAULT_PANEL_MESSAGE =
	'👋 Welcome to **{server}** Support!\n\n' +
	'Need assistance, have an inquiry, or want to speak with server staff?\n' +
	'• Please have any relevant screenshots, error logs, or details ready.\n' +
	'• A support representative or moderator will assist you shortly.\n\n' +
	'Click the **Open Ticket** button below to create your private support thread.';

async function postTicketPanel(
	channelId: string,
	guildName?: string,
	customMessage?: string | null
) {
	const token = process.env.DISCORD_TOKEN;
	if (!token || !channelId) return;

	try {
		const rawText =
			customMessage && customMessage.trim().length > 0
				? customMessage
				: DEFAULT_PANEL_MESSAGE;

		const description = rawText
			.replace(/\{server\}|\{guild\}/g, guildName || 'Server')
			.replace(/\{user\}|\{mention\}/g, 'you')
			.replace(/\{username\}/g, 'you');

		const payload = {
			embeds: [
				{
					title: `🎫 ${guildName || 'Server'} Support Tickets`,
					description,
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

		const res = await fetch(
			`https://discord.com/api/v10/channels/${channelId}/messages`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bot ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			}
		);

		if (!res.ok) {
			const errText = await res.text();
			console.error(
				`Failed to post ticket panel to Discord (HTTP ${res.status}):`,
				errText
			);
		}
	} catch (err) {
		console.error('Failed to post ticket panel:', err);
	}
}

export const ticketsRouter = createTRPCRouter({
	getConfig: publicProcedure
		.input(
			z.object({
				guildId: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { guildId } = input;

			const guild = await ctx.prisma.guild.findUnique({
				where: { id: guildId },
				select: {
					ticketChannel: true,
					ticketTranscriptChannel: true,
					ticketRoleId: true,
					ticketEnabled: true,
					ticketMessage: true
				}
			});

			const recentTickets = await ctx.prisma.ticket.findMany({
				where: { guildId },
				orderBy: { createdAt: 'desc' },
				take: 10
			});

			return { guild, recentTickets };
		}),

	setChannel: publicProcedure
		.input(
			z.object({
				guildId: z.string(),
				channelId: z.string().nullable()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { guildId, channelId } = input;

			const guild = await ctx.prisma.guild.update({
				where: { id: guildId },
				data: {
					ticketChannel: channelId,
					ticketEnabled: Boolean(channelId)
				}
			});

			if (channelId) {
				await postTicketPanel(channelId, guild.name, guild.ticketMessage);
			}

			return { guild };
		}),

	setTranscriptChannel: publicProcedure
		.input(
			z.object({
				guildId: z.string(),
				channelId: z.string().nullable()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { guildId, channelId } = input;

			const guild = await ctx.prisma.guild.update({
				where: { id: guildId },
				data: {
					ticketTranscriptChannel: channelId
				}
			});

			return { guild };
		}),

	setRole: publicProcedure
		.input(
			z.object({
				guildId: z.string(),
				roleId: z.string().nullable()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { guildId, roleId } = input;

			const guild = await ctx.prisma.guild.update({
				where: { id: guildId },
				data: {
					ticketRoleId: roleId
				}
			});

			return { guild };
		}),

	toggle: publicProcedure
		.input(
			z.object({
				guildId: z.string(),
				status: z.boolean()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { guildId, status } = input;

			const guild = await ctx.prisma.guild.update({
				where: { id: guildId },
				data: { ticketEnabled: status }
			});

			if (status && guild.ticketChannel) {
				await postTicketPanel(
					guild.ticketChannel,
					guild.name,
					guild.ticketMessage
				);
			}

			return { guild };
		}),

	setMessage: publicProcedure
		.input(
			z.object({
				guildId: z.string(),
				message: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { guildId, message } = input;

			const guild = await ctx.prisma.guild.update({
				where: { id: guildId },
				data: { ticketMessage: message }
			});

			if (guild.ticketChannel && guild.ticketEnabled) {
				await postTicketPanel(guild.ticketChannel, guild.name, message);
			}

			return { guild };
		}),

	createTicket: publicProcedure
		.input(
			z.object({
				guildId: z.string(),
				threadId: z.string(),
				creatorId: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { guildId, threadId, creatorId } = input;

			const ticket = await ctx.prisma.ticket.create({
				data: {
					guildId,
					threadId,
					creatorId
				}
			});

			return { ticket };
		}),

	closeTicket: publicProcedure
		.input(
			z.object({
				threadId: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { threadId } = input;

			const ticket = await ctx.prisma.ticket.update({
				where: { threadId },
				data: {
					closed: true,
					closedAt: new Date()
				}
			});

			return { ticket };
		}),

	getActiveTickets: publicProcedure
		.input(
			z.object({
				guildId: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { guildId } = input;

			const tickets = await ctx.prisma.ticket.findMany({
				where: { guildId, closed: false },
				orderBy: { createdAt: 'desc' }
			});

			return { tickets };
		})
});


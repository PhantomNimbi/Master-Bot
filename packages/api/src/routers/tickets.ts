import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

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


import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

export const reminderRouter = createTRPCRouter({
	getAll: publicProcedure.query(async ({ ctx }) => {
		const reminders = await ctx.prisma.reminder.findMany();

		return { reminders };
	}),
	getDueReminders: publicProcedure
		.input(
			z.object({
				beforeIsoDate: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const reminders = await ctx.prisma.reminder.findMany({
				where: {
					dateTime: {
						lte: input.beforeIsoDate
					}
				},
				orderBy: {
					dateTime: 'asc'
				}
			});

			return { reminders };
		}),
	getUserReminders: protectedProcedure.query(async ({ ctx }) => {
		const discordId = (ctx.session.user as any).discordId || ctx.session.user.id;

		const reminders = await ctx.prisma.reminder.findMany({
			where: {
				userId: discordId
			},
			orderBy: {
				dateTime: 'asc'
			}
		});

		return { reminders };
	}),
	createSessionReminder: protectedProcedure
		.input(
			z.object({
				event: z.string().min(1, 'Event title is required'),
				description: z.string().nullable().optional(),
				dateTime: z.string(),
				repeat: z.string().nullable().optional(),
				timeOffset: z.number().default(0)
			})
		)
		.mutation(async ({ ctx, input }) => {
			const discordId = (ctx.session.user as any).discordId || ctx.session.user.id;
			const { event, description, dateTime, repeat, timeOffset } = input;

			const reminder = await ctx.prisma.reminder.create({
				data: {
					event,
					description: description || null,
					dateTime,
					repeat: repeat || null,
					timeOffset,
					user: { connect: { discordId } }
				}
			});

			return { reminder };
		}),
	deleteSessionReminder: protectedProcedure
		.input(
			z.object({
				id: z.number().optional(),
				event: z.string().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const discordId = (ctx.session.user as any).discordId || ctx.session.user.id;
			const { id, event } = input;

			if (id) {
				const reminder = await ctx.prisma.reminder.deleteMany({
					where: {
						id,
						userId: discordId
					}
				});
				return { reminder };
			}

			if (event) {
				const reminder = await ctx.prisma.reminder.deleteMany({
					where: {
						event,
						userId: discordId
					}
				});
				return { reminder };
			}

			return { reminder: { count: 0 } };
		}),
	getReminder: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				event: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { userId, event } = input;

			const reminder = await ctx.prisma.reminder.findFirst({
				where: {
					userId,
					event
				},
				include: { user: true }
			});

			return { reminder };
		}),
	getByUserId: publicProcedure
		.input(
			z.object({
				userId: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { userId } = input;

			const reminders = await ctx.prisma.reminder.findMany({
				where: {
					userId
				},
				select: {
					id: true,
					event: true,
					dateTime: true,
					description: true
				},
				orderBy: {
					dateTime: 'asc'
				}
			});

			return { reminders };
		}),
	create: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				event: z.string(),
				description: z.nullable(z.string()),
				dateTime: z.string(),
				repeat: z.nullable(z.string()),
				timeOffset: z.number()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { userId, event, description, dateTime, repeat, timeOffset } =
				input;

			const reminder = await ctx.prisma.reminder.create({
				data: {
					event,
					description,
					dateTime,
					repeat,
					timeOffset,
					user: { connect: { discordId: userId } }
				}
			});

			return { reminder };
		}),
	delete: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				event: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { userId, event } = input;

			const reminder = await ctx.prisma.reminder.deleteMany({
				where: {
					userId,
					event
				}
			});

			return { reminder };
		})
});

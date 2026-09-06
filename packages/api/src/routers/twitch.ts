import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';

export const twitchRouter = createTRPCRouter({
	getAll: publicProcedure.query(async ({ ctx }) => {
		const rawNotifications = await ctx.prisma.twitchNotify.findMany();
		const notifications = rawNotifications.map(n => ({
			...n,
			channelIds: Array.isArray(n.channelIds)
				? n.channelIds
				: (JSON.parse(n.channelIds || '[]') as string[])
		}));

		return { notifications };
	}),
	findUserById: publicProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { id } = input;

			const notification = await ctx.prisma.twitchNotify.findFirst({
				where: {
					twitchId: id
				}
			});

			return {
				notification: notification
					? {
							...notification,
							channelIds: Array.isArray(notification.channelIds)
								? notification.channelIds
								: (JSON.parse(notification.channelIds || '[]') as string[])
					  }
					: null
			};
		}),
	create: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				userImage: z.string(),
				channelId: z.string(),
				sendTo: z.array(z.string())
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { userId, userImage, channelId, sendTo } = input;
			await ctx.prisma.twitchNotify.upsert({
				create: {
					twitchId: userId,
					channelIds: JSON.stringify([channelId]),
					logo: userImage,
					sent: false
				},
				update: { channelIds: JSON.stringify(sendTo) },
				where: { twitchId: userId }
			});
		}),
	updateNotification: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				channelIds: z.array(z.string())
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { userId, channelIds } = input;

			const notification = await ctx.prisma.twitchNotify.update({
				where: {
					twitchId: userId
				},
				data: {
					channelIds: JSON.stringify(channelIds)
				}
			});

			return { notification };
		}),
	delete: publicProcedure
		.input(
			z.object({
				userId: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { userId } = input;

			const notification = await ctx.prisma.twitchNotify.delete({
				where: {
					twitchId: userId
				}
			});

			return { notification };
		}),
	createViaTwitchNotification: publicProcedure
		.input(
			z.object({
				guildId: z.string(),
				userId: z.string(),
				ownerId: z.string(),
				name: z.string(),
				notifyList: z.array(z.string())
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { guildId, userId, ownerId, name, notifyList } = input;
			await ctx.prisma.guild.upsert({
				create: {
					id: guildId,
					notifyList: JSON.stringify([userId]),
					volume: 100,
					ownerId: ownerId,
					name: name
				},
				select: { notifyList: true },
				update: {
					notifyList: JSON.stringify(notifyList)
				},
				where: { id: guildId }
			});
		}),
	updateTwitchNotifications: publicProcedure
		.input(
			z.object({
				guildId: z.string(),
				notifyList: z.array(z.string())
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { guildId, notifyList } = input;

			await ctx.prisma.guild.update({
				where: { id: guildId },
				data: { notifyList: JSON.stringify(notifyList) }
			});
		}),
	updateNotificationStatus: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				live: z.boolean(),
				sent: z.boolean()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { live, sent, userId } = input;

			const notification = await ctx.prisma.twitchNotify.update({
				where: { twitchId: userId },
				data: { live, sent }
			});

			return { notification };
		})
});

import { TRPCError } from '@trpc/server';
import type { APIRole } from 'discord-api-types/v10';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const guildRouter = createTRPCRouter({
	getGuild: publicProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { id } = input;

			const guild = await ctx.prisma.guild.findUnique({
				where: {
					id
				}
			});

			return { guild };
		}),
	getAll: protectedProcedure.query(async ({ ctx }) => {
		// Read live guild data from bot's Redis session (icon + name)
		const liveGuilds: Record<string, { name: string; id: string; icon?: string | null }> = {};
		try {
			const redisGuilds = await ctx.redis.hgetall('guilds');
			for (const [guildId, dataStr] of Object.entries(redisGuilds)) {
				try {
					const data = JSON.parse(dataStr as string);
					liveGuilds[guildId] = { name: data.name, id: data.id, icon: data.icon || null };
				} catch {}
			}
		} catch {}

		// Fall back to SQLite for persistence
		const dbGuilds = await ctx.prisma.guild.findMany({
			orderBy: { name: 'asc' }
		});

		const merged = [...dbGuilds].map((g) => {
			const live = liveGuilds[g.id];
			if (live) {
				return { ...g, name: live.name, icon: live.icon };
			}
			return { ...g, icon: null };
		});

		return {
			guilds: merged,
			guildIds: merged.map(g => g.id)
		};
	}),
	create: publicProcedure
		.input(
			z.object({
				id: z.string(),
				ownerId: z.string(),
				name: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ownerId, name } = input;

			const guild = await ctx.prisma.guild.upsert({
				where: {
					id: id
				},
				update: {},
				create: {
					id: id,
					ownerId: ownerId,
					volume: 100,
					name: name,
					notifyList: '',
					disabledCommands: '',
					logEvents: ''
				}
			});

			// Sync to Redis live state
			try {
				await ctx.redis.hset('guilds', id, JSON.stringify({ name, id }));
			} catch {}

			return { guild };
		}),
	delete: publicProcedure
		.input(
			z.object({
				id: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id } = input;

			const guild = await ctx.prisma.guild.delete({
				where: {
					id: id
				}
			});

			// Remove from Redis live state
			try {
				await ctx.redis.hdel('guilds', id);
			} catch {}

			return { guild };
		}),
	updateVolume: publicProcedure
		.input(
			z.object({
				guildId: z.string(),
				volume: z.number()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { guildId, volume } = input;

			const guild = await ctx.prisma.guild.update({
				where: { id: guildId },
				data: { volume }
			});

			// Update Redis live state
			try {
				const existing = await ctx.redis.hget('guilds', guildId);
				if (existing) {
					const data = JSON.parse(existing);
					data.volume = volume;
					await ctx.redis.hset('guilds', guildId, JSON.stringify(data));
				}
			} catch {}

			return { guild };
		}),
	setLogChannel: publicProcedure
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
					logChannel: channelId,
					logChannelEnabled: Boolean(channelId)
				}
			});

			return { guild };
		}),
	toggleLogChannel: publicProcedure
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
				data: { logChannelEnabled: status }
			});

			return { guild };
		}),
	updateLogEvents: publicProcedure
		.input(
			z.object({
				guildId: z.string(),
				events: z.array(z.string())
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { guildId, events } = input;

			const guild = await ctx.prisma.guild.update({
				where: { id: guildId },
				data: { logEvents: JSON.stringify(events) }
			});

			return { guild };
		}),
	getLogConfig: publicProcedure
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
					logChannel: true,
					logChannelEnabled: true,
					logEvents: true
				}
			});

			return { guild };
		}),
	getRoles: publicProcedure
		.input(
			z.object({
				guildId: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const { guildId } = input;
			const token = process.env.DISCORD_TOKEN;

			if (!ctx.session) {
				throw new TRPCError({
					message: 'Not Authenticated',
					code: 'UNAUTHORIZED'
				});
			}

			const response = await fetch(
				`https://discord.com/api/guilds/${guildId}/roles`,
				{
					headers: {
						Authorization: `Bot ${token}`
					}
				}
			);

			const roles = (await response.json()) as APIRole[];

			return { roles };
		})
});
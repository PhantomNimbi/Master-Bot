import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { getFetch } from '@trpc/client';
import { createTRPCRouter, protectedProcedure } from '../trpc';

const fetch = getFetch();

const embedFieldSchema = z.object({
	name: z.string().min(1).max(256),
	value: z.string().min(1).max(1024),
	inline: z.boolean().optional().default(false)
});

const embedSchema = z.object({
	title: z.string().max(256).optional(),
	description: z.string().max(4096).optional(),
	url: z.string().url().optional().or(z.literal('')),
	color: z.number().optional().default(0x5865f2),
	fields: z.array(embedFieldSchema).max(25).optional().default([]),
	author: z
		.object({
			name: z.string().max(256),
			url: z.string().url().optional().or(z.literal('')),
			icon_url: z.string().url().optional().or(z.literal(''))
		})
		.optional(),
	footer: z
		.object({
			text: z.string().max(2048),
			icon_url: z.string().url().optional().or(z.literal(''))
		})
		.optional(),
	image: z.object({ url: z.string().url() }).optional(),
	thumbnail: z.object({ url: z.string().url() }).optional()
});

export const broadcastRouter = createTRPCRouter({
	// Send broadcast message to a guild channel
	sendBroadcast: protectedProcedure
		.input(
			z.object({
				guildId: z.string(),
				channelId: z.string(),
				content: z.string().max(2000).optional(),
				embed: embedSchema.optional()
			})
		)
		.mutation(async ({ input }) => {
			const token = process.env.DISCORD_TOKEN;
			if (!token) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Discord bot token not configured'
				});
			}

			const payload: Record<string, unknown> = {};
			if (input.content) payload.content = input.content;
			if (input.embed) {
				// Clean empty string URLs from embed
				const cleanEmbed: Record<string, unknown> = { ...input.embed };
				if (!cleanEmbed.url) delete cleanEmbed.url;
				payload.embeds = [cleanEmbed];
			}

			try {
				const response = await fetch(
					`https://discord.com/api/v10/channels/${input.channelId}/messages`,
					{
						method: 'POST',
						headers: {
							Authorization: `Bot ${token}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(payload)
					}
				);

				if (!response.ok) {
					const errText = await (response as any).text();
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: `Discord API Error: ${errText}`
					});
				}

				const message = (await (response as any).json()) as { id: string };
				return { success: true, messageId: message.id };
			} catch (err: unknown) {
				if (err instanceof TRPCError) throw err;
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message:
						err instanceof Error ? err.message : 'Failed to send broadcast'
				});
			}
		})
});

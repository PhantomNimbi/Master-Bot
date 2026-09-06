import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

export const musicRouter = createTRPCRouter({
	// Get player state & queue info for a guild
	getPlayerState: publicProcedure
		.input(
			z.object({
				guildId: z.string()
			})
		)
		.query(async ({ ctx, input }) => {
			const guild = await ctx.prisma.guild.findUnique({
				where: { id: input.guildId },
				select: {
					id: true,
					name: true,
					volume: true
				}
			});

			return {
				guildId: input.guildId,
				volume: guild?.volume ?? 100,
				isPlaying: false,
				isPaused: false,
				currentTrack: null as {
					title: string;
					author: string;
					length: number;
					position: number;
					uri: string;
					thumbnail?: string;
				} | null,
				queue: [] as {
					title: string;
					author: string;
					length: number;
					uri: string;
				}[],
				filters: {
					bassboost: false,
					nightcore: false,
					vaporwave: false,
					karaoke: false
				}
			};
		}),

	// Update volume setting in database
	setVolume: protectedProcedure
		.input(
			z.object({
				guildId: z.string(),
				volume: z.number().min(0).max(200)
			})
		)
		.mutation(async ({ ctx, input }) => {
			const updated = await ctx.prisma.guild.update({
				where: { id: input.guildId },
				data: { volume: input.volume }
			});

			return { success: true, volume: updated.volume };
		}),

	// User playlists with tracks for quick queuing
	getUserPlaylists: protectedProcedure.query(async ({ ctx }) => {
		const playlists = await ctx.prisma.playlist.findMany({
			where: {
				userId: ctx.session.user.id
			},
			include: {
				songs: true
			},
			orderBy: {
				name: 'asc'
			}
		});

		return { playlists };
	})
});

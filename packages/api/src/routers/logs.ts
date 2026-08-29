import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const logsRouter = createTRPCRouter({
	getLogs: protectedProcedure
		.input(
			z.object({
				type: z.enum(['bot', 'dashboard', 'lavalink', 'combined']).default('combined'),
				lines: z.number().optional().default(200)
			})
		)
		.query(async ({ ctx, input }) => {
			const ownerId = process.env.OWNER_ID || process.env.DISCORD_OWNER_ID;
			if (ownerId && ctx.session?.user?.id !== ownerId) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Only the bot owner can view system logs.'
				});
			}

			const filename = `${input.type}.log`;
			const logPath = path.resolve(process.cwd(), '../../logs', filename);

			if (!fs.existsSync(logPath)) {
				return { logPath, content: ['No log entries found.'] };
			}

			try {
				const fileContent = fs.readFileSync(logPath, 'utf-8');
				const allLines = fileContent.split(/\r?\n/).filter(Boolean);
				const sliced = allLines.slice(-input.lines);
				return { logPath, content: sliced };
			} catch {
				return { logPath, content: ['Error reading log file.'] };
			}
		}),

	clearLogs: protectedProcedure
		.input(
			z.object({
				type: z.enum(['bot', 'dashboard', 'lavalink', 'combined'])
			})
		)
		.mutation(async ({ ctx, input }) => {
			const ownerId = process.env.OWNER_ID || process.env.DISCORD_OWNER_ID;
			if (ownerId && ctx.session?.user?.id !== ownerId) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Only the bot owner can clear system logs.'
				});
			}

			const filename = `${input.type}.log`;
			const logPath = path.resolve(process.cwd(), '../../logs', filename);

			if (fs.existsSync(logPath)) {
				fs.writeFileSync(logPath, '', 'utf-8');
			}
			return { success: true };
		})
});

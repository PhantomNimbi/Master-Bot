import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { Session } from '@master-bot/auth';
import { prisma } from '@master-bot/db';
import Redis from 'ioredis';
import { env } from '~/env.mjs';

interface CreateContextOptions {
	session: Session | null;
}

/**
 * Creates the inner TRPC context.
 * - `session`: the active Discord session (for authz)
 * - `prisma`: Prisma client for DB persistence
 * - `redis`: ioredis client for live data (bot's session, not DB)
 */
export const createInnerTRPCContext = (opts: CreateContextOptions) => {
	const redis = process.env.REDIS_URL
		? new Redis(process.env.REDIS_URL)
		: new Redis({
				host: process.env.REDIS_HOST || 'localhost',
				port: Number.parseInt(process.env.REDIS_PORT!) || 6379,
				password: process.env.REDIS_PASSWORD || '',
				db: Number.parseInt(process.env.REDIS_DB!) || 0
		  });

	return {
		session: opts.session,
		prisma,
		redis
	};
};

export type Context = Awaited<ReturnType<typeof createInnerTRPCContext>>;

const t = initTRPC.context<Context>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
			}
		};
	}
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
	if (!ctx.session?.user) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}
	return next({
		ctx: {
			session: { ...ctx.session, user: ctx.session.user }
		}
	});
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
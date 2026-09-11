import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { Session } from '@master-bot/auth';
import { prisma, redis } from '@master-bot/db';
import { env } from '~/env.mjs';

interface CreateContextOptions {
	session: Session | null;
}

/**
 * Creates the inner TRPC context.
 * - `session`: the active Discord session (for authz)
 * - `prisma`: Prisma client for SQLite DB persistence across restarts
 * - `redis`: shared in-memory ioredis-mock client for live bot/dashboard communication
 * - `bot`: direct reference to the in-process bot client
 */
export const createInnerTRPCContext = (opts: CreateContextOptions) => {
	return {
		session: opts.session,
		prisma,
		redis,
		bot: (globalThis as any).botClient || null
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
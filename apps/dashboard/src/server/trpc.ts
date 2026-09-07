import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { Session } from '@master-bot/auth';
import { prisma } from '@master-bot/db';

interface CreateContextOptions {
	session: Session | null;
}

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
	return {
		session: opts.session,
		prisma
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
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { createTRPCContext } from '~/server/context';
import { appRouter } from '~/server/root';

const handler = (req: Request) =>
	fetchRequestHandler({
		req,
		router: appRouter,
		endpoint: '/api/trpc',
		createContext: () => createTRPCContext({ req })
	});

export { handler as GET, handler as POST };
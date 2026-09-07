import { auth, type Session } from '@master-bot/auth';

import { createInnerTRPCContext } from './trpc';

export const createTRPCContext = async (opts: {
	req?: Request;
	auth?: Session;
}) => {
	const session = opts.auth ?? (await auth());
	return createInnerTRPCContext({
		session
	});
};
import { broadcastRouter } from './routers/broadcast';
import { channelRouter } from './routers/channel';
import { commandRouter } from './routers/command';
import { guildRouter } from './routers/guild';
import { musicRouter } from './routers/music';
import { systemRouter } from './routers/system';
import { ticketsRouter } from './routers/tickets';
import { welcomeRouter } from './routers/welcome';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
	guild: guildRouter,
	channel: channelRouter,
	welcome: welcomeRouter,
	tickets: ticketsRouter,
	command: commandRouter,
	music: musicRouter,
	broadcast: broadcastRouter,
	system: systemRouter
});

export type AppRouter = typeof appRouter;
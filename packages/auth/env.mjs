import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const defaultPort = process.env.DASHBOARD_PORT || process.env.PORT || '3000';
const defaultNextAuthUrl = `http://localhost:${defaultPort}`;

export const env = createEnv({
	server: {
		DISCORD_CLIENT_ID: z.string().default('placeholder_client_id'),
		DISCORD_CLIENT_SECRET: z.string().default('placeholder_client_secret'),
		NEXTAUTH_SECRET: z.string().default('youshallnotpass'),
		NEXTAUTH_URL: z.preprocess(
			str =>
				process.env.VERCEL_URL ??
				(str && str !== '' ? str : defaultNextAuthUrl),
			process.env.VERCEL ? z.string() : z.string().url().default(defaultNextAuthUrl)
		),
		DASHBOARD_PORT: z.string().optional(),
		BOT_PORT: z.string().optional(),
		BOT_API_PORT: z.string().optional()
	},
	client: {},
	runtimeEnv: {
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
		DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
		DASHBOARD_PORT: process.env.DASHBOARD_PORT,
		BOT_PORT: process.env.BOT_PORT,
		BOT_API_PORT: process.env.BOT_API_PORT
	},
	skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION
});


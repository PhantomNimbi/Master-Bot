import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
	server: {
		DISCORD_CLIENT_ID: z.string().default('placeholder_client_id'),
		DISCORD_CLIENT_SECRET: z.string().default('placeholder_client_secret'),
		NEXTAUTH_SECRET: z.string().default('youshallnotpass'),
		NEXTAUTH_URL: z.preprocess(
			// This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
			// Since NextAuth.js automatically uses the VERCEL_URL if present.
			str => process.env.VERCEL_URL ?? (str === '' ? undefined : str),
			// VERCEL_URL doesn't include `https` so it cant be validated as a URL
			process.env.VERCEL ? z.string() : z.string().url().optional()
		)
	},
	client: {},
	runtimeEnv: {
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
		DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET
	},
	skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION
});

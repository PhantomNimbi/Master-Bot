import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
	clientPrefix: '',
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app isn't
	 * built with invalid env vars.
	 */
	server: {
		DATABASE_URL: z.string().default('file:./db.sqlite'),
		DISCORD_TOKEN: z.string().default('placeholder_token'),
		DISCORD_CLIENT_ID: z.string().default('placeholder_client_id'),
		DISCORD_CLIENT_SECRET: z.string().default('placeholder_client_secret'),
		DASHBOARD_PORT: z.string().optional(),
		BOT_PORT: z.string().optional(),
		BOT_API_PORT: z.string().optional(),
		LAVA_ENABLED: z.string().optional(),
		GIFS_ENABLED: z.string().optional(),
		TWITCH_ENABLED: z.string().optional(),
		NEWS_ENABLED: z.string().optional(),
		IGDB_ENABLED: z.string().optional(),
		YOUTUBE_API_KEY: z.string().optional(),
		YOUTUBE_REFRESH_TOKEN: z.string().optional(),
		YOUTUBE_CIPHER_URL: z.string().optional(),
		YOUTUBE_CIPHER_PASSWORD: z.string().optional(),
		SPOTIFY_CLIENT_ID: z.string().optional(),
		SPOTIFY_CLIENT_SECRET: z.string().optional()
	},
	/**
	 * Specify your client-side environment variables schema here.
	 * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
	 */
	client: {
		// NEXT_PUBLIC_CLIENTVAR: z.string(),
	},
	/**
	 * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
	 */
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		DISCORD_TOKEN: process.env.DISCORD_TOKEN,
		DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
		DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
		DASHBOARD_PORT: process.env.DASHBOARD_PORT,
		BOT_PORT: process.env.BOT_PORT,
		BOT_API_PORT: process.env.BOT_API_PORT,
		LAVA_ENABLED: process.env.LAVA_ENABLED,
		GIFS_ENABLED: process.env.GIFS_ENABLED,
		TWITCH_ENABLED: process.env.TWITCH_ENABLED,
		NEWS_ENABLED: process.env.NEWS_ENABLED,
		IGDB_ENABLED: process.env.IGDB_ENABLED,
		YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
		YOUTUBE_REFRESH_TOKEN: process.env.YOUTUBE_REFRESH_TOKEN,
		YOUTUBE_CIPHER_URL: process.env.YOUTUBE_CIPHER_URL,
		YOUTUBE_CIPHER_PASSWORD: process.env.YOUTUBE_CIPHER_PASSWORD,
		SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
		SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET
	},
	skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION
});

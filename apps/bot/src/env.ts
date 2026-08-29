import { z } from 'zod';

const envSchema = z.object({
	DISCORD_TOKEN: z.string(),
	KLIPY_API: z.string().optional(),
	// Redis
	REDIS_HOST: z.string().optional(),
	REDIS_PORT: z.string().optional(),
	REDIS_PASSWORD: z.string().optional(),
	REDIS_DB: z.string().optional(),
	// Feature Toggles
	LAVA_ENABLED: z.string().optional(),
	GIFS_ENABLED: z.string().optional(),
	TWITCH_ENABLED: z.string().optional(),
	NEWS_ENABLED: z.string().optional(),
	IGDB_ENABLED: z.string().optional(),
	// Lavalink
	LAVA_EXTERNAL: z.string().optional(),
	LAVA_HOST: z.string().optional(),
	LAVA_PORT: z.string().optional(),
	LAVA_PASS: z.string().optional(),
	LAVA_SECURE: z.string().optional(),
	YOUTUBE_API_KEY: z.string().optional(),
	YOUTUBE_REFRESH_TOKEN: z.string().optional(),
	SPOTIFY_CLIENT_ID: z.string().optional(),
	SPOTIFY_CLIENT_SECRET: z.string().optional(),
	// SoundCloud (optional — built-in Lavalink source is free; keys only needed for lavasrc plugin)
	SOUNDCLOUD_CLIENT_ID: z.string().optional(),
	SOUNDCLOUD_CLIENT_SECRET: z.string().optional()
});

export const env = envSchema.parse(process.env);

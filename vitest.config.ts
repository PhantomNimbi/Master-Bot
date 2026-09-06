import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	resolve: {
		alias: {
			'~': path.resolve(__dirname, 'apps/dashboard/src'),
			'@master-bot/api': path.resolve(__dirname, 'packages/api/index.ts'),
			'@master-bot/auth': path.resolve(__dirname, 'packages/auth/index.ts'),
			'@master-bot/db': path.resolve(__dirname, 'packages/db/index.ts'),
			'next/server': 'next/server.js'
		}
	},
	test: {
		globals: true,
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		server: {
			deps: {
				inline: ['next-auth', '@auth/core', '@auth/prisma-adapter']
			}
		}
	}
});

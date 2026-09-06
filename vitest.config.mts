import { defineConfig } from 'vitest/config';
import path from 'path';

const rootDir = import.meta.dirname;

export default defineConfig({
	resolve: {
		alias: {
			'~': path.resolve(rootDir, 'apps/dashboard/src'),
			'@master-bot/db': path.resolve(rootDir, 'packages/db/index.ts'),
			'@master-bot/dashboard': path.resolve(rootDir, 'apps/dashboard/src/index.ts'),
			'@master-bot/dataService': path.resolve(rootDir, 'apps/bot/src/dataService.ts')
		}
	},
	test: {
		globals: true,
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		server: {
			deps: {
				inline: ['@master-bot/db'],
				external: ['node:sqlite']
			}
		}
	}
});
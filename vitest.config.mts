import { defineMonorepoConfig } from '@helix-origin/vitest-suite/presets';
import path from 'node:path';

export default defineMonorepoConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		alias: {
			'@master-bot/db': path.resolve(__dirname, 'packages/db/index.ts'),
			'~': path.resolve(__dirname, 'apps/dashboard/src')
		},
		pool: 'forks',
		poolOptions: {
			forks: {
				singleFork: true
			}
		},
		testTimeout: 15000
	}
});

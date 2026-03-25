import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { resolve } from 'node:path';
import { appendFileSync } from 'fs';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const instances = env.VITEST_BROWSERS
		? env.VITEST_BROWSERS.split(',').map((value) => ({ browser: value }))
		: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }];

	return {
		test: {
			include: ['**/*.test.js'],
			// resets spies and mocks after each test (same mocks are shared across tests in the same file)
			mockReset: true,
			globals: true,
			watch: false,
			css: {
				include: /.+/
			},
			dir: './vitest',
			browser: {
				provider: playwright(),
				enabled: true,
				headless: true,
				instances,
				screenshotFailures: false
			},

			alias: {
				'@chunk': resolve(__dirname, './test/chunkUtil')
			},
			coverage: {
				enabled: true,
				provider: 'istanbul',
				reporter: ['text-summary', 'lcov']
			},
			onConsoleLog(log, type) {
				// Append logs to a file
				if (env.TEST_SINGLE_FILE) {
					appendFileSync('console.log', `[${type}] ${log}\n`);
				}
				return false;
			}
		},
		resolve: {
			alias: {
				'@chunk': resolve(__dirname, './test/chunkUtil'),
				'@src': resolve(__dirname, './src'),
				'@test': resolve(__dirname, './test')
			}
		}
	};
});

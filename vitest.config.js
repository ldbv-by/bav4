import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { resolve } from 'node:path';

export default defineConfig({
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
			instances: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }],
			screenshotFailures: false
		}
	},

	resolve: {
		alias: {
			'@src': resolve(__dirname, './src'),
			'@test': resolve(__dirname, './test')
		}
	}
});

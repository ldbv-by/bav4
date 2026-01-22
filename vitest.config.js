// npm run vitest => to start test-runner

import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { resolve } from 'node:path';

// Note: The config can also be defined in vite.config.js. This is up to the developers how they want
// to structure the configuration...
export default defineConfig({
	test: {
		include: ['**/*.test.js'],
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
			// at least one instance is required
			instances: [
				{ browser: 'chromium' }
				//   { browser: "firefox" },
				//  { browser: "webkit" },
			],
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

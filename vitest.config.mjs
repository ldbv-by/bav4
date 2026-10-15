import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { resolve } from 'node:path';
import { appendFileSync } from 'fs';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const cesiumSource = 'node_modules/cesium/Build/Cesium';
	const cesiumBaseUrl = 'cesiumStatic';
	const cesiumStaticStripBase = cesiumSource.split('/').length;

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
			dir: './test',
			browser: {
				provider: playwright(),
				enabled: true,
				headless: true,
				instances,
				screenshotFailures: false
			},
			alias: {
				'@chunk': resolve(import.meta.dirname, './test/chunkUtil')
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
		define: {
			// Define relative base path in cesium for loading assets
			// https://vitejs.dev/config/shared-options.html#define
			CESIUM_BASE_URL: JSON.stringify(`/${cesiumBaseUrl}`)
		},
		plugins: [
			// Copy Cesium Assets, Widgets, and Workers to a static directory.
			// Important so that the tests have access to cesium libraries
			viteStaticCopy({
				targets: [
					{ src: `${cesiumSource}/ThirdParty`, dest: cesiumBaseUrl, rename: { stripBase: cesiumStaticStripBase } },
					{ src: `${cesiumSource}/Workers`, dest: cesiumBaseUrl, rename: { stripBase: cesiumStaticStripBase } },
					{ src: `${cesiumSource}/Assets`, dest: cesiumBaseUrl, rename: { stripBase: cesiumStaticStripBase } },
					{ src: `${cesiumSource}/Widgets`, dest: cesiumBaseUrl, rename: { stripBase: cesiumStaticStripBase } }
				]
			})
		],
		resolve: {
			alias: {
				'@chunk': resolve(import.meta.dirname, './test/chunkUtil'),
				'@src': resolve(import.meta.dirname, './src'),
				'@test': resolve(import.meta.dirname, './test')
			}
		}
	};
});

import { defineConfig, loadEnv } from 'vite';
const path = require('path');

const templateParameters = process.env.BACKEND_URL
	? require(`./src/assets/${process.env.DEFAULT_LANG || 'en'}.json`)
	: require(`./src/assets/standalone.json`);

// https://vite.dev/config/
export default defineConfig((config) => {
	const command = config.command;

	// see https://vite.dev/config/ -- needed to load envs without prefixes...
	const env = loadEnv(config.mode, process.cwd(), '');

	return {
		root: './src',
		server: {
			port: 8080
		},
		watch: false,
		build: {
			outDir: 'dist',
			// See: https://rollupjs.org/configuration-options/
			rollupOptions: {
				input: {
					// Note: In prod preview we can not build index + admin together since the build would
					// somehow dismiss the ba-injector. Workaround would be to build each page separately.
					index: 'src/index.html'
					//	admin: 'src/admin.html'
				},
				output: {
					entryFileNames: '[name].[hash].js',
					assetFileNames: 'assets/[name].[hash][extname]'
					// Note: you can also change how assets are hashed
					// hashCharacters: 'hex'
				}
			},
			minify: 'esbuild'
		},
		// Default env dir is root (./src)
		envDir: '../',
		// Vite requires env variables to have some kind of prefix (VITE_ is default)
		// S. https://vite.dev/guide/env-and-mode
		envPrefix: 'BA_',
		resolve: {
			alias: {
				'@chunk': path.resolve(__dirname, './src/chunks')
			}
		},
		define: {
			// This is a way to load env without prefixes (But not recommended by VITE)
			// https://vite.dev/config/shared-options#envprefix
			'import.meta.env.TEST_ENV_VAR': JSON.stringify(env.TEST_ENV_VAR),
			'import.meta.env.DEFAULT_LANG': JSON.stringify(env.DEFAULT_LANG),
			'import.meta.env.SHORTENING_SERVICE_URL': JSON.stringify(env.SHORTENING_SERVICE_URL),
			'import.meta.env.SOFTWARE_INFO': JSON.stringify(env.SOFTWARE_INFO),
			'import.meta.env.PROXY_URL': JSON.stringify(env.PROXY_URL),
			'import.meta.env.BACKEND_URL': JSON.stringify(env.BACKEND_URL),
			'import.meta.env.BACKEND_ADMIN_TOKEN': JSON.stringify(env.BACKEND_ADMIN_TOKEN),

			// See src/index.html:
			'import.meta.env.LANG': JSON.stringify(templateParameters.lang),
			'import.meta.env.TITLE': JSON.stringify(templateParameters.title),
			'import.meta.env.DESCRIPTION': JSON.stringify(templateParameters.description)
		}
	};
});

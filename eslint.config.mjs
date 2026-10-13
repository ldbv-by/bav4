import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';
import esImport from 'eslint-plugin-import';
import promisePlugin from 'eslint-plugin-promise';
import globals from 'globals';

export default defineConfig([
	{
		languageOptions: {
			ecmaVersion: 2023,
			globals: { ...globals.browser, ...globals.node, ...globals.vitest }
		},
		plugins: {
			js,
			'@stylistic': stylistic,
			esImport,
			promise: promisePlugin
		},
		extends: [js.configs.recommended, esImport.flatConfigs.errors],
		rules: {
			'@stylistic/no-mixed-spaces-and-tabs': 'off',
			'@stylistic/space-infix-ops': ['error', { int32Hint: false }],
			'promise/prefer-await-to-then': 'error',
			'import/no-default-export': 'error',
			'import/no-unresolved': ['error', { ignore: ['\\.css\\?inline$', '^maplibre-gl$'] }],
			'no-console': ['error', { allow: ['warn', 'error'] }],
			eqeqeq: ['error', 'smart'],
			'no-var': 'error',
			'prefer-const': 'error',
			'no-restricted-imports': ['error', { patterns: ['**/node_modules/**'] }]
		},
		settings: {
			'import/resolver': {
				'eslint-import-resolver-custom-alias': {
					alias: {
						'@src': './src',
						'@test': './test'
					}
				}
			}
		}
	}
]);

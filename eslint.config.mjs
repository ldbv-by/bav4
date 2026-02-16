import esImport from 'eslint-plugin-import';
import promisePlugin from 'eslint-plugin-promise';
import stylistic from '@stylistic/eslint-plugin';
import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	{
		languageOptions: {
			ecmaVersion: 2023,
			globals: { ...globals.browser, ...globals.node, ...globals.jasmine }
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
			'import/no-unresolved': ['error', { ignore: ['\\.css\\?inline$'] }],
			'no-console': ['error', { allow: ['warn', 'error'] }],
			eqeqeq: ['error', 'smart'],
			'no-var': 'error',
			'prefer-const': 'error'
		}
	}
]);

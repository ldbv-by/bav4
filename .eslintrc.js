module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
		es2021: true,
		jasmine: true
	},
	plugins: ['promise'],
	extends: [
		'eslint:recommended',
		'plugin:import/errors'
	],
	parserOptions: {
		sourceType: 'module'
	},
	rules: {
		'space-infix-ops': ['error', { 'int32Hint': false }],
		'no-console': ['error', { allow: ['warn', 'error'] }],
		'import/no-default-export': ['error'],
		'eqeqeq': ['error', 'smart'],
		'no-var': ['error'],
		'prefer-const': ['error'],
		'promise/prefer-await-to-then': ['error']
	}
};

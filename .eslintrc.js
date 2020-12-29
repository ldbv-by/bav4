module.exports = {
	env: {
		browser: true,
		es2020: true,
		'jasmine': true
	},
	extends: [
		'eslint:recommended',
		'plugin:import/errors'
	],
	parserOptions: {
		ecmaVersion: 11,
		sourceType: 'module'
	},
	rules: {
		'semi': ['error', 'always'],
		'indent': ['error', 'tab', { 'SwitchCase': 1 }],
		'quotes': ['error', 'single'],
		'object-curly-spacing': ['error', 'always'],
		'brace-style': ['error', 'stroustrup'],
		'lines-between-class-members': ['error', 'always'],
		'comma-spacing': ['error', { 'before': false, 'after': true }],
		"array-bracket-spacing": [2, "never"],
		'curly': ['error', 'all'],
		'space-before-blocks': ['error', 'always'],
		'import/no-default-export': ['error'],
	}
};

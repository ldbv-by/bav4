module.exports = {
	env: {
		browser: true,
		es2020: true,
		'jasmine': true
	},
	extends: [
		'eslint:recommended'
	],
	parserOptions: {
		ecmaVersion: 11,
		sourceType: 'module'
	},
	rules: {
		'semi': ['error', 'always'],
		'indent': ['error', 'tab', { 'SwitchCase': 1 }],
		'multiline-comment-style' : ['error', 'starred-block'],
		'quotes': ['error', 'single'],
		'object-curly-spacing': ['error', 'always'],
		'brace-style': ['error', 'stroustrup'],
		'lines-between-class-members': ['error', 'always'],
		'curly': ['error', 'all'],
		'space-before-blocks': ['error', 'always'],
	}
};

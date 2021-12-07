module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
		es2020: true,
		'jasmine': true
	},
	plugins: ['promise'],
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
		'no-trailing-spaces': ['error'],
		'quotes': ['error', 'single'],
		'object-curly-spacing': ['error', 'always'],
		'brace-style': ['error', 'stroustrup'],
		'lines-between-class-members': ['error', 'always'],
		'comma-spacing': ['error', { 'before': false, 'after': true }],
		'array-bracket-spacing': ['error', 'never'],
		'arrow-spacing': ['error'],
		'space-infix-ops': ['error', { 'int32Hint': false }],
		'curly': ['error', 'all'],
		'space-before-blocks': ['error', 'always'],
		'no-console': ['error', { allow: ['warn', 'error'] }],
		'import/no-default-export': ['error'],
		'eqeqeq': ['error', 'smart'],
		'keyword-spacing': ['error'],
		'no-var': ['error'],
		'prefer-const': ['error'],
		'space-in-parens': ['error'],
		'eol-last': ['error'],
		'key-spacing': ['error'],
		'rest-spread-spacing': ['error'],
		'space-before-function-paren': ['error', {
			'anonymous': 'always',
			'named': 'never',
			'asyncArrow': 'always'
		}],
		'no-multi-spaces': ['error'],
		'comma-dangle': ['error'],
		'promise/prefer-await-to-then': ['error']
	}
};

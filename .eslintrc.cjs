module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
	],
	plugins: ['@typescript-eslint'],
	ignorePatterns: ['*.cjs'],
	rules: {
		'@typescript-eslint/no-empty-interface': [
			'error',
			{
				allowSingleExtends: true,
			},
		],
		'@typescript-eslint/no-explicit-any': [
			'warn',
			{ ignoreRestArgs: true },
		],
		'@typescript-eslint/no-redeclare': [
			'error',
			{ ignoreDeclarationMerge: true },
		],
	},
	overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
	settings: {
		'svelte3/typescript': () => require('typescript'),
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
	},
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
}

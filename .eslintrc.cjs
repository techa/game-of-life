module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
	],
	plugins: ['@typescript-eslint'],
	ignorePatterns: ['*.cjs', '*.html'],
	rules: {
		'no-mixed-spaces-and-tabs': ['error', { 'smart-tabs': true }],
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
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		project: './tsconfig.json',
		extraFileExtensions: ['.svelte'], // This is a required setting in `@typescript-eslint/parser` v4.24.0.
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			// Parse the `<script>` in `.svelte` as TypeScript by adding the following configuration.
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
		},
		// ...
	],
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
}

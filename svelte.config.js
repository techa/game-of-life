import { vitePreprocess } from '@sveltejs/kit/vite'
import adapter from '@sveltejs/adapter-static'
// import adapter from '@sveltejs/adapter-auto'
import preprocess from 'svelte-preprocess'

import { readFileSync } from 'fs'
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

const dev = process.env.NODE_ENV !== 'production'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [preprocess(), vitePreprocess({})],

	kit: {
		// https://github.com/sveltejs/kit/tree/master/packages/adapter-static
		adapter: adapter({
			fallback: 'index.html',
		}),
		paths: {
			base: dev ? '' : `/${pkg.name}`,
		},
		prerender: { entries: [] },
		appDir: 'internal',
	},
}

export default config

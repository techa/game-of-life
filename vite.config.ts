import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { purgeCss } from 'vite-plugin-tailwind-purgecss'

const config: UserConfig = {
	plugins: [sveltekit(), purgeCss()],
}

export default config;

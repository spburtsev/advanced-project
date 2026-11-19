import { enhancedImages } from '@sveltejs/enhanced-img';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { createRuntime } from './src/lib/server/runtime.js';

/** Dev counterpart of server.js: db + /sync on the Vite HTTP server. */
function syncDev(): Plugin {
	return {
		name: 'sync-dev',
		async configureServer(server) {
			if (!server.httpServer) return; // middleware mode / vitest
			const env = loadEnv(server.config.mode, server.config.root, '');
			await createRuntime({
				localDev: env.LOCAL_DEV === '1',
				databaseUrl: env.DATABASE_URL,
				origin: env.ORIGIN,
				dataDir: '.local',
				server: server.httpServer as import('node:http').Server
			});
		}
	};
}

export default defineConfig({
	ssr: {
		// The package ships .svelte files. Node cannot load those when the dependency stays external.
		noExternal: ['@shadcn-svelte/primitives']
	},
	plugins: [
		enhancedImages(),
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter()
		}),
		syncDev()
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});

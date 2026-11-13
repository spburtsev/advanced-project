import { createDb } from './db/index.js';
import { attachSync } from './sync/index.js';

/** @typedef {{ db: import('./db/index.js').Db, sync: import('./sync/index.js').Sync }} Runtime */

// Shared by server.js / vite.config.ts and the SvelteKit bundle, which hold separate copies of this module.
const KEY = Symbol.for('advanced-project.runtime');
const store = /** @type {{ [KEY]?: Runtime }} */ (globalThis);

/**
 * @param {{ databaseUrl: string | undefined, origin: string | undefined, server: import('node:http').Server }} options
 * @returns {Runtime}
 */
export function createRuntime({ databaseUrl, origin, server }) {
	if (!databaseUrl) throw new Error('DATABASE_URL is not set');
	// Vite restarts call this again with a new HTTP server; keep the db pool.
	const prev = store[KEY];
	prev?.sync.close();
	const db = prev?.db ?? createDb(databaseUrl);
	const sync = attachSync(server, { path: '/sync', db, origin });
	return (store[KEY] = { db, sync });
}

/** @returns {Runtime} */
export function getRuntime() {
	const runtime = store[KEY];
	if (!runtime) throw new Error('runtime not created: start via server.js or vite dev');
	return runtime;
}

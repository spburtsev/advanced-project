import { join } from 'node:path';
import { createDb, createLocalDb } from './db/index.js';
import { createLocalStorage } from './storage/index.js';
import { attachSync } from './sync/index.js';

/**
 * @typedef {{
 *   db: import('./db/index.js').Db,
 *   sync: import('./sync/index.js').Sync,
 *   storage: import('./storage/index.js').Storage | null,
 *   localDev: boolean
 * }} Runtime
 */

// Shared by server.js / vite.config.ts and the SvelteKit bundle, which hold separate copies of this module.
const KEY = Symbol.for('advanced-project.runtime');
const store = /** @type {{ [KEY]?: Runtime }} */ (globalThis);

/**
 * @param {{
 *   localDev: boolean,
 *   databaseUrl: string | undefined,
 *   origin: string | undefined,
 *   dataDir: string,
 *   server: import('node:http').Server
 * }} options
 * @returns {Promise<Runtime>}
 */
export async function createRuntime({ localDev, databaseUrl, origin, dataDir, server }) {
	if (localDev && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin ?? '')) {
		throw new Error(`LOCAL_DEV enables mock login; refusing to run with ORIGIN=${origin}`);
	}
	if (!localDev && !databaseUrl) {
		throw new Error('DATABASE_URL is not set');
	}

	// Vite restarts call this again with a new HTTP server; keep the db (PGlite locks its folder).
	const prev = store[KEY];
	prev?.sync.close();
	let { db, storage } = prev ?? {};
	if (!db) {
		db = localDev
			? await createLocalDb(join(dataDir, 'pgdata'))
			: createDb(/** @type {string} */ (databaseUrl));
		// ponytail: S3 storage lands with attachments; null until then.
		storage = localDev ? createLocalStorage(join(dataDir, 'storage')) : null;
		if (localDev) {
			console.log('LOCAL_DEV: PGlite + local storage + mock login at /auth/dev-login');
		}
	}
	const sync = attachSync(server, { path: '/sync', db, origin });
	return (store[KEY] = { db, sync, storage: storage ?? null, localDev });
}

/** @returns {Runtime} */
export function getRuntime() {
	const runtime = store[KEY];
	if (!runtime) {
		throw new Error('runtime not created: start via server.js or vite dev');
	}
	return runtime;
}

import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { PGlite } from '@electric-sql/pglite';
import * as schema from './schema.js';

/**
 * Either driver; queries are written against the shared Postgres API.
 * @typedef {import('drizzle-orm/pg-core').PgDatabase<any, typeof schema>} Db
 */

/**
 * @param {string} url
 * @returns {Db}
 */
export function createDb(url) {
	return drizzle(url, { schema });
}

/**
 * Embedded Postgres (WASM) in `dir`, migrated on open. For LOCAL_DEV.
 * @param {string} dir
 * @returns {Promise<Db>}
 */
export async function createLocalDb(dir) {
	mkdirSync(dir, { recursive: true });
	const db = drizzlePglite(new PGlite(dir), { schema });
	await migrate(db, { migrationsFolder: fileURLToPath(new URL('./migrations', import.meta.url)) });
	return db;
}

import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

/** @param {string} url */
export function createDb(url) {
	return drizzle(url, { schema });
}

/** @typedef {ReturnType<typeof createDb>} Db */

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';

/**
 * @typedef {{
 *   put(key: string, body: Uint8Array | string): Promise<void>,
 *   get(key: string): Promise<Buffer | null>,
 *   delete(key: string): Promise<void>
 * }} Storage
 */

/**
 * Object storage on the local filesystem. For LOCAL_DEV.
 * @param {string} dir
 * @returns {Storage}
 */
export function createLocalStorage(dir) {
	const root = resolve(dir);
	/** @param {string} key */
	const pathOf = (key) => {
		const path = resolve(root, key);
		if (!path.startsWith(root + sep)) {
            throw new Error(`storage key escapes root: ${key}`);
        }
		return path;
	};

	return {
		async put(key, body) {
			const path = pathOf(key);
			await mkdir(dirname(path), { recursive: true });
			await writeFile(path, body);
		},
		async get(key) {
			try {
				return await readFile(pathOf(key));
			} catch (err) {
				if (/** @type {NodeJS.ErrnoException} */ (err).code === 'ENOENT') {
                    return null;
                }
				throw err;
			}
		},
		async delete(key) {
			await rm(pathOf(key), { force: true });
		}
	};
}

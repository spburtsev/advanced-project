import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';

/**
 * @typedef {{
 *   put(key: string, body: Uint8Array | string): Promise<void>,
 *   get(key: string): Promise<Buffer | null>,
 *   delete(key: string): Promise<void>
 * }} Storage
 */

class LocalStorage {
	/** @param {string} dir */
	constructor(dir) {
		this.dir = dir;
	}

	/**
	 * @param {string} key
	 **/
	#pathOf(key) {
		const root = resolve(this.dir);
		const path = resolve(root, key);
		if (path !== root && !path.startsWith(root + sep)) {
			throw new Error(`key escapes root: ${key}`);
		}
		return path;
	}

	/**
	 * @param {string} key
	 * @param {Uint8Array | string} body
	 **/
	async put(key, body) {
		const path = this.#pathOf(key);
		await mkdir(dirname(path), { recursive: true });
		await writeFile(path, body);
	}

	/**
	 * @param {string} key
	 * @returns {Promise<Buffer | null>}
	 **/
	async get(key) {
		try {
			return await readFile(this.#pathOf(key));
		} catch (err) {
			if (/** @type {NodeJS.ErrnoException} */ (err).code === 'ENOENT') return null;
			throw err;
		}
	}

	/**
	 * @param {string} key
	 **/
    async delete(key) {
        await rm(this.#pathOf(key), { force: true });
    }
}

/**
 * Object storage on the local filesystem. For LOCAL_DEV.
 * @param {string} dir
 * @returns {Storage}
 */
export function createLocalStorage(dir) {
    return new LocalStorage(dir);
}
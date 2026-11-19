import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
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

/**
 * @typedef {{
 *   endpoint: string,
 *   region: string,
 *   bucket: string,
 *   accessKeyId: string,
 *   secretAccessKey: string
 * }} S3Config
 */

class S3Storage {
	/** @param {S3Config} config */
	constructor(config) {
		this.bucket = config.bucket;
		this.client = new S3Client({
			endpoint: config.endpoint,
			region: config.region,
			forcePathStyle: true,
			credentials: {
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey,
			},
		});
	}

	/**
	 * @param {string} key
	 * @param {Uint8Array | string} body
	 */
	async put(key, body) {
		await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body }));
	}

	/**
	 * @param {string} key
	 * @returns {Promise<Buffer | null>}
	 */
	async get(key) {
		try {
			const out = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
			if (!out.Body) return null;
			return Buffer.from(await out.Body.transformToByteArray());
		} catch (err) {
			if (/** @type {{ $metadata?: { httpStatusCode?: number } }} */ (err).$metadata?.httpStatusCode === 404) {
				return null;
			}
			throw err;
		}
	}

	/**
	 * @param {string} key
	 */
	async delete(key) {
		await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
	}
}

/**
 * @param {NodeJS.ProcessEnv} env
 * @param {string} name
 */
function required(env, name) {
	const value = env[name];
	if (!value) throw new Error(`${name} is not set`);
	return value;
}

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {S3Config}
 */
export function readS3Config(env = process.env) {
	return {
		endpoint: required(env, 'S3_ENDPOINT'),
		region: required(env, 'S3_REGION'),
		bucket: required(env, 'S3_BUCKET'),
		accessKeyId: required(env, 'S3_ACCESS_KEY_ID'),
		secretAccessKey: required(env, 'S3_SECRET_ACCESS_KEY'),
	};
}

/**
 * @param {S3Config} config
 * @returns {Storage}
 */
export function createS3Storage(config) {
	return new S3Storage(config);
}
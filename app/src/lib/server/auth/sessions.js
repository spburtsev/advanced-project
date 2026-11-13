import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt } from 'drizzle-orm';
import { sessions } from '../db/schema.js';

/** @typedef {import('../db/index.js').Db} Db */

export const SESSION_COOKIE = 'session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** @param {string} token */
const hash = (token) => createHash('sha256').update(token).digest('hex');

/**
 * @param {Db} db
 * @param {string} userId
 */
export async function createSession(db, userId) {
	const token = randomBytes(32).toString('base64url');
	const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
	await db.insert(sessions).values({ id: hash(token), userId, expiresAt });
	return { token, expiresAt };
}

/**
 * @param {Db} db
 * @param {string | null | undefined} cookieHeader
 * @returns {Promise<string | null>} user id
 */
export async function getSessionUserId(db, cookieHeader) {
	const token = parseCookie(cookieHeader, SESSION_COOKIE);
	if (!token) {
        return null;
    }
	const [row] = await db
		.select({ userId: sessions.userId })
		.from(sessions)
		.where(and(eq(sessions.id, hash(token)), gt(sessions.expiresAt, new Date())))
		.limit(1);
	return row?.userId ?? null;
}

/**
 * @param {string | null | undefined} header
 * @param {string} name
 */
export function parseCookie(header, name) {
	for (const part of header?.split(';') ?? []) {
		const i = part.indexOf('=');
		if (i !== -1 && part.slice(0, i).trim() === name) {
			try {
				return decodeURIComponent(part.slice(i + 1).trim());
			} catch {
				return null;
			}
		}
	}
	return null;
}

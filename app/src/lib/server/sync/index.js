import { createHash } from 'node:crypto';
import { WebSocketServer } from 'ws';
import { and, eq, gt } from 'drizzle-orm';
import { sessions } from '../db/schema.js';

/** @typedef {import('../db/index.js').Db} Db */
/** @typedef {WebSocketServer} Sync */

const SESSION_COOKIE = 'session';

/**
 * @param {import('node:http').Server} server
 * @param {{ path: string, db: Db, origin: string | undefined }} options
 * @returns {Sync}
 */
export function attachSync(server, { path, db, origin }) {
	const wss = new WebSocketServer({ noServer: true });

	server.on('upgrade', async (req, socket, head) => {
		if (new URL(req.url ?? '/', 'http://x').pathname !== path) return;

		if (!origin || req.headers.origin !== origin) return reject(socket, 403);
		const userId = await authenticate(db, req.headers.cookie).catch((err) => {
			console.error('sync: session lookup failed', err);
			return null;
		});
		if (!userId) return reject(socket, 401);

		wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req, userId));
	});

	// TODO: replace echo with rooms/protocol
	wss.on('connection', (ws) => {
		ws.on('message', (data) => ws.send(data));
	});

	server.on('close', () => wss.close());
	return wss;
}

/**
 * @param {Db} db
 * @param {string | undefined} cookieHeader
 * @returns {Promise<string | null>} user id
 */
async function authenticate(db, cookieHeader) {
	const token = parseCookie(cookieHeader, SESSION_COOKIE);
	if (!token) return null;
	const id = createHash('sha256').update(token).digest('hex');
	const [row] = await db
		.select({ userId: sessions.userId })
		.from(sessions)
		.where(and(eq(sessions.id, id), gt(sessions.expiresAt, new Date())))
		.limit(1);
	return row?.userId ?? null;
}

/**
 * @param {string | undefined} header
 * @param {string} name
 */
function parseCookie(header, name) {
	for (const part of header?.split(';') ?? []) {
		const i = part.indexOf('=');
		if (i !== -1 && part.slice(0, i).trim() === name)
			return decodeURIComponent(part.slice(i + 1).trim());
	}
	return null;
}

/**
 * @param {import('node:stream').Duplex} socket
 * @param {number} status
 */
function reject(socket, status) {
	socket.end(
		`HTTP/1.1 ${status} ${status === 401 ? 'Unauthorized' : 'Forbidden'}\r\nConnection: close\r\n\r\n`
	);
}

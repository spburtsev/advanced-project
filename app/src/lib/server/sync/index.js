import { WebSocketServer } from 'ws';
import { getSessionUserId } from '../auth/sessions.js';

/** @typedef {import('../db/index.js').Db} Db */
/** @typedef {WebSocketServer} Sync */

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
		const userId = await getSessionUserId(db, req.headers.cookie).catch((err) => {
			console.error('sync: session lookup failed', err);
			return null;
		});
		if (!userId) {
			return reject(socket, 401);
		}

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
 * @param {import('node:stream').Duplex} socket
 * @param {number} status
 */
function reject(socket, status) {
	socket.end(
		`HTTP/1.1 ${status} ${status === 401 ? 'Unauthorized' : 'Forbidden'}\r\nConnection: close\r\n\r\n`
	);
}

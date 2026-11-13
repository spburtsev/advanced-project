import type { Handle } from '@sveltejs/kit/hooks';
import { getRuntime } from '#lib/server/runtime.js';
import { getSessionUserId } from '#lib/server/auth/sessions.js';

export const handle: Handle = async ({ event, resolve }) => {
	const { db, sync, storage, localDev } = getRuntime();
	event.locals.db = db;
	event.locals.sync = sync;
	event.locals.storage = storage;
	event.locals.localDev = localDev;
	event.locals.userId = await getSessionUserId(db, event.request.headers.get('cookie'));
	return resolve(event);
};

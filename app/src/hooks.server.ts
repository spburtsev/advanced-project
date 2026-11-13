import type { Handle } from '@sveltejs/kit/hooks';
import { getRuntime } from '#lib/server/runtime.js';
import { getSessionUserId } from '#lib/server/auth/sessions.js';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const { db, sync, storage, localDev } = getRuntime();
	event.locals.db = db;
	event.locals.sync = sync;
	event.locals.storage = storage;
	event.locals.localDev = localDev;
    try {
	    event.locals.userId = await getSessionUserId(db, event.request.headers.get('cookie'));
    } catch  {
        event.locals.userId = null;
    }
	if (!event.locals.userId && event.route.id?.startsWith('/(protected)')) {
		return redirect(303, '/login');
	}   
	return resolve(event);
};

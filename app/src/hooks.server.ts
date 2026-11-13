import type { Handle } from '@sveltejs/kit/hooks';
import { getRuntime } from '#lib/server/runtime.js';

export const handle: Handle = ({ event, resolve }) => {
	const { db, sync } = getRuntime();
	event.locals.db = db;
	event.locals.sync = sync;
	return resolve(event);
};

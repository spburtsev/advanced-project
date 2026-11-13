import { error, redirect } from '@sveltejs/kit';
import { users } from '#lib/server/db/schema.js';
import { createSession, SESSION_COOKIE } from '#lib/server/auth/sessions.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url, cookies }) => {
	if (!locals.localDev) {
		error(404);
	}
	const name = url.searchParams.get('name')?.trim();
	if (!name) {
        error(400, 'name is required');
    }

	const [user] = await locals.db
		.insert(users)
		.values({ oidcSub: `dev:${name}`, name, email: `${name}@test.local` })
		.onConflictDoUpdate({ target: users.oidcSub, set: { name } })
		.returning({ id: users.id });

	const { token, expiresAt } = await createSession(locals.db, user.id);

	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		expires: expiresAt
	});
	redirect(303, '/');
};

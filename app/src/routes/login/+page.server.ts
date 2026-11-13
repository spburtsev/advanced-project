import { redirect } from '@sveltejs/kit';
import { sessions, users } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';
import { randomUUID } from 'node:crypto';
import type { Db } from '#lib/server/db/index.js';
import { createSession, SESSION_COOKIE } from '#lib/server/auth/sessions.js';
import { fail } from '@sveltejs/kit';

async function ensureDevUser(db: Db, uname: string) {
	const [existingUser] = await db
		.select()
		.from(users)
		.where(eq(users.email, `${uname}@dev.local`));
	if (existingUser) {
		return existingUser;
	}

	const [newUser] = await db.insert(users).values({
		id: randomUUID(),
		name: uname,
		email: `${uname}@dev.local`,
		oidcSub: randomUUID()
	});

	return newUser;
}

async function loginDevUser(db: Db, uname: string) {
	const user = await ensureDevUser(db, uname);
	const session = await createSession(db, user.id);
	return session;
}

export const actions: Actions = {
	login: async ({ request, locals, cookies }) => {
		const { db, localDev } = locals;
		const formData = await request.formData();
		const user = formData.get('user');
		const password = formData.get('password');

		if (!user) {
			return fail(400, { user, missing: true });
		}

		if (localDev) {
			try {
				const { token, expiresAt } = await loginDevUser(db, user.toString());
				cookies.set(SESSION_COOKIE, token, {
					path: '/',
					httpOnly: true,
					sameSite: 'lax',
					expires: expiresAt
				});
			} catch (error) {
				return fail(400, { errors: { user: (error as Error).message } });
			}
			redirect(303, '/');
		}

		if (!password) {
			return fail(400, { errors: { password: 'Password is required' } });
		}
		return fail(400, { errors: { password: 'Non-dev login not implemented' }});
	},
    logout: async ({ locals, cookies }) => {
        const { db, userId } = locals;
        await db.delete(sessions).where(eq(sessions.userId, userId!));
        cookies.delete(SESSION_COOKIE, { path: '/' });
        redirect(303, '/login');
    }
};

export const load: PageServerLoad = async ({ locals }) => {
	const { userId, localDev } = locals;
	if (userId) {
		redirect(303, '/');
	}
	return {
		localDev
	};
};

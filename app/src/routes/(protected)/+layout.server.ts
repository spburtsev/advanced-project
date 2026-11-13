import { users } from "#lib/server/db/schema.js";
import { eq } from "drizzle-orm";
import type { LayoutServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ locals }) => {
    const { db, userId, localDev } = locals;
    if (!userId) {
        error(403);
    }

    const [u] = await db.select({ username: users.name, email: users.email, id: users.id})
        .from(users).where(eq(users.id, userId)).limit(1);

    const {username, email} = u;

    return {
        userId,
        username,
        email,
        localDev,
    };
}


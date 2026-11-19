import { memberships, workspaces } from "#lib/server/db/schema.js";
import { fail, redirect } from "@sveltejs/kit";
import { and, count, desc, eq, getTableColumns } from "drizzle-orm";

export const load = async ({ locals }) => {
    const items = await locals.db
        .select({
            ...getTableColumns(workspaces),
            members: count(memberships.userId),
        })
        .from(workspaces)
        .leftJoin(memberships, eq(workspaces.id, memberships.workspaceId))
        .where(eq(workspaces.createdBy, locals.userId!))
        .groupBy(workspaces.id)
        .orderBy(desc(workspaces.createdAt));

    return {
        workspaces: items,
    };
};

export const actions = {
    newWorkspace: async ({ locals }) => {
        const { db, userId } = locals;

        let newId: string;
        try {
            const [w] = await db.insert(workspaces).values({
                name: 'Untitled Workspace',
                createdBy: userId!,
            }).returning({ id: workspaces.id });
            newId = w.id;
        } catch (err) {
            console.error(err);
            return fail(500, { message: 'Failed to create workspace' });
        }
        redirect(302, `/workspaces/${newId}`);
    },
    deleteWorkspace: async ({ locals, request }) => {
        const id = (await request.formData()).get('id');
        if (typeof id !== 'string') {
            return fail(400, { message: 'Missing workspace' });
        }

        try {
            const [deleted] = await locals.db
                .delete(workspaces)
                .where(and(eq(workspaces.id, id), eq(workspaces.createdBy, locals.userId!)))
                .returning({ id: workspaces.id });
            if (!deleted) {
                return fail(404, { message: 'Workspace not found' });
            }
        } catch (err) {
            console.error(err);
            return fail(500, { message: 'Failed to delete workspace' });
        }
    },
};
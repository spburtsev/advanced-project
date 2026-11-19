import { workspaces } from "#lib/server/db/schema.js";
import { error, fail, redirect } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";

function owned(userId: string, workspaceId: string) {
    return and(eq(workspaces.id, workspaceId), eq(workspaces.createdBy, userId));
}

export const load = async ({ params, locals }) => {
    const [workspace] = await locals.db.select()
        .from(workspaces)
        .where(eq(workspaces.id, params.workspace_id))
        .limit(1);

    if (!workspace) {
        error(404, "Workspace not found");
    }

    return {
        workspace,
    };
};

export const actions = {
    rename: async ({ params, locals, request }) => {
        const raw = (await request.formData()).get('name');
        const name = typeof raw === 'string' ? raw.trim() : '';
        if (name.length === 0 || name.length > 200) {
            return fail(400, { message: 'Name must be 1–200 characters' });
        }

        try {
            const [updated] = await locals.db
                .update(workspaces)
                .set({ name })
                .where(owned(locals.userId!, params.workspace_id))
                .returning({ id: workspaces.id });
            if (!updated) {
                return fail(404, { message: 'Workspace not found' });
            }
        } catch (err) {
            console.error(err);
            return fail(500, { message: 'Failed to rename workspace' });
        }
    },
    delete: async ({ params, locals }) => {
        try {
            const [deleted] = await locals.db
                .delete(workspaces)
                .where(owned(locals.userId!, params.workspace_id))
                .returning({ id: workspaces.id });
            if (!deleted) {
                return fail(404, { message: 'Workspace not found' });
            }
        } catch (err) {
            console.error(err);
            return fail(500, { message: 'Failed to delete workspace' });
        }
        redirect(303, '/');
    },
};
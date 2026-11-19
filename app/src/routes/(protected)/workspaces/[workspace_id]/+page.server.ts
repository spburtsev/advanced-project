import { chatMessages, memberships, users, workspaces } from "#lib/server/db/schema.js";
import { error, fail, redirect } from "@sveltejs/kit";
import { and, desc, eq, isNull } from "drizzle-orm";

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

    const memberRows = await locals.db
        .select({ id: users.id, name: users.name, role: memberships.role })
        .from(memberships)
        .innerJoin(users, eq(users.id, memberships.userId))
        .where(eq(memberships.workspaceId, params.workspace_id));

    const members: { id: string; name: string; role: string }[] = memberRows.map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
    }));
    if (!members.some((member) => member.id === workspace.createdBy)) {
        const [creator] = await locals.db
            .select({ id: users.id, name: users.name })
            .from(users)
            .where(eq(users.id, workspace.createdBy))
            .limit(1);
        if (creator) members.unshift({ ...creator, role: 'owner' });
    }

    // ponytail: limit 50, add paging if threads grow
    const latest = await locals.db
        .select({
            id: chatMessages.id,
            body: chatMessages.body,
            createdAt: chatMessages.createdAt,
            authorId: chatMessages.authorId,
            authorName: users.name,
        })
        .from(chatMessages)
        .leftJoin(users, eq(users.id, chatMessages.authorId))
        .where(and(eq(chatMessages.workspaceId, params.workspace_id), isNull(chatMessages.fileId)))
        .orderBy(desc(chatMessages.id))
        .limit(50);

    return {
        workspace,
        members,
        messages: latest.reverse(),
    };
};

export const actions = {
    rename: async ({ params, locals, request }) => {
        const raw = (await request.formData()).get('name');
        const name = typeof raw === 'string' ? raw.trim() : '';
        if (name.length === 0 || name.length > 200) {
            return fail(400, { message: 'Name must be 1-200 characters' });
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
    send: async ({ params, locals, request }) => {
        const raw = (await request.formData()).get('body');
        const body = typeof raw === 'string' ? raw.trim() : '';
        if (body.length === 0 || body.length > 2000) {
            return fail(400, { scope: 'send', message: 'Message must be 1-2000 characters' });
        }

        const [allowed] = await locals.db
            .select({ id: workspaces.id })
            .from(workspaces)
            .where(owned(locals.userId!, params.workspace_id))
            .limit(1);
        if (!allowed) {
            return fail(404, { scope: 'send', message: 'Workspace not found' });
        }

        try {
            await locals.db.insert(chatMessages).values({
                workspaceId: params.workspace_id,
                authorId: locals.userId,
                body,
            });
        } catch (err) {
            console.error(err);
            return fail(500, { scope: 'send', message: 'Failed to send message' });
        }
    },
};
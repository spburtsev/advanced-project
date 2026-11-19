import { workspaces } from "#lib/server/db/schema.js";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

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
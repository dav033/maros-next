"use server";

import { serverApiClient } from "@/shared/infra/http";
import { ProjectHttpRepository, makeProjectsAppContext } from "@/project";
import { LeadHttpRepository } from "@/leads";
import { updateProject, deleteProject } from "@/project/application";
import type { Project, ProjectPatch } from "@/project/domain";
import type { ActionResult } from "@/shared/actions/types";
import { success, handleActionError } from "@/shared/actions/utils";

// Create server-side app context
function createServerProjectsAppContext() {
  return makeProjectsAppContext({
    repos: {
      project: new ProjectHttpRepository(serverApiClient),
      lead: new LeadHttpRepository(serverApiClient),
    },
  });
}

export async function updateProjectAction(
  id: number,
  patch: ProjectPatch
): Promise<ActionResult<Project>> {
  try {
    const ctx = createServerProjectsAppContext();
    const updated = await updateProject(ctx, id, patch);
    return success(updated);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteProjectAction(id: number): Promise<ActionResult<void>> {
  try {
    const ctx = createServerProjectsAppContext();
    await deleteProject(ctx, id);
    return success(undefined);
  } catch (error) {
    return handleActionError(error);
  }
}


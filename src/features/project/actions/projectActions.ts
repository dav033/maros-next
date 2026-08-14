"use server";

import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import { ProjectHttpRepository, makeProjectsAppContext } from "@/project";
import { LeadHttpRepository } from "@/leads";
import { updateProject, deleteProject } from "@/project/application";
import type { Project, ProjectPatch } from "@/project/domain";
import type { ActionResult } from "@/shared/actions/types";
import { success, handleActionError } from "@/shared/actions/utils";

// Create server-side app context
async function createServerProjectsAppContext() {
  const apiClient = createServerApiClient(await headers());
  return makeProjectsAppContext({
    repos: {
      project: new ProjectHttpRepository(apiClient),
      lead: new LeadHttpRepository(apiClient),
    },
  });
}

export async function updateProjectAction(
  id: number,
  patch: ProjectPatch
): Promise<ActionResult<Project>> {
  try {
    const ctx = await createServerProjectsAppContext();
    const updated = await updateProject(ctx, id, patch);
    return success(updated);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteProjectAction(id: number): Promise<ActionResult<void>> {
  try {
    const ctx = await createServerProjectsAppContext();
    await deleteProject(ctx, id);
    return success(undefined);
  } catch (error) {
    return handleActionError(error);
  }
}


"use server";

import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import { ProjectHttpRepository, makeProjectsAppContext } from "@/project";
import { LeadHttpRepository } from "@/leads";
import { updateProject } from "@/project/application";
import type { Project } from "@/project/domain";
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

export async function updateProjectNotesAction(
  id: number,
  notes: string[]
): Promise<ActionResult<Project>> {
  try {
    const ctx = await createServerProjectsAppContext();
    const updated = await updateProject(ctx, id, { notes });
    return success(updated);
  } catch (error) {
    return handleActionError(error);
  }
}




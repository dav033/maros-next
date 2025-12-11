import type { Project, ProjectId, ProjectPatch } from "@/project/domain";
import type { ProjectsAppContext } from "../../context";

export async function updateProject(
  ctx: ProjectsAppContext,
  id: ProjectId,
  patch: ProjectPatch
): Promise<Project> {
  return ctx.repos.project.update(id, patch);
}




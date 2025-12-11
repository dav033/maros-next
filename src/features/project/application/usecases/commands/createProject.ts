import type { Project, ProjectDraft } from "@/project/domain";
import type { ProjectsAppContext } from "../../context";

export async function createProject(
  ctx: ProjectsAppContext,
  draft: ProjectDraft
): Promise<Project> {
  return ctx.repos.project.create(draft);
}




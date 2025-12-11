import type { Project, ProjectId } from "@/project/domain";
import type { ProjectsAppContext } from "../../context";
import { BusinessRuleError } from "@/shared/domain";

export async function getProjectById(
  ctx: ProjectsAppContext,
  id: ProjectId
): Promise<Project> {
  const project = await ctx.repos.project.getById(id);
  if (!project) {
    throw new BusinessRuleError("NOT_FOUND", `Project ${id} not found`, {
      details: { id },
    });
  }
  return project;
}




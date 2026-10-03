import type { ProjectCostBreakdown, ProjectId } from "@/project/domain";
import type { ProjectsAppContext } from "../../context";

export async function getProjectCostBreakdown(
  ctx: ProjectsAppContext,
  id: ProjectId
): Promise<ProjectCostBreakdown> {
  return ctx.repos.project.getCostBreakdown(id);
}

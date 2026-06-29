import type { ProjectId } from "@/project/domain";
import type { ProjectsAppContext } from "../../context";

export async function revertProjectToLead(
  ctx: ProjectsAppContext,
  id: ProjectId,
): Promise<{ leadId: number }> {
  return ctx.repos.project.revertToLead(id);
}

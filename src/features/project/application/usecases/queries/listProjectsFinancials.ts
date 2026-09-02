import type { ProjectFinancialsEntry } from "@/project/domain";
import type { ProjectsAppContext } from "../../context";

export async function listProjectsFinancials(
  ctx: ProjectsAppContext
): Promise<ProjectFinancialsEntry[]> {
  return ctx.repos.project.listFinancials();
}

import type { QuickbooksImportJob } from "@/project/domain";
import type { ProjectsAppContext } from "../../context";

export async function listQuickbooksImportJobs(
  ctx: ProjectsAppContext,
): Promise<QuickbooksImportJob[]> {
  return ctx.repos.project.listQuickbooksImportJobs();
}

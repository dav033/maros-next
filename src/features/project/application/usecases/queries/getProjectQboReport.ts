import type { ProjectId, ProjectQboReport, QboReportParams } from "@/project/domain";
import type { ProjectsAppContext } from "../../context";

export async function getProjectQboReport(
  ctx: ProjectsAppContext,
  id: ProjectId,
  params: QboReportParams
): Promise<ProjectQboReport> {
  return ctx.repos.project.getQboReport(id, params);
}

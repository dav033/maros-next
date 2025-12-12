import type { ReportsAppContext } from "../context";
import type { RestorationVisitReport } from "../../domain/models";

export async function getRestorationVisit(
  ctx: ReportsAppContext,
  projectId: number
): Promise<RestorationVisitReport> {
  return ctx.repos.reports.getRestorationVisit(projectId);
}








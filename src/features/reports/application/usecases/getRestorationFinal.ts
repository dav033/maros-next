import type { ReportsAppContext } from "../context";
import type { RestorationFinalReport } from "../../domain/models";

export async function getRestorationFinal(
  ctx: ReportsAppContext,
  projectId: number
): Promise<RestorationFinalReport> {
  return ctx.repos.reports.getRestorationFinal(projectId);
}








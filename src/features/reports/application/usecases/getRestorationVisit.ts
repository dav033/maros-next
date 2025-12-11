import type { ReportsAppContext } from "../context";
import type { RestorationVisitReport } from "../../domain/models";

export async function getRestorationVisit(
  ctx: ReportsAppContext,
  leadNumber: string
): Promise<RestorationVisitReport> {
  return ctx.repos.reports.getRestorationVisit(leadNumber);
}








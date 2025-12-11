import type { ReportsAppContext } from "../context";
import type { RestorationVisitReport } from "../../domain/models";
import type { ReportSubmitResult } from "../../domain/ports";

export async function submitRestorationVisit(
  ctx: ReportsAppContext,
  report: RestorationVisitReport
): Promise<ReportSubmitResult> {
  return ctx.repos.reports.submitRestorationVisit(report);
}








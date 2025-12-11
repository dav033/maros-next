import type { ReportsAppContext } from "../context";
import type { RestorationFinalReport } from "../../domain/models";
import type { ReportSubmitResult } from "../../domain/ports";

export async function submitRestorationFinal(
  ctx: ReportsAppContext,
  report: RestorationFinalReport
): Promise<ReportSubmitResult> {
  return ctx.repos.reports.submitRestorationFinal(report);
}








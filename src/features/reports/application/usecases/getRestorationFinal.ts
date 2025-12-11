import type { ReportsAppContext } from "../context";
import type { RestorationFinalReport } from "../../domain/models";

export async function getRestorationFinal(
  ctx: ReportsAppContext,
  leadNumber: string
): Promise<RestorationFinalReport> {
  return ctx.repos.reports.getRestorationFinal(leadNumber);
}








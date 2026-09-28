import type {
  QuickbooksImportBatchReport,
  QuickbooksImportDecision,
} from "@/project/domain";
import { chunkImportDecisions } from "@/project/domain";
import type { ProjectsAppContext } from "../../context";

/**
 * Manda todas las decisiones respetando el tope del servidor: por encima de él
 * el backend rechaza el lote entero con 400, así que se trocea y se juntan los
 * resultados en un solo informe, en el mismo orden en que se pidieron.
 */
export async function importQuickbooksJobsBatch(
  ctx: ProjectsAppContext,
  decisions: readonly QuickbooksImportDecision[],
): Promise<QuickbooksImportBatchReport> {
  const chunks = chunkImportDecisions(decisions);
  const reports: QuickbooksImportBatchReport[] = [];
  for (const chunk of chunks) {
    reports.push(await ctx.repos.project.importQuickbooksJobsBatch(chunk));
  }

  return reports.reduce<QuickbooksImportBatchReport>(
    (merged, report) => ({
      total: merged.total + report.total,
      created: merged.created + report.created,
      linked: merged.linked + report.linked,
      alreadyImported: merged.alreadyImported + report.alreadyImported,
      rejected: merged.rejected + report.rejected,
      results: [...merged.results, ...report.results],
    }),
    { total: 0, created: 0, linked: 0, alreadyImported: 0, rejected: 0, results: [] },
  );
}

import type { QuickbooksJobDeactivation } from "@/project/domain";
import type { ProjectsAppContext } from "../../context";

/**
 * Desactiva el job en QuickBooks. No es un borrado: la API de QuickBooks no
 * tiene borrado para un Customer, sólo `Active: false`, y el job desaparece de
 * las listas conservando sus transacciones y su histórico.
 *
 * Las tres guardas (saldo abierto, proyecto del CRM vinculado y confirmación)
 * viven en el servidor: aquí no se replican, porque la única que importa es la
 * que nadie puede saltarse.
 */
export async function deactivateQuickbooksJob(
  ctx: ProjectsAppContext,
  qboCustomerId: string,
): Promise<QuickbooksJobDeactivation> {
  return ctx.repos.project.deactivateQuickbooksJob(qboCustomerId);
}

"use client";

import { GitFork, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { resolveCollision, type QuickbooksImportRowPlan } from "@/project/domain";

import { IMPORT_ROLE_LABEL } from "./QuickbooksImportStatus";

/**
 * Una orden de cambio es un job legítimo, no un error: el objetivo no es
 * descartarla, es que el operador vea que son dos cosas distintas ANTES de
 * vincular y pueda separarlas en un gesto.
 */
export function QuickbooksImportCollisionPanel({
  plan,
  onUseSuggestion,
  canWrite,
}: {
  plan: QuickbooksImportRowPlan;
  onUseSuggestion: (projectNumber: string) => void;
  canWrite: boolean;
}) {
  const resolution = resolveCollision(plan.job);
  if (!resolution) return null;

  const suggestion = resolution.suggestedProjectNumber;
  // Cualquier número de orden de cambio válido resuelve la colisión, no sólo el
  // que propone el backend: `001R-0625 CO02` y la grafía `C01` también cuentan.
  const alreadyApplied = suggestion != null && !plan.changeOrderNeedsOwnNumber;

  return (
    <div className="space-y-2 rounded-lg border border-line bg-elev-3 p-3">
      <div className="flex items-center gap-2 font-display text-xs uppercase tracking-wide text-fg-faint">
        <GitFork className="size-3.5" aria-hidden />
        Contra quién choca
      </div>

      <ul className="space-y-1 text-sm">
        <li className="text-fg">
          <span className="text-fg-dim">Esta fila</span> — job{" "}
          <span className="font-mono tabular-nums">{plan.job.qboCustomerId}</span> · parece el{" "}
          {IMPORT_ROLE_LABEL[plan.job.role]}
          {plan.job.changeOrderNumber != null ? ` n.º ${plan.job.changeOrderNumber}` : ""}
        </li>
        {plan.job.collidesWith.map((other) => (
          <li key={other.qboCustomerId} className="text-fg">
            <span className="text-fg-dim">{other.displayName}</span> — job{" "}
            <span className="font-mono tabular-nums">{other.qboCustomerId}</span> · parece el{" "}
            {IMPORT_ROLE_LABEL[other.role]}
            {other.changeOrderNumber != null ? ` n.º ${other.changeOrderNumber}` : ""}
            {other.importedProjectId != null
              ? ` · ya importado como el proyecto #${other.importedProjectId}`
              : ""}
          </li>
        ))}
      </ul>

      {resolution.indeterminate ? (
        <p className="flex items-start gap-2 text-sm text-fg-dim">
          <TriangleAlert
            className="mt-0.5 size-4 shrink-0"
            style={{ color: "hsl(var(--badge-amber))" }}
            aria-hidden
          />
          Los nombres no dicen cuál es el contrato base y cuál la orden de cambio, así que nadie
          puede decidirlo por ti: escribe a mano el número que le toca a cada uno.
        </p>
      ) : suggestion ? (
        <div className="flex flex-wrap items-center gap-2">
          {canWrite ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={alreadyApplied}
              onClick={() => onUseSuggestion(suggestion)}
            >
              Usar {suggestion} para la orden de cambio
            </Button>
          ) : null}
          <span className="text-sm text-fg-dim">
            {alreadyApplied
              ? "La orden de cambio ya va con su propio número: las dos filas pueden importarse."
              : "Sin su propio número, el servidor rechaza la orden de cambio para no robarle el proyecto al contrato base."}
          </span>
        </div>
      ) : plan.job.role === "orden_de_cambio" ? (
        <p className="text-sm text-fg-dim">
          Es una orden de cambio, pero su nombre no trae el número de la orden, así que no se puede
          proponer un número: escríbelo a mano (por ejemplo {plan.job.projectNumber} CO01).
        </p>
      ) : (
        <p className="text-sm text-fg-dim">
          Esta fila es el contrato base y se queda con su número. La que tiene que separarse es la
          orden de cambio.
        </p>
      )}
    </div>
  );
}

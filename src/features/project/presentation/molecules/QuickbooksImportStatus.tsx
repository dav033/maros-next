"use client";

import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import type {
  QuickbooksImportBlockedReason,
  QuickbooksImportJob,
  QuickbooksImportJobRole,
  QuickbooksImportJobStatus,
  QuickbooksImportOutcome,
} from "@/project/domain";

/**
 * Cada estado lleva su propia etiqueta escrita, así que el color nunca es el
 * único canal: en una tabla de cien filas el color es lo primero que se pierde
 * (impresión, daltonismo, pantalla mala) y el texto sigue ahí. El punto es el
 * mismo en los cinco: decora, no distingue.
 */
const STATUS_COPY: Record<QuickbooksImportJobStatus, { label: string; hue: string }> = {
  ok: { label: "Listo para importar", hue: "--badge-green" },
  colision: { label: "Colisión de número", hue: "--badge-orange" },
  numero_en_uso: { label: "Número ya vinculado", hue: "--badge-red" },
  sin_numero: { label: "Sin número", hue: "--badge-amber" },
  ya_importado: { label: "Ya importado", hue: "--badge-neutral" },
};

const OUTCOME_COPY: Record<QuickbooksImportOutcome, { label: string; hue: string }> = {
  created: { label: "Creado", hue: "--badge-green" },
  linked: { label: "Vinculado", hue: "--badge-blue" },
  already_imported: { label: "Ya estaba", hue: "--badge-neutral" },
  rejected: { label: "Rechazado", hue: "--badge-red" },
};

export const IMPORT_ROLE_LABEL: Record<QuickbooksImportJobRole, string> = {
  contrato_base: "contrato base",
  orden_de_cambio: "orden de cambio",
  indeterminado: "sin determinar",
};

export const IMPORT_BLOCKED_COPY: Record<QuickbooksImportBlockedReason, string> = {
  ya_importado: "Ya está importado: no queda nada que decidir.",
  sin_numero: "Sin número no se puede importar: escribe el del proyecto.",
  numero_en_uso:
    "Ese número ya está vinculado a otro job. Escribe otro, o rompe el vínculo desde la ficha del proyecto.",
  orden_de_cambio_sin_numero:
    "Es una orden de cambio: no puede quedarse con el número del contrato base. Escríbele el suyo (por ejemplo 001R-0625 CO01).",
};

function DotBadge({ hue, children }: { hue: string; children: ReactNode }) {
  const color = `hsl(var(${hue}))`;
  return (
    <Badge variant="outline" className="gap-1.5 font-medium" style={{ borderColor: color, color }}>
      <span
        aria-hidden
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {children}
    </Badge>
  );
}

export function QuickbooksImportStatusBadge({ status }: { status: QuickbooksImportJobStatus }) {
  const copy = STATUS_COPY[status];
  if (!copy) return <DotBadge hue="--badge-neutral">{status}</DotBadge>;
  return <DotBadge hue={copy.hue}>{copy.label}</DotBadge>;
}

export function QuickbooksImportOutcomeBadge({ outcome }: { outcome: QuickbooksImportOutcome }) {
  const copy = OUTCOME_COPY[outcome];
  if (!copy) return <DotBadge hue="--badge-neutral">{outcome}</DotBadge>;
  return <DotBadge hue={copy.hue}>{copy.label}</DotBadge>;
}

/**
 * Frase propia para cada estado. `statusDetail` del backend viene en inglés, así
 * que sólo se usa de respaldo para un estado que aquí todavía no exista.
 */
export function describeImportStatus(job: QuickbooksImportJob): string {
  switch (job.status) {
    case "ya_importado":
      return `Ya está importado como el proyecto #${job.importedProjectId}.`;
    case "sin_numero":
      return "El nombre del job no lleva número de proyecto. Escríbelo a mano para poder importarlo.";
    case "numero_en_uso":
      return job.conflictProjectId != null
        ? `El número ${job.projectNumber} ya lo tiene el proyecto #${job.conflictProjectId}, vinculado a otro job de QuickBooks.`
        : `El número ${job.projectNumber} ya está vinculado a otro job de QuickBooks.`;
    case "colision":
      return `${job.collidesWith.length + 1} jobs de QuickBooks derivan el número ${job.projectNumber}.`;
    case "ok":
      return "El número sale del nombre del job y no lo reclama nadie más.";
  }
  return job.statusDetail;
}

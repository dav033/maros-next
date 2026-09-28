"use client";

import { ArrowDownToLine, Loader2, TriangleAlert, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  QUICKBOOKS_IMPORT_BATCH_LIMIT,
  type QuickbooksImportPlanSummary,
} from "@/project/domain";

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/**
 * Vista previa agregada: lo que el lote va a hacer, dicho antes de pulsar el
 * botón. Sin esto, importar cien jobs es cien apuestas a ciegas.
 */
export function QuickbooksImportSummaryCard({
  summary,
  canWrite,
  isImporting,
  onImport,
  onClearSelection,
}: {
  summary: QuickbooksImportPlanSummary;
  canWrite: boolean;
  isImporting: boolean;
  onImport: () => void;
  onClearSelection: () => void;
}) {
  const nothingSelected = summary.selected === 0;

  return (
    <section
      aria-label="Vista previa de la importación"
      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-elev-2 p-4"
    >
      <div className="min-w-0 space-y-1">
        <p className="font-display text-xs uppercase tracking-wide text-fg-faint">
          {plural(summary.selected, "fila seleccionada", "filas seleccionadas")}
        </p>
        <p className="text-sm text-fg">
          {nothingSelected
            ? "Marca las filas que quieras importar. El contador no se pierde al buscar ni al filtrar."
            : `Vas a crear ${plural(summary.toCreate, "proyecto", "proyectos")} y vincular ${summary.toLink}.`}
        </p>

        {summary.unresolvedCollisions > 0 ? (
          <p className="flex items-start gap-2 text-sm text-fg-dim">
            <TriangleAlert
              className="mt-0.5 size-4 shrink-0"
              style={{ color: "hsl(var(--badge-orange))" }}
              aria-hidden
            />
            {plural(summary.unresolvedCollisions, "fila sigue", "filas siguen")} peleando el mismo
            número: si las mandas así, el servidor aceptará una y rechazará el resto.
          </p>
        ) : null}

        {summary.blocked > 0 ? (
          <p className="text-sm text-fg-dim">
            {plural(summary.blocked, "fila marcada no se puede", "filas marcadas no se pueden")}{" "}
            importar y no viajan en el lote.
          </p>
        ) : null}

        {summary.batches > 1 ? (
          <p className="text-sm text-fg-dim">
            El servidor acepta {QUICKBOOKS_IMPORT_BATCH_LIMIT} decisiones por lote, así que se
            manda en {plural(summary.batches, "lote", "lotes")} seguidos.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {summary.selected > 0 || summary.blocked > 0 ? (
          <Button variant="ghost" onClick={onClearSelection} disabled={isImporting}>
            <X className="mr-2 size-4" aria-hidden />
            Quitar selección
          </Button>
        ) : null}
        {canWrite ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={nothingSelected || isImporting}>
                {isImporting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                ) : (
                  <ArrowDownToLine className="mr-2 size-4" aria-hidden />
                )}
                {isImporting ? "Importando…" : `Importar ${summary.selected}`}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  ¿Importar {plural(summary.selected, "fila", "filas")} de QuickBooks?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Se van a crear {plural(summary.toCreate, "proyecto", "proyectos")} y vincular{" "}
                  {summary.toLink}, en {plural(summary.batches, "lote", "lotes")}. La selección no
                  se pierde al buscar ni al filtrar, así que puede llevar filas que ahora no estás
                  viendo. En QuickBooks no cambia nada.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onImport}>
                  Importar {summary.selected}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>
    </section>
  );
}

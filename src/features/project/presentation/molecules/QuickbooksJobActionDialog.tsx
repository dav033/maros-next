"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { QuickbooksJobPendingAction } from "../pages/useQuickbooksImportPageLogic";

export type QuickbooksJobActionDialogProps = {
  /** `null` deja el diálogo cerrado. */
  pending: QuickbooksJobPendingAction | null;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Última parada antes de desvincular o de desactivar.
 *
 * Las dos copias nombran dónde cae el cambio —el CRM o la contabilidad— porque
 * es la diferencia que el operador no puede deducir del botón: desvincular es
 * reversible y no toca QuickBooks; desactivar escribe en QuickBooks y es lo más
 * parecido a eliminar que su API permite, pero no borra nada.
 */
export function QuickbooksJobActionDialog({
  pending,
  onCancel,
  onConfirm,
}: QuickbooksJobActionDialogProps) {
  const isUnlink = pending?.action === "desvincular";
  const job = pending?.job;

  return (
    <AlertDialog
      open={pending !== null}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isUnlink
              ? "¿Desvincular este job del proyecto del CRM?"
              : "¿Desactivar este job en QuickBooks?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isUnlink ? (
              <>
                Se rompe el vínculo entre el job «{job?.displayName}» y el proyecto #
                {job?.importedProjectId} del CRM. El proyecto y su lead se conservan tal como
                están, y en QuickBooks no cambia nada. El job vuelve a esta lista como
                importable, así que la acción es reversible: se puede volver a importar.
              </>
            ) : (
              <>
                Esto se hace en la contabilidad, no en el CRM: pone el job «{job?.displayName}»
                como inactivo en QuickBooks («Make inactive»), que es lo más parecido a
                eliminarlo que su API permite. Dejará de aparecer en las listas de QuickBooks,
                pero sus transacciones y su histórico se conservan, y se puede volver a activar
                desde QuickBooks. En el CRM no cambia nada.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className={
              isUnlink ? undefined : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            }
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {isUnlink ? "Desvincular" : "Desactivar en QuickBooks"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

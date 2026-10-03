"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowDownToLine,
  CircleAlert,
  FolderKanban,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { Can } from "@/shared/auth/Can";
import { useHasPermission } from "@/shared/auth/useHasPermission";
import { PageHeaderCard } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AppError } from "@/shared/errors";

import { QuickbooksJobActionDialog } from "../molecules/QuickbooksJobActionDialog";
import { QuickbooksImportSummaryCard } from "../organisms/QuickbooksImportSummaryCard";
import { QuickbooksImportTable } from "../organisms/QuickbooksImportTable";
import { useQuickbooksImportPageLogic } from "./useQuickbooksImportPageLogic";

export function QuickbooksImportPage() {
  return (
    <Can permission="projects:read" fallback={<AccessMessage />}>
      <Can permission="finance:read" fallback={<AccessMessage />}>
        <QuickbooksImportScreen />
      </Can>
    </Can>
  );
}

function QuickbooksImportScreen() {
  const pathname = usePathname();
  const canWrite = useHasPermission("projects:write");
  // Desactivar un job escribe en la contabilidad, no en el CRM: el permiso que
  // exige la ruta es finance:write, y el botón no puede ofrecer lo que el
  // servidor va a rechazar con un 403.
  const canWriteFinance = useHasPermission("finance:write");
  const canDeactivate = canWrite && canWriteFinance;
  const logic = useQuickbooksImportPageLogic();

  const emptyMessage =
    logic.totalJobs === 0
      ? "QuickBooks no devolvió ningún job activo."
      : !logic.showImported && !logic.query.trim()
        ? "Todos los jobs activos están ya importados. Enciende «Mostrar importados» para revisar sus vínculos."
        : "Ningún job coincide con la búsqueda.";

  return (
    <main className="space-y-5 p-4 sm:p-6">
      <PageHeaderCard
        icon={ArrowDownToLine}
        title="Importar desde QuickBooks"
        description="Revisa los jobs activos de QuickBooks y trae al CRM el trabajo que falte. Cada job queda vinculado por su id exacto de QuickBooks; QuickBooks no se toca."
        belowSlot={
          <nav
            className="inline-flex flex-wrap gap-1 rounded-xl bg-elev-3 p-1"
            aria-label="Secciones de proyectos"
          >
            <Button
              asChild
              size="sm"
              variant="ghost"
              className={`rounded-lg ${
                pathname !== "/projects/import-from-quickbooks"
                  ? "bg-elev-1 text-fg hover:bg-elev-1"
                  : "text-fg-dim"
              }`}
            >
              <Link href="/projects/construction">
                <FolderKanban className="mr-2 size-4" aria-hidden />
                Proyectos
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="rounded-lg bg-elev-1 text-fg hover:bg-elev-1"
            >
              <Link href="/projects/import-from-quickbooks" aria-current="page">
                <ArrowDownToLine className="mr-2 size-4" aria-hidden />
                Importar desde QuickBooks
              </Link>
            </Button>
          </nav>
        }
      />

      {logic.loadError ? (
        <Alert variant="destructive">
          <CircleAlert className="size-4" aria-hidden />
          <AlertTitle>No pudimos traer los jobs de QuickBooks</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>{AppError.from(logic.loadError).userMessage}</span>
            <Button size="sm" variant="outline" onClick={logic.refetch}>
              <RefreshCw className="mr-2 size-4" aria-hidden />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {logic.importError ? (
        <Alert variant="destructive">
          <CircleAlert className="size-4" aria-hidden />
          <AlertTitle>El lote no llegó al servidor</AlertTitle>
          <AlertDescription>
            {AppError.from(logic.importError).userMessage} Nada se importó: la selección sigue
            intacta.
          </AlertDescription>
        </Alert>
      ) : null}

      {logic.report ? (
        <Alert variant={logic.report.total === logic.report.rejected ? "destructive" : "default"}>
          {logic.report.total === logic.report.rejected ? (
            <CircleAlert className="size-4" aria-hidden />
          ) : (
            <ArrowDownToLine className="size-4" aria-hidden />
          )}
          <AlertTitle>
            {logic.report.total === logic.report.rejected
              ? "El servidor rechazó el lote entero"
              : "Lote aplicado"}
          </AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>
              {logic.report.created} creados · {logic.report.linked} vinculados ·{" "}
              {logic.report.alreadyImported} ya estaban · {logic.report.rejected} rechazados. El
              motivo de cada rechazo está en la columna «Resultado».
            </span>
            <Button size="sm" variant="outline" onClick={logic.dismissReport}>
              <X className="mr-2 size-4" aria-hidden />
              Cerrar
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="space-y-3" aria-label="Jobs de QuickBooks">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-faint"
              aria-hidden
            />
            <Input
              value={logic.query}
              onChange={(event) => logic.setQuery(event.target.value)}
              placeholder="Buscar por nombre del job, número de proyecto, padre o id"
              aria-label="Buscar jobs de QuickBooks"
              className="border-line-strong pl-9"
            />
          </div>
          <div className="flex min-h-10 items-center gap-3 rounded-lg border border-line-strong px-3">
            <Switch
              id="show-imported-jobs"
              checked={logic.showImported}
              onCheckedChange={logic.setShowImported}
            />
            <Label
              htmlFor="show-imported-jobs"
              className="cursor-pointer whitespace-nowrap text-sm text-fg-dim"
            >
              Mostrar importados
            </Label>
          </div>
          <Button variant="outline" onClick={logic.refetch} disabled={logic.isFetching}>
            <RefreshCw
              className={`mr-2 size-4 ${logic.isFetching ? "animate-spin" : ""}`}
              aria-hidden
            />
            Actualizar
          </Button>
        </div>

        <QuickbooksImportSummaryCard
          summary={logic.summary}
          canWrite={canWrite}
          isImporting={logic.isImporting}
          onImport={logic.importSelected}
          onClearSelection={logic.clearSelection}
        />

        <QuickbooksImportTable
          rows={logic.visibleRows}
          selectedIds={logic.selectedIds}
          onToggleRow={logic.toggleRow}
          onToggleAll={logic.toggleVisibleImportable}
          allSelected={logic.allVisibleImportableSelected}
          someSelected={logic.someVisibleImportableSelected}
          onProjectNumberChange={logic.setProjectNumber}
          onResetProjectNumber={logic.resetProjectNumber}
          onLeadChoiceChange={logic.setLeadChoice}
          resultsByJob={logic.resultsByJob}
          showResults={logic.report != null}
          isLoading={logic.isPending}
          emptyMessage={emptyMessage}
          canWrite={canWrite}
          canDeactivate={canDeactivate}
          onRequestAction={logic.requestAction}
          actingJobId={logic.actingJobId}
        />

        <QuickbooksJobActionDialog
          pending={logic.pendingAction}
          onCancel={logic.cancelAction}
          onConfirm={logic.confirmAction}
        />

        <p className="text-sm text-fg-dim">
          {logic.visibleRows.length} de {logic.totalJobs} jobs a la vista · importar sólo crea o
          vincula registros del CRM.
        </p>
      </section>
    </main>
  );
}

function AccessMessage() {
  return (
    <main className="p-6">
      <Alert variant="destructive">
        <CircleAlert className="size-4" aria-hidden />
        <AlertDescription>
          Necesitas acceso a Proyectos y a las finanzas de QuickBooks para ver esta pantalla.
        </AlertDescription>
      </Alert>
    </main>
  );
}

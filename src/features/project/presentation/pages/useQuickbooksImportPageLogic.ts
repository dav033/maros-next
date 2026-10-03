"use client";

import { useCallback, useMemo, useState } from "react";

import { toast } from "sonner";

import type {
  QuickbooksImportBatchReport,
  QuickbooksImportDecisionResult,
  QuickbooksImportJob,
} from "@/project/domain";
import {
  buildImportDecisions,
  planImportRows,
  summarizeImportPlan,
  type QuickbooksImportPlanSummary,
  type QuickbooksImportRowPlan,
} from "@/project/domain";

import { useUnlinkProjectQboLink } from "@/features/quickbooks/presentation/hooks/useUnlinkProjectQboLink";
import { AppError } from "@/shared/errors";

import { useQuickbooksImportJobs } from "../hooks/data/useQuickbooksImportJobs";
import { useQuickbooksImportBatch } from "../hooks/mutations/useQuickbooksImportBatch";
import { useQuickbooksJobDeactivation } from "../hooks/mutations/useQuickbooksJobDeactivation";

/**
 * Las dos acciones que deshacen trabajo, siempre detrás de una confirmación.
 *
 * `desvincular` toca sólo el CRM y es reversible; `desactivar` escribe en la
 * contabilidad. Comparten el mismo estado porque sólo puede haber una
 * confirmación abierta a la vez.
 */
export type QuickbooksJobAction = "desvincular" | "desactivar";

export type QuickbooksJobPendingAction = {
  action: QuickbooksJobAction;
  job: QuickbooksImportJob;
};

/**
 * El mensaje del servidor antes que la copia genérica por estado: un 409 de
 * estas rutas trae el importe del saldo abierto o el proyecto que hay que
 * desvincular, y `userMessage` lo cambiaría por «Ya existe un registro con esos
 * datos». Lo mismo con un error que viene literal de QuickBooks.
 */
function describeActionError(error: unknown): string {
  const appError = AppError.from(error);
  return appError.serverMessage?.trim() || appError.userMessage;
}

export type QuickbooksImportPageLogic = {
  rows: QuickbooksImportRowPlan[];
  /** Filas que pasan el buscador y el interruptor de importados. */
  visibleRows: QuickbooksImportRowPlan[];
  totalJobs: number;
  isPending: boolean;
  isFetching: boolean;
  loadError: Error | null;
  refetch: () => void;

  query: string;
  setQuery: (value: string) => void;
  showImported: boolean;
  setShowImported: (value: boolean) => void;

  selectedIds: ReadonlySet<string>;
  toggleRow: (qboCustomerId: string) => void;
  /** Marca o desmarca de golpe todo lo importable que se está viendo. */
  toggleVisibleImportable: () => void;
  clearSelection: () => void;
  allVisibleImportableSelected: boolean;
  someVisibleImportableSelected: boolean;

  /** Número escrito encima del que derivó el backend, por job. */
  setProjectNumber: (qboCustomerId: string, projectNumber: string) => void;
  resetProjectNumber: (qboCustomerId: string) => void;
  /** Registro del CRM elegido cuando el número casa con varios. */
  setLeadChoice: (qboCustomerId: string, leadId: number) => void;

  summary: QuickbooksImportPlanSummary;
  importSelected: () => void;
  isImporting: boolean;
  importError: Error | null;
  report: QuickbooksImportBatchReport | null;
  resultsByJob: ReadonlyMap<string, QuickbooksImportDecisionResult>;
  dismissReport: () => void;

  /** Acción esperando confirmación; `null` deja el diálogo cerrado. */
  pendingAction: QuickbooksJobPendingAction | null;
  requestAction: (action: QuickbooksJobAction, job: QuickbooksImportJob) => void;
  cancelAction: () => void;
  confirmAction: () => void;
  /** Job sobre el que hay una acción en vuelo, para desactivar su fila. */
  actingJobId: string | null;
};

function matchesQuery(plan: QuickbooksImportRowPlan, term: string): boolean {
  if (!term) return true;
  const { job } = plan;
  return [job.displayName, job.projectNumber ?? "", job.parentName ?? "", job.qboCustomerId].some(
    (value) => value.toLowerCase().includes(term),
  );
}

export function useQuickbooksImportPageLogic(): QuickbooksImportPageLogic {
  const jobsQuery = useQuickbooksImportJobs();
  const importBatch = useQuickbooksImportBatch();
  const unlink = useUnlinkProjectQboLink();
  const deactivate = useQuickbooksJobDeactivation();
  const refetchJobs = jobsQuery.refetch;

  const [query, setQuery] = useState("");
  const [showImported, setShowImported] = useState(false);
  // La selección vive por id de job, no por índice de fila: así sobrevive al
  // buscador, al interruptor de importados y a un refetch de la lista.
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set<string>());
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  // Un número puede casar con varios leads y sólo el operador sabe cuál es el
  // destino: sin esta elección la fila decidiría sola.
  const [chosenLeadIds, setChosenLeadIds] = useState<Record<string, number>>({});
  const [report, setReport] = useState<QuickbooksImportBatchReport | null>(null);
  const [pendingAction, setPendingAction] = useState<QuickbooksJobPendingAction | null>(null);
  const [actingJobId, setActingJobId] = useState<string | null>(null);

  const jobs = jobsQuery.data ?? [];
  const rows = useMemo(
    () => planImportRows(jobs, overrides, chosenLeadIds),
    [jobs, overrides, chosenLeadIds],
  );

  const visibleRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter(
      (plan) =>
        (showImported || plan.job.importedProjectId == null) && matchesQuery(plan, term),
    );
  }, [rows, query, showImported]);

  const visibleImportable = useMemo(
    () => visibleRows.filter((plan) => plan.blockedReason == null),
    [visibleRows],
  );

  const allVisibleImportableSelected =
    visibleImportable.length > 0 &&
    visibleImportable.every((plan) => selectedIds.has(plan.qboCustomerId));
  const someVisibleImportableSelected = visibleImportable.some((plan) =>
    selectedIds.has(plan.qboCustomerId),
  );

  const toggleRow = useCallback((qboCustomerId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (!next.delete(qboCustomerId)) next.add(qboCustomerId);
      return next;
    });
  }, []);

  const toggleVisibleImportable = useCallback(() => {
    const ids = visibleImportable.map((plan) => plan.qboCustomerId);
    setSelectedIds((current) => {
      const next = new Set(current);
      const selectAll = !ids.every((id) => next.has(id));
      for (const id of ids) {
        if (selectAll) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, [visibleImportable]);

  const clearSelection = useCallback(() => setSelectedIds(new Set<string>()), []);

  const setProjectNumber = useCallback((qboCustomerId: string, projectNumber: string) => {
    setOverrides((current) => ({ ...current, [qboCustomerId]: projectNumber }));
  }, []);

  const resetProjectNumber = useCallback((qboCustomerId: string) => {
    setOverrides((current) => {
      const next = { ...current };
      delete next[qboCustomerId];
      return next;
    });
  }, []);

  const setLeadChoice = useCallback((qboCustomerId: string, leadId: number) => {
    setChosenLeadIds((current) => ({ ...current, [qboCustomerId]: leadId }));
  }, []);

  const summary = useMemo(() => summarizeImportPlan(rows, selectedIds), [rows, selectedIds]);

  const importSelected = useCallback(() => {
    const decisions = buildImportDecisions(rows, selectedIds);
    if (decisions.length === 0) return;
    importBatch.mutate(decisions, {
      onSuccess: (result) => {
        setReport(result);
        // Lo aceptado se quita de la selección y lo rechazado se queda marcado,
        // para poder arreglar el número y volver a intentarlo sin rebuscarlo.
        setSelectedIds((current) => {
          const next = new Set(current);
          for (const row of result.results) {
            if (row.outcome !== "rejected") next.delete(row.qboCustomerId);
          }
          return next;
        });
      },
    });
  }, [rows, selectedIds, importBatch]);

  const requestAction = useCallback(
    (action: QuickbooksJobAction, job: QuickbooksImportJob) =>
      setPendingAction({ action, job }),
    [],
  );
  const cancelAction = useCallback(() => setPendingAction(null), []);

  const confirmAction = useCallback(() => {
    if (!pendingAction) return;
    const { action, job } = pendingAction;
    setPendingAction(null);
    setActingJobId(job.qboCustomerId);
    const settle = () => setActingJobId(null);

    if (action === "desvincular") {
      // El botón sólo existe en una fila importada, pero entre que se pinta y se
      // confirma la lista pudo refrescarse: sin id de proyecto no hay nada que
      // desvincular.
      if (job.importedProjectId == null) {
        settle();
        return;
      }
      unlink.mutate(job.importedProjectId, {
        onSuccess: (result) => {
          toast.success(
            result.unlinked
              ? `Job ${job.displayName} desvinculado. El proyecto #${result.projectId} y su lead se conservan, y el job vuelve a ser importable.`
              : "Ese proyecto ya no tenía vínculo con QuickBooks.",
          );
          // El vínculo es lo que marcaba la fila como «ya importado», así que la
          // lista tiene que volver a diagnosticarse para ofrecerla importable.
          void refetchJobs();
          settle();
        },
        onError: (error) => {
          toast.error(describeActionError(error));
          settle();
        },
      });
      return;
    }

    deactivate.mutate(job.qboCustomerId, {
      onSuccess: (result) => {
        toast.success(
          result.alreadyInactive
            ? `El job ${result.displayName} ya estaba inactivo en QuickBooks.`
            : `Job ${result.displayName} desactivado en QuickBooks. Sus transacciones y su histórico se conservan.`,
        );
        settle();
      },
      onError: (error) => {
        toast.error(describeActionError(error));
        settle();
      },
    });
  }, [pendingAction, unlink, deactivate, refetchJobs]);

  const resultsByJob = useMemo(
    () =>
      new Map((report?.results ?? []).map((result) => [result.qboCustomerId, result] as const)),
    [report],
  );

  return {
    rows,
    visibleRows,
    totalJobs: jobs.length,
    isPending: jobsQuery.isPending,
    isFetching: jobsQuery.isFetching,
    loadError: jobsQuery.error ?? null,
    refetch: () => void jobsQuery.refetch(),

    query,
    setQuery,
    showImported,
    setShowImported,

    selectedIds,
    toggleRow,
    toggleVisibleImportable,
    clearSelection,
    allVisibleImportableSelected,
    someVisibleImportableSelected,

    setProjectNumber,
    resetProjectNumber,
    setLeadChoice,

    summary,
    importSelected,
    isImporting: importBatch.isPending,
    importError: importBatch.error ?? null,
    report,
    resultsByJob,
    dismissReport: () => setReport(null),

    pendingAction,
    requestAction,
    cancelAction,
    confirmAction,
    actingJobId,
  };
}

"use client";

import { useCallback, useMemo, useState } from "react";

import type {
  QuickbooksImportBatchReport,
  QuickbooksImportDecisionResult,
} from "@/project/domain";
import {
  buildImportDecisions,
  planImportRows,
  summarizeImportPlan,
  type QuickbooksImportPlanSummary,
  type QuickbooksImportRowPlan,
} from "@/project/domain";

import { useQuickbooksImportJobs } from "../hooks/data/useQuickbooksImportJobs";
import { useQuickbooksImportBatch } from "../hooks/mutations/useQuickbooksImportBatch";

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
  };
}

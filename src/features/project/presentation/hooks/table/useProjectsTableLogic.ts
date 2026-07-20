"use client";

import { useMemo } from "react";
import {
  useEntityTableLogic,
  usePersistedState,
  setStorageCodec,
  useTableWithSearch,
  type ContextMenuItem,
} from "@/common/hooks";
import React from "react";
import { Check } from "lucide-react";

import type { Project } from "@/project/domain";
import { ProjectProgressStatus, InvoiceStatus } from "@/project/domain";
import { PROGRESS_LABELS } from "../../organisms/projectVisualTokens";

export type ProjectGroupBy = "none" | "progressStatus" | "invoiceStatus" | "projectType" | "leadType";

interface UseProjectsTableLogicProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (projectId: number) => Promise<void>;
  onOpenNotesModal?: (project: Project) => void;
  /** Callback ejecutado al elegir un nuevo estado en el submenú "Change Status". */
  onUpdateStatus?: (project: Project, status: ProjectProgressStatus) => Promise<void> | void;
  /** Predicate que retorna `true` si el project está siendo actualizado (status). Deshabilita el submenú. */
  isUpdatingStatus?: (project: Project) => boolean;
  /** Prefijo de las keys de localStorage para persistir búsqueda/filtros/orden. Páginas sin UI
   * para progressFilter/invoiceFilter (Completed/Lost) deben pasar un namespace propio para no
   * heredar en silencio el filtro seteado en la página principal de Projects. */
  persistNamespace?: string;
}

export interface UseProjectsTableLogicReturn {
  rows: Project[];
  totalCount: number;
  filteredCount: number;
  searchState: {
    searchQuery: string;
    searchField: string;
    setSearchQuery: (q: string) => void;
    setSearchField: (f: string) => void;
  };
  filterState: {
    /** Vacío = sin filtro (se muestran todos los estados). */
    progressFilter: Set<ProjectProgressStatus>;
    setProgressFilter: (v: Set<ProjectProgressStatus>) => void;
    invoiceFilter: Set<InvoiceStatus>;
    setInvoiceFilter: (v: Set<InvoiceStatus>) => void;
    groupBy: ProjectGroupBy;
    setGroupBy: (v: ProjectGroupBy) => void;
  };
  deleteModalProps: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemToDelete: Project | null;
    isDeleting: boolean;
    error: string | null;
  };
  getContextMenuItems: (project: Project) => ContextMenuItem[];
  isMutating: (project: Project) => boolean;
}

export function useProjectsTableLogic({
  projects,
  onEdit,
  onDelete,
  onOpenNotesModal,
  onUpdateStatus,
  isUpdatingStatus,
  persistNamespace = "projects",
}: UseProjectsTableLogicProps): UseProjectsTableLogicReturn {
  const [progressFilter, setProgressFilter] = usePersistedState<Set<ProjectProgressStatus>>(
    `${persistNamespace}:progressFilter`,
    new Set(),
    setStorageCodec,
  );
  const [invoiceFilter, setInvoiceFilter] = usePersistedState<Set<InvoiceStatus>>(
    `${persistNamespace}:invoiceFilter`,
    new Set(),
    setStorageCodec,
  );
  const [groupBy, setGroupBy] = usePersistedState<ProjectGroupBy>(
    `${persistNamespace}:groupBy`,
    "none",
  );

  const {
    rows: localProjects,
    deleteModalProps,
    getContextMenuItems,
  } = useEntityTableLogic<Project, number>({
    items: projects,
    getId: (p) => p.id,
    onDelete: async (id) => {
      await onDelete(id);
    },
    onEdit,
    buildExtraMenuItems: (project) => {
      const items = [];
      const mutatingRow = isUpdatingStatus?.(project) ?? false;

      if (onUpdateStatus) {
        items.push({
          label: "Change Status",
          icon: React.createElement(Check, { className: "size-4" }),
          disabled: mutatingRow,
          subItems: Object.values(ProjectProgressStatus).map((status) => ({
            label: PROGRESS_LABELS[status] ?? status,
            checked: project.projectProgressStatus === status,
            disabled: project.projectProgressStatus === status || mutatingRow,
            onClick: () => {
              void onUpdateStatus(project, status);
            },
          })),
        });
      }

      if (onOpenNotesModal) {
        items.push({
          label: "Notes",
          onClick: () => onOpenNotesModal(project),
          icon: "lucide:sticky-note",
          disabled: mutatingRow,
        });
      }
      return items;
    },
  });

  const isMutating = (project: Project) => isUpdatingStatus?.(project) ?? false;

  const {
    filteredData: searchFiltered,
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
  } = useTableWithSearch<Project>({
    data: localProjects,
    searchableFields: ["all"],
    defaultSearchField: "all",
    customSearchFn: (project, query, field) => {
      const normalizedQuery = query.toLowerCase().trim();
      if (!normalizedQuery) return true;

      if (field === "all" || field === "") {
        const leadName = project.lead?.name?.toLowerCase() || "";
        const leadNumber = project.lead?.leadNumber?.toLowerCase() || "";
        const estimatedAmount = project.financial?.estimatedAmount?.toString() || "";
        const paidAmount = project.financial?.paidAmount?.toString() || "";
        return (
          leadName.includes(normalizedQuery) ||
          leadNumber.includes(normalizedQuery) ||
          estimatedAmount.includes(normalizedQuery) ||
          paidAmount.includes(normalizedQuery)
        );
      }

      switch (field) {
        case "lead.name":
          return project.lead?.name?.toLowerCase().includes(normalizedQuery) ?? false;
        case "lead.leadNumber":
          return project.lead?.leadNumber?.toLowerCase().includes(normalizedQuery) ?? false;
        default:
          return true;
      }
    },
    normalize: (text: string) => text.toLowerCase().trim(),
    persistKey: `${persistNamespace}:search`,
  });

  const filteredData = useMemo(() => {
    let result = searchFiltered;
    if (progressFilter.size > 0) {
      result = result.filter(
        (p) => p.projectProgressStatus && progressFilter.has(p.projectProgressStatus),
      );
    }
    if (invoiceFilter.size > 0) {
      result = result.filter((p) => p.invoiceStatus && invoiceFilter.has(p.invoiceStatus));
    }
    return result;
  }, [searchFiltered, progressFilter, invoiceFilter]);

  return {
    rows: filteredData,
    totalCount,
    filteredCount: filteredData.length,
    searchState: {
      searchQuery,
      searchField,
      setSearchQuery,
      setSearchField,
    },
    filterState: {
      progressFilter,
      setProgressFilter,
      invoiceFilter,
      setInvoiceFilter,
      groupBy,
      setGroupBy,
    },
    deleteModalProps,
    getContextMenuItems,
    isMutating,
  };
}




"use client";

import { useMemo, useState } from "react";
import { useEntityTableLogic, useTableWithSearch } from "@/common/hooks";
import React from "react";

import type { Project } from "@/project/domain";
import { ProjectProgressStatus, InvoiceStatus } from "@/project/domain";

export type ProjectGroupBy = "none" | "progressStatus" | "invoiceStatus" | "projectType";

interface UseProjectsTableLogicProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (projectId: number) => Promise<void>;
  onOpenNotesModal?: (project: Project) => void;
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
    progressFilter: ProjectProgressStatus | "all";
    setProgressFilter: (v: ProjectProgressStatus | "all") => void;
    invoiceFilter: InvoiceStatus | "all";
    setInvoiceFilter: (v: InvoiceStatus | "all") => void;
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
  getContextMenuItems: (project: Project) => Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "danger";
    icon?: string | React.ReactNode;
    disabled?: boolean;
  }>;
}

export function useProjectsTableLogic({
  projects,
  onEdit,
  onDelete,
  onOpenNotesModal,
}: UseProjectsTableLogicProps): UseProjectsTableLogicReturn {
  const [progressFilter, setProgressFilter] = useState<ProjectProgressStatus | "all">("all");
  const [invoiceFilter, setInvoiceFilter] = useState<InvoiceStatus | "all">("all");
  const [groupBy, setGroupBy] = useState<ProjectGroupBy>("none");

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
      if (onOpenNotesModal) {
        items.push({
          label: "Notes",
          onClick: () => onOpenNotesModal(project),
          icon: "lucide:sticky-note",
        });
      }
      return items;
    },
  });

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
  });

  const filteredData = useMemo(() => {
    let result = searchFiltered;
    if (progressFilter !== "all") result = result.filter((p) => p.projectProgressStatus === progressFilter);
    if (invoiceFilter !== "all") result = result.filter((p) => p.invoiceStatus === invoiceFilter);
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
  };
}




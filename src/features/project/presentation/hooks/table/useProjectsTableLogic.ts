"use client";

import type { Project } from "@/project/domain";
import { useProjectsApp } from "@/di";
import { deleteProject } from "@/project/application";
import { useEntityTableLogic, useTableWithSearch } from "@dav033/dav-components";

interface UseProjectsTableLogicProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (projectId: number) => Promise<void>;
  onOpenNotesModal?: (project: Project) => void;
  onOpenPaymentsModal?: (project: Project) => void;
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
    icon?: string;
    disabled?: boolean;
  }>;
}

export function useProjectsTableLogic({
  projects,
  onEdit,
  onDelete,
  onOpenNotesModal,
  onOpenPaymentsModal,
}: UseProjectsTableLogicProps): UseProjectsTableLogicReturn {
  const app = useProjectsApp();

  const {
    rows: localProjects,
    deleteModalProps,
    getContextMenuItems,
  } = useEntityTableLogic<Project, number>({
    items: projects,
    getId: (p) => p.id,
    onDelete: async (id) => {
      await deleteProject(app, id);
      await onDelete(id);
    },
    onEdit,
    buildExtraMenuItems: (project) => {
      const items = [];
      if (onOpenNotesModal) {
        items.push({
          label: "Notes",
          onClick: () => onOpenNotesModal(project),
          icon: "mdi:note-text",
        });
      }
      if (onOpenPaymentsModal) {
        items.push({
          label: "Payments",
          onClick: () => onOpenPaymentsModal(project),
          icon: "mdi:cash-multiple",
        });
      }
      return items;
    },
  });

  const {
    filteredData,
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
    filteredCount,
  } = useTableWithSearch<Project>({
    data: localProjects,
    searchableFields: ["all"] as any,
    defaultSearchField: "all",
    customSearchFn: (project, query, field) => {
      const normalizedQuery = query.toLowerCase().trim();
      if (!normalizedQuery) return true;

      if (field === "all" || field === "") {
        // Search across all relevant fields
        const leadName = project.lead?.name?.toLowerCase() || "";
        const leadNumber = project.lead?.leadNumber?.toLowerCase() || "";
        const invoiceAmount = project.invoiceAmount?.toString() || "";
        const lastPayment = project.payments && project.payments.length > 0 
          ? project.payments[project.payments.length - 1].toString() 
          : "";
        
        return (
          leadName.includes(normalizedQuery) ||
          leadNumber.includes(normalizedQuery) ||
          invoiceAmount.includes(normalizedQuery) ||
          lastPayment.includes(normalizedQuery)
        );
      }

      // Field-specific search
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

  return {
    rows: filteredData,
    totalCount,
    filteredCount,
    searchState: {
      searchQuery,
      searchField,
      setSearchQuery,
      setSearchField,
    },
    deleteModalProps,
    getContextMenuItems,
  };
}




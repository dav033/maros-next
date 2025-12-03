"use client";

import * as React from "react";
import type { Company } from "../../domain/models";
import { companyCrudUseCases } from "../../application";
import { useCompanyApp } from "@/di";
import { useTableWithSearch } from "@/shared";
import {
  useContextMenu,
  useDeleteModal,
  useNotesModal,
} from "@/shared/ui";
import type { ContextMenuOption } from "@/shared/ui";

interface UseCompaniesTableLogicProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (companyId: number) => void;
  services: Array<{ id: number; name: string; color?: string | null }>;
}

export function useCompaniesTableLogic({
  companies,
  onEdit,
  onDelete,
  services,
}: UseCompaniesTableLogicProps) {
  const app = useCompanyApp();
  const { isVisible, position, options, show, hide } = useContextMenu();
  const [localCompanies, setLocalCompanies] = React.useState<Company[]>(companies);

  React.useEffect(() => {
    setLocalCompanies(companies);
  }, [companies]);

  const {
    filteredData: filteredCompanies,
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
    filteredCount,
  } = useTableWithSearch({
    data: localCompanies,
    searchableFields: ["name", "address", "type"],
    customSearchFn: (company, term, field) => {
      if (field === "all") {
        return !!(
          company.name?.toLowerCase().includes(term) ||
          company.address?.toLowerCase().includes(term) ||
          company.type?.toLowerCase().includes(term) ||
          (company.serviceId &&
            services
              .find((s) => s.id === company.serviceId)
              ?.name?.toLowerCase()
              .includes(term))
        );
      }
      if (field === "service") {
        return !!(
          company.serviceId &&
          services
            .find((s) => s.id === company.serviceId)
            ?.name?.toLowerCase()
            .includes(term)
        );
      }
      const value = company[field as keyof Company];
      return value != null && String(value).toLowerCase().includes(term);
    },
  });

  const {
    deleteModalState,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  } = useDeleteModal<Company>();

  const {
    notesModalState,
    openNotesModal,
    closeNotesModal,
    updateNotes,
    saveNotes,
  } = useNotesModal<Company>();

  const handleOpenCompanyNotesModal = React.useCallback(
    (company: Company) => {
      const notes = Array.isArray(company.notes) ? company.notes : [];
      openNotesModal(company, company.name, notes);
    },
    [openNotesModal]
  );

  const handleSaveCompanyNotes = React.useCallback(async () => {
    await saveNotes(async (company, notes) => {
      const updated = await companyCrudUseCases.update(app)(company.id, {
        notes,
      });

      setLocalCompanies((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    });
  }, [app, saveNotes]);

  const handleDeleteCompany = React.useCallback(
    async (company: Company) => {
      await confirmDelete(async (companyToDelete) => {
        await companyCrudUseCases.delete(app)(companyToDelete.id);

        setLocalCompanies((prev) =>
          prev.filter((c) => c.id !== companyToDelete.id)
        );

        onDelete(companyToDelete.id);
      });
    },
    [app, confirmDelete, onDelete]
  );

  const handleRowContextMenu = React.useCallback(
    (event: React.MouseEvent<HTMLTableRowElement>, company: Company) => {
      const contextOptions: ContextMenuOption[] = [
        {
          id: "edit",
          label: "Edit Company",
          icon: "lucide:edit",
          action: () => {
            onEdit(company);
            hide();
          },
        },
        {
          id: "delete",
          label: "Delete Company",
          icon: "lucide:trash-2",
          action: () => {
            openDeleteModal(company);
            hide();
          },
          danger: true,
        },
      ];
      show(event, contextOptions);
    },
    [onEdit, show, hide, openDeleteModal]
  );

  return {
    localCompanies,
    filteredCompanies,
    searchState: {
      searchQuery,
      searchField,
      setSearchQuery,
      setSearchField,
      totalCount,
      filteredCount,
    },
    contextMenu: { isVisible, position, options, hide },
    deleteModal: {
      state: deleteModalState,
      close: closeDeleteModal,
      handleDelete: handleDeleteCompany,
    },
    notesModal: {
      state: notesModalState,
      open: handleOpenCompanyNotesModal,
      close: closeNotesModal,
      update: updateNotes,
      save: handleSaveCompanyNotes,
    },
    handleRowContextMenu,
  };
}

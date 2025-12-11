"use client";

import type { Company } from "../../../domain/models";
import { useEntityTableLogic, useTableWithSearch } from "@dav033/dav-components";

interface UseCompaniesTableLogicProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (companyId: number) => Promise<void>;
  services: Array<{ id: number; name: string; color?: string | null }>;
  onOpenNotes?: (company: Company) => void;
}

export function useCompaniesTableLogic({
  companies,
  onEdit,
  onDelete,
  services,
  onOpenNotes,
}: UseCompaniesTableLogicProps) {
  // Estado de selección / delete modal / acciones base
  const {
    rows: localCompanies,
    deleteModalProps,
    getContextMenuItems,
  } = useEntityTableLogic<Company, number>({
    items: companies,
    getId: (c) => c.id,
    onDelete,
    onEdit,
    buildExtraMenuItems: (company) => {
      const items = [];
      if (onOpenNotes) {
        items.push({
          label: "Notes",
          onClick: () => onOpenNotes(company),
          icon: "lucide:file-text",
        });
      }
      return items;
    },
  });

  // Estado de búsqueda y conteos
  const {
    filteredData: filteredCompanies,
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
    filteredCount,
  } = useTableWithSearch<Company>({
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

  return {
    rows: filteredCompanies,
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
    onOpenNotesModal: onOpenNotes,
  };
}

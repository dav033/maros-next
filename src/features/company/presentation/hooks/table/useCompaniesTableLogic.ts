"use client";

import { useMemo, useState } from "react";
import { useEntityTableLogic, useTableWithSearch } from "@/common/hooks";

import type { Company } from "../../../domain/models";
import { CompanyType } from "../../../domain/models";

export type CompanyGroupBy = "none" | "type" | "customer" | "client";

interface UseCompaniesTableLogicProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (companyId: number) => Promise<void>;
  services: Array<{ id: number; name: string; color?: string | null }>;
  onOpenNotes?: (company: Company) => void;
}

export interface UseCompaniesTableLogicReturn {
  rows: Company[];
  totalCount: number;
  filteredCount: number;
  searchState: {
    searchQuery: string;
    searchField: string;
    setSearchQuery: (q: string) => void;
    setSearchField: (f: string) => void;
  };
  filterState: {
    typeFilter: CompanyType | "all";
    setTypeFilter: (v: CompanyType | "all") => void;
    customerFilter: boolean | "all";
    setCustomerFilter: (v: boolean | "all") => void;
    clientFilter: boolean | "all";
    setClientFilter: (v: boolean | "all") => void;
    groupBy: CompanyGroupBy;
    setGroupBy: (v: CompanyGroupBy) => void;
  };
  deleteModalProps: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemToDelete: Company | null;
    isDeleting: boolean;
    error: string | null;
  };
  getContextMenuItems: (company: Company) => Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "danger";
    icon?: string | React.ReactNode;
    disabled?: boolean;
  }>;
  onOpenNotesModal?: (company: Company) => void;
}

export function useCompaniesTableLogic({
  companies,
  onEdit,
  onDelete,
  services,
  onOpenNotes,
}: UseCompaniesTableLogicProps): UseCompaniesTableLogicReturn {
  const [typeFilter, setTypeFilter] = useState<CompanyType | "all">("all");
  const [customerFilter, setCustomerFilter] = useState<boolean | "all">("all");
  const [clientFilter, setClientFilter] = useState<boolean | "all">("all");
  const [groupBy, setGroupBy] = useState<CompanyGroupBy>("none");

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

  const {
    filteredData: searchFiltered,
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
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

  const filteredCompanies = useMemo(() => {
    let result = searchFiltered;
    if (typeFilter !== "all") result = result.filter((c) => c.type === typeFilter);
    if (customerFilter !== "all") result = result.filter((c) => c.isCustomer === customerFilter);
    if (clientFilter !== "all") result = result.filter((c) => c.isClient === clientFilter);
    return result;
  }, [searchFiltered, typeFilter, customerFilter, clientFilter]);

  return {
    rows: filteredCompanies,
    totalCount,
    filteredCount: filteredCompanies.length,
    searchState: {
      searchQuery,
      searchField,
      setSearchQuery,
      setSearchField,
    },
    filterState: {
      typeFilter,
      setTypeFilter,
      customerFilter,
      setCustomerFilter,
      clientFilter,
      setClientFilter,
      groupBy,
      setGroupBy,
    },
    deleteModalProps,
    getContextMenuItems,
    onOpenNotesModal: onOpenNotes,
  };
}

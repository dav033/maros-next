"use client";

import { TableToolbar } from "@/shared/ui";
import type { Company } from "../../domain/models";

export type CompaniesToolbarProps = {
  searchQuery: string;
  searchField: string;
  onSearchQueryChange: (value: string) => void;
  onSearchFieldChange: (value: string) => void;
  totalCount?: number;
  filteredCount?: number;
  onManageServices?: () => void;
  onNewCompany?: () => void;
};

export function CompaniesToolbar({
  searchQuery,
  searchField,
  onSearchQueryChange,
  onSearchFieldChange,
  totalCount,
  filteredCount,
  onManageServices,
  onNewCompany,
}: CompaniesToolbarProps) {
  const searchFields = [
    { value: "all", label: "All fields" },
    { value: "name", label: "Name" },
    { value: "address", label: "Address" },
    { value: "type", label: "Type" },
    { value: "service", label: "Service" },
  ];

  const hasActiveSearch = searchQuery.trim().length > 0;

  function handleClearSearch() {
    onSearchQueryChange("");
  }

  return (
    <TableToolbar
      searchTerm={searchQuery}
      onSearchChange={onSearchQueryChange}
      selectedField={searchField}
      onFieldChange={onSearchFieldChange}
      searchFields={searchFields}
      placeholder="Search companies..."
      hasActiveSearch={hasActiveSearch}
      onClearSearch={handleClearSearch}
      resultCount={filteredCount}
      totalCount={totalCount}
      rightSlot={
        <div className="flex items-center gap-2">
          {onManageServices && (
            <button
              type="button"
              onClick={onManageServices}
              className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-theme-light hover:bg-white/10"
            >
              Manage Services
            </button>
          )}
          {onNewCompany && (
            <button
              type="button"
              onClick={onNewCompany}
              className="inline-flex items-center rounded-lg bg-theme-primary px-3 py-1.5 text-sm text-white hover:bg-theme-primary/90"
            >
              New Company
            </button>
          )}
        </div>
      }
    />
  );
}

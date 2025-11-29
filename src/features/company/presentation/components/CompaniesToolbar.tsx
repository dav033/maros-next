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
};

export function CompaniesToolbar({
  searchQuery,
  searchField,
  onSearchQueryChange,
  onSearchFieldChange,
  totalCount,
  filteredCount,
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
    />
  );
}

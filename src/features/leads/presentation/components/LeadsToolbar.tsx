"use client";

import type { Lead } from "@/leads";
import {
  leadsSearchConfig,
  leadsSearchPlaceholder,
} from "../search";
import { TableToolbar } from "@/shared/ui";

export type LeadsToolbarProps = {
  searchQuery: string;
  searchField: string;
  onSearchQueryChange: (value: string) => void;
  onSearchFieldChange: (value: string) => void;
  totalCount?: number;
  filteredCount?: number;
};

export function LeadsToolbar({
  searchQuery,
  searchField,
  onSearchQueryChange,
  onSearchFieldChange,
  totalCount,
  filteredCount,
}: LeadsToolbarProps) {
  const searchFields = [
    { value: "all", label: "All fields" },
    ...leadsSearchConfig.fields.map((field) => ({
      value: field.key,
      label: field.label,
    })),
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
      placeholder={leadsSearchPlaceholder}
      hasActiveSearch={hasActiveSearch}
      onClearSearch={handleClearSearch}
      resultCount={filteredCount}
      totalCount={totalCount}
    />
  );
}

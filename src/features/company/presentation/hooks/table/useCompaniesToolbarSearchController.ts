"use client";

import { useMemo } from "react";

export interface UseCompaniesToolbarSearchControllerOptions {
  searchQuery: string;
  searchField: string;
  setSearchQuery: (q: string) => void;
  setSearchField: (f: string) => void;
  filteredCount: number;
  totalCount: number;
}

export function useCompaniesToolbarSearchController({
  searchQuery,
  searchField,
  setSearchQuery,
  setSearchField,
  filteredCount,
  totalCount,
}: UseCompaniesToolbarSearchControllerOptions) {
  return useMemo(
    () => ({
      searchTerm: searchQuery,
      onSearchChange: setSearchQuery,
      selectedField: searchField,
      onFieldChange: setSearchField,
      searchFields: [
        { value: "all", label: "All fields" },
        { value: "name", label: "Name" },
        { value: "address", label: "Address" },
        { value: "type", label: "Type" },
      ],
      placeholder: "Search companies...",
      resultCount: filteredCount,
      totalCount: totalCount,
    }),
    [searchQuery, searchField, setSearchQuery, setSearchField, filteredCount, totalCount]
  );
}


"use client";

import { useMemo } from "react";
import { leadsSearchPlaceholder } from "../../search/leadsSearchConfig";

export interface UseLeadsToolbarSearchControllerOptions {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredCount: number;
  totalCount: number;
}

// Búsqueda siempre a través de todos los campos (leadNumber, name, location) a la vez;
// sin selector de campo, ver leadsSearchConfig.defaultField = "all".
export function useLeadsToolbarSearchController({
  searchQuery,
  setSearchQuery,
  filteredCount,
  totalCount,
}: UseLeadsToolbarSearchControllerOptions) {
  return useMemo(
    () => ({
      searchTerm: searchQuery ?? "",
      onSearchChange: setSearchQuery,
      placeholder: leadsSearchPlaceholder,
      resultCount: filteredCount,
      totalCount: totalCount,
    }),
    [searchQuery, setSearchQuery, filteredCount, totalCount]
  );
}


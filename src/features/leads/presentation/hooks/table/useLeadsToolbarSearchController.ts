"use client";

import { useMemo } from "react";
import type { Lead } from "@/leads/domain";
import { leadsSearchConfig, leadsSearchPlaceholder } from "../../search";

export interface UseLeadsToolbarSearchControllerOptions {
  searchQuery: string;
  searchField: string;
  setSearchQuery: (q: string) => void;
  setSearchField: (f: string) => void;
  filteredCount: number;
  totalCount: number;
}

export function useLeadsToolbarSearchController({
  searchQuery,
  searchField,
  setSearchQuery,
  setSearchField,
  filteredCount,
  totalCount,
}: UseLeadsToolbarSearchControllerOptions) {
  return useMemo(
    () => ({
      searchTerm: searchQuery ?? "",
      onSearchChange: setSearchQuery,
      selectedField: searchField ?? "all",
      onFieldChange: (value: string) =>
        setSearchField(value as keyof Lead | "all"),
      searchFields: [
        { value: "all", label: "All fields" },
        ...leadsSearchConfig.fields.map((field) => ({
          value: field.key,
          label: field.label,
        })),
      ],
      placeholder: leadsSearchPlaceholder,
      resultCount: filteredCount,
      totalCount: totalCount,
    }),
    [searchQuery, searchField, setSearchQuery, setSearchField, filteredCount, totalCount]
  );
}


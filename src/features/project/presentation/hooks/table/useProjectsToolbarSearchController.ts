"use client";

import { useMemo } from "react";
import type { Project } from "@/project/domain";
import { projectsSearchConfig, projectsSearchPlaceholder } from "../../search/projectsSearchConfig";

export interface UseProjectsToolbarSearchControllerOptions {
  searchQuery: string;
  searchField: string;
  setSearchQuery: (q: string) => void;
  setSearchField: (f: string) => void;
  filteredCount: number;
  totalCount: number;
}

export function useProjectsToolbarSearchController({
  searchQuery,
  searchField,
  setSearchQuery,
  setSearchField,
  filteredCount,
  totalCount,
}: UseProjectsToolbarSearchControllerOptions) {
  return useMemo(
    () => ({
      searchTerm: searchQuery ?? "",
      onSearchChange: setSearchQuery,
      selectedField: searchField ?? "all",
      onFieldChange: (value: string) =>
        setSearchField(value as keyof Project | "all"),
      searchFields: [
        { value: "all", label: "All fields" },
        ...projectsSearchConfig.fields
          .filter((f) => f.key !== "all")
          .map((field) => ({
            value: field.key,
            label: field.label,
          })),
      ],
      placeholder: projectsSearchPlaceholder,
      resultCount: filteredCount,
      totalCount: totalCount,
    }),
    [searchQuery, searchField, setSearchQuery, setSearchField, filteredCount, totalCount]
  );
}




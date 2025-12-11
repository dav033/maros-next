"use client";

import { useMemo } from "react";
import type { Contact } from "@/contact/domain";
import { contactsSearchConfig, contactsSearchPlaceholder } from "../../search";

export interface UseContactsToolbarSearchControllerOptions {
  searchQuery: string;
  searchField: string;
  setSearchQuery: (q: string) => void;
  setSearchField: (f: string) => void;
  filteredCount: number;
  totalCount: number;
}

export function useContactsToolbarSearchController({
  searchQuery,
  searchField,
  setSearchQuery,
  setSearchField,
  filteredCount,
  totalCount,
}: UseContactsToolbarSearchControllerOptions) {
  return useMemo(
    () => ({
      searchTerm: searchQuery ?? "",
      onSearchChange: setSearchQuery,
      selectedField: searchField ?? "all",
      onFieldChange: (value: string) =>
        setSearchField(value as keyof Contact | "all"),
      searchFields: [
        { value: "all", label: "All fields" },
        ...contactsSearchConfig.fields.map((field) => ({
          value: field.key,
          label: field.label,
        })),
      ],
      placeholder: contactsSearchPlaceholder,
      resultCount: filteredCount,
      totalCount: totalCount,
    }),
    [searchQuery, searchField, setSearchQuery, setSearchField, filteredCount, totalCount]
  );
}


"use client";

import { useState, useMemo, useCallback } from "react";
import { filterBySearch, normalizeValue } from "@/shared/search";
import type { SearchConfig } from "@/shared/search";

export interface UseTableWithSearchOptions<T> {
  data: T[];
  searchableFields?: (keyof T)[];
  defaultSearchField?: string;
  customSearchFn?: (item: T, query: string, field: string) => boolean;
  /**
   * Optional custom normalization function for search values.
   * If not provided, defaults to lowercase + trim.
   */
  normalize?: (value: string) => string;
}

export interface UseTableWithSearchResult<T> {
  filteredData: T[];
  searchQuery: string;
  searchField: string;
  setSearchQuery: (query: string) => void;
  setSearchField: (field: string) => void;
  totalCount: number;
  filteredCount: number;
}

/**
 * Hook for table search functionality using the centralized search utilities.
 * Now leverages SearchConfig and filterBySearch for consistent behavior.
 */
export function useTableWithSearch<T extends Record<string, any>>({
  data,
  searchableFields = [],
  defaultSearchField = "all",
  customSearchFn,
  normalize,
}: UseTableWithSearchOptions<T>): UseTableWithSearchResult<T> {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState(defaultSearchField);

  // Build SearchConfig from options
  const searchConfig = useMemo<SearchConfig<T>>(() => ({
    fields: searchableFields.map((key) => ({
      key: key as keyof T & string,
      label: String(key),
    })),
    defaultField: (defaultSearchField as keyof T & string) ?? (searchableFields[0] as keyof T & string),
    normalize,
  }), [searchableFields, normalize, defaultSearchField]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return data;
    }

    // Use custom search function if provided
    if (customSearchFn) {
      const term = normalizeValue(searchQuery, searchConfig);
      return data.filter((item) => customSearchFn(item, term, searchField));
    }

    // Otherwise use the centralized filterBySearch
    return filterBySearch(data, searchConfig, {
      query: searchQuery,
      field: searchField as keyof T & string | "all",
    });
  }, [data, searchQuery, searchField, searchConfig, customSearchFn]);

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSetSearchField = useCallback((field: string) => {
    setSearchField(field);
  }, []);

  return {
    filteredData,
    searchQuery,
    searchField,
    setSearchQuery: handleSetSearchQuery,
    setSearchField: handleSetSearchField,
    totalCount: data.length,
    filteredCount: filteredData.length,
  };
}

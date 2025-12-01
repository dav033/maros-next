"use client";

import { useState, useMemo, useCallback } from "react";

export interface UseTableWithSearchOptions<T> {
  data: T[];
  searchableFields?: (keyof T)[];
  defaultSearchField?: string;
  customSearchFn?: (item: T, query: string, field: string) => boolean;
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


export function useTableWithSearch<T extends Record<string, any>>({
  data,
  searchableFields = [],
  defaultSearchField = "all",
  customSearchFn,
}: UseTableWithSearchOptions<T>): UseTableWithSearchResult<T> {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState(defaultSearchField);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return data;
    }

    const term = searchQuery.toLowerCase();

    return data.filter((item) => {
      if (customSearchFn) {
        return customSearchFn(item, term, searchField);
      }

      if (searchField === "all") {
        return searchableFields.some((field) => {
          const value = item[field];
          if (value == null) return false;
          return String(value).toLowerCase().includes(term);
        });
      }

      const value = item[searchField as keyof T];
      if (value == null) return false;
      return String(value).toLowerCase().includes(term);
    });
  }, [data, searchQuery, searchField, searchableFields, customSearchFn]);

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

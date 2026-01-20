"use client";

import { useCallback, useMemo, useState } from "react";

export interface SearchField<T> {
  key: keyof T & string;
  label: string;
}

export interface SearchConfig<T> {
  fields: SearchField<T>[];
  defaultField: keyof T & string;
  normalize?: (value: string) => string;
}

export interface UseTableWithSearchOptions<T> {
  data: T[];
  searchableFields?: (keyof T)[];
  defaultSearchField?: string;
  customSearchFn?: (item: T, query: string, field: string) => boolean;
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

function normalizeValue<T>(value: string, config?: SearchConfig<T>): string {
  const normalized = value.toLowerCase().trim();
  return config?.normalize ? config.normalize(normalized) : normalized;
}

function filterBySearch<T extends Record<string, any>>(
  data: T[],
  config: SearchConfig<T>,
  search: { query: string; field: string }
): T[] {
  const term = normalizeValue(search.query, config);
  if (!term) return data;

  return data.filter((item) => {
    if (search.field === "all") {
      return config.fields.some((f) => {
        const val = item[f.key];
        if (val == null) return false;
        return normalizeValue(String(val), config).includes(term);
      });
    }
    const val = item[search.field as keyof T];
    if (val == null) return false;
    return normalizeValue(String(val), config).includes(term);
  });
}

export function useTableWithSearch<T extends Record<string, any>>({
  data,
  searchableFields = [],
  defaultSearchField = "all",
  customSearchFn,
  normalize,
}: UseTableWithSearchOptions<T>): UseTableWithSearchResult<T> {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState(defaultSearchField);

  const searchConfig = useMemo<SearchConfig<T>>(
    () => ({
      fields: searchableFields.map((key) => ({
        key: key as keyof T & string,
        label: String(key),
      })),
      defaultField:
        (defaultSearchField as keyof T & string) ?? (searchableFields[0] as keyof T & string),
      normalize,
    }),
    [searchableFields, normalize, defaultSearchField]
  );

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return data;
    }

    if (customSearchFn) {
      const term = normalizeValue(searchQuery, searchConfig);
      return data.filter((item) => customSearchFn(item, term, searchField));
    }

    return filterBySearch(data, searchConfig, {
      query: searchQuery,
      field: (searchField as keyof T & string) ?? "all",
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

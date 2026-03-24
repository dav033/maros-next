"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];
export const PAGINATION_PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS;

export interface UsePaginationOptions<T> {
  data: T[];
  /** When false, returns data as-is with no pagination controls active. */
  enabled: boolean;
  /** Default page size. Must be one of 10 | 25 | 50. Defaults to 25. */
  defaultPageSize?: PageSizeOption;
}

export interface UsePaginationResult<T> {
  pagedData: T[];
  page: number;
  pageSize: PageSizeOption;
  totalPages: number;
  totalItems: number;
  /** True only when pagination is enabled AND totalItems > pageSize. */
  isPaginated: boolean;
  setPage: (page: number) => void;
  setPageSize: (size: PageSizeOption) => void;
}

export function usePagination<T>({
  data,
  enabled,
  defaultPageSize = 25,
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState<PageSizeOption>(defaultPageSize);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Pagination is only "active" when explicitly enabled AND there's more data than one page
  const isPaginated = enabled && totalItems > pageSize;

  // Reset to page 1 when the data length changes (e.g. after a search filter)
  useEffect(() => {
    setPageState(1);
  }, [totalItems]);

  const setPage = useCallback(
    (next: number) => {
      setPageState(Math.min(Math.max(1, next), totalPages));
    },
    [totalPages]
  );

  const setPageSize = useCallback((size: PageSizeOption) => {
    setPageSizeState(size);
    setPageState(1);
  }, []);

  const pagedData = useMemo(() => {
    if (!isPaginated) return data;
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, isPaginated, page, pageSize]);

  return {
    pagedData,
    page,
    pageSize,
    totalPages,
    totalItems,
    isPaginated,
    setPage,
    setPageSize,
  };
}

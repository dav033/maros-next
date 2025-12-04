"use client";

import { useQuery } from "@tanstack/react-query";
import { useCompanyApp } from "@/di";
import { companyKeys } from "../../application/keys";
import { companyCrudUseCases } from "../../application/usecases/companyCrud";
import type { Company } from "../../domain/models";
import { buildInstantQueryResult } from "@/shared/query";

const DEFAULT_STALE_TIME = 5 * 60 * 1000;

export type UseInstantCompaniesResult = {
  companies: Company[] | undefined;
  hasData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  showSkeleton: boolean;
  error: Error | null;
  fromCache: boolean;
  refetch: () => Promise<void>;
};

/**
 * Hook for instant company data loading with skeleton support
 * Uses standard instant query pattern from buildInstantQueryResult
 */
export function useInstantCompanies(): UseInstantCompaniesResult {
  const ctx = useCompanyApp();

  const query = useQuery<Company[], Error>({
    queryKey: companyKeys.lists(),
    queryFn: async () => {
      const items = await companyCrudUseCases.list(ctx)();
      return items ?? [];
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: 10 * 60 * 1000,
  });

  const instant = buildInstantQueryResult<Company[]>(
    query,
    [],
    DEFAULT_STALE_TIME,
  );

  return {
    companies: instant.data,
    hasData: instant.hasData,
    isLoading: instant.isLoading,
    isFetching: instant.isFetching,
    showSkeleton: instant.showSkeleton,
    fromCache: instant.fromCache,
    error: instant.error,
    refetch: instant.refetch,
  };
}

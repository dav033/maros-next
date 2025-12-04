import { useQuery } from "@tanstack/react-query";
import { useCompanyApp } from "@/di";
import { companyServiceCrudUseCases } from "../../application/usecases/companyServiceCrud";
import type { CompanyService } from "../../domain/models";
import { buildInstantQueryResult } from "@/shared/query";

const DEFAULT_STALE_TIME = 5 * 60 * 1000;

export type UseCompanyServicesResult = {
  services: CompanyService[] | undefined;
  hasData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  showSkeleton: boolean;
  error: Error | null;
  fromCache: boolean;
  refetch: () => Promise<void>;
};

/**
 * Hook for instant company services data loading with skeleton support
 * Uses standard instant query pattern from buildInstantQueryResult
 */
export function useCompanyServices(): UseCompanyServicesResult {
  const app = useCompanyApp();

  const query = useQuery<CompanyService[], Error>({
    queryKey: ["companyServices"],
    queryFn: async () => {
      const items = await companyServiceCrudUseCases.list(app)();
      return items ?? [];
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: 10 * 60 * 1000,
  });

  const instant = buildInstantQueryResult<CompanyService[]>(
    query,
    [],
    DEFAULT_STALE_TIME,
  );

  return {
    services: instant.data,
    hasData: instant.hasData,
    isLoading: instant.isLoading,
    isFetching: instant.isFetching,
    showSkeleton: instant.showSkeleton,
    fromCache: instant.fromCache,
    error: instant.error,
    refetch: instant.refetch,
  };
}

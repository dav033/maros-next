"use client";

import { useQuery } from "@tanstack/react-query";
import { optimizedApiClient } from "@/shared";
import { customersEndpoints } from "../endpoints";
import { customersKeys } from "../keys";
import type { CustomersResponse } from "../types";
import { buildInstantQueryResult } from "@/shared";
import { mapContactFromApi } from "@/features/contact/infra/http/mappers";
import { mapCompanyFromApi, type ApiCompanyDTO } from "@/features/company/infra/http/mappers";
import type { Contact } from "@/contact";
import type { Company } from "@/company";

const DEFAULT_STALE_TIME = 5 * 60 * 1000;

export type UseInstantCustomersResult = {
  contacts: Contact[] | undefined;
  companies: Company[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  showSkeleton: boolean;
  error: Error | null;
  fromCache: boolean;
  refetch: () => Promise<unknown>;
};

interface ApiCustomersResponse {
  contacts: Contact[];
  companies: ApiCompanyDTO[];
}

export function useInstantCustomers(): UseInstantCustomersResult {
  const query = useQuery<CustomersResponse, Error>({
    queryKey: customersKeys.all,
    queryFn: async () => {
      const { data } = await optimizedApiClient.get<ApiCustomersResponse>(
        customersEndpoints.getCustomers()
      );
      
      if (!data) {
        return { contacts: [], companies: [] };
      }

      return {
        contacts: (data.contacts ?? []).map(mapContactFromApi),
        companies: (data.companies ?? []).map(mapCompanyFromApi),
      };
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: 10 * 60 * 1000,
  });

  const instant = buildInstantQueryResult<CustomersResponse>(
    query,
    { contacts: [], companies: [] },
    DEFAULT_STALE_TIME,
  );

  return {
    contacts: instant.data?.contacts,
    companies: instant.data?.companies,
    isLoading: instant.isLoading,
    isFetching: instant.isFetching,
    showSkeleton: instant.showSkeleton,
    fromCache: instant.fromCache,
    error: instant.error,
    refetch: instant.refetch,
  };
}


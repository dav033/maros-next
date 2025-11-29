"use client";

import { useQuery } from "@tanstack/react-query";
import { optimizedApiClient } from "@/shared";
import { customersEndpoints } from "../endpoints";
import type { CustomersResponse } from "../types";
import { buildInstantQueryResult } from "@/shared";
import { mapContactsFromApi } from "@/features/contact/infra/http/mappers";
import { mapCompaniesFromApi, type ApiCompanyDTO } from "@/features/company/infra/http/mappers";
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
    queryKey: ["customers"],
    queryFn: async () => {
      const { data } = await optimizedApiClient.get<ApiCustomersResponse>(
        customersEndpoints.getCustomers()
      );
      
      if (!data) {
        return { contacts: [], companies: [] };
      }

      return {
        contacts: mapContactsFromApi(data.contacts ?? []),
        companies: mapCompaniesFromApi(data.companies ?? []),
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


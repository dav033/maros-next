"use client";

import { useQuery } from "@tanstack/react-query";
import { buildInstantQueryResult } from "@/shared/query";
import type { Contact } from "@/contact";
import type { Company } from "@/company";

import { customersKeys } from "../../infra/keys";
import type { CustomersData } from "../../domain/Customer";
import { CustomersHttpRepository } from "../../infra/http/CustomersHttpRepository";

const DEFAULT_STALE_TIME = 5 * 60 * 1000;

/**
 * Result type for useInstantCustomers hook
 */
export type UseInstantCustomersResult = {
  contacts: Contact[] | undefined;
  companies: Company[] | undefined;
  hasData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  showSkeleton: boolean;
  error: Error | null;
  fromCache: boolean;
  refetch: () => Promise<unknown>;
};

/**
 * Hook to fetch customers data with instant query pattern
 * Uses CustomersHttpRepository for data fetching
 * 
 * @returns Aggregated customer data (contacts and companies)
 */
export function useInstantCustomers(): UseInstantCustomersResult {
  const repository = new CustomersHttpRepository();

  const query = useQuery<CustomersData, Error>({
    queryKey: customersKeys.all,
    queryFn: () => repository.getCustomers(),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: 10 * 60 * 1000,
  });

  const instant = buildInstantQueryResult<CustomersData>(
    query,
    { contacts: [], companies: [] },
    DEFAULT_STALE_TIME,
  );

  return {
    contacts: instant.data?.contacts,
    companies: instant.data?.companies,
    hasData: instant.hasData,
    isLoading: instant.isLoading,
    isFetching: instant.isFetching,
    showSkeleton: instant.showSkeleton,
    fromCache: instant.fromCache,
    error: instant.error,
    refetch: instant.refetch,
  };
}

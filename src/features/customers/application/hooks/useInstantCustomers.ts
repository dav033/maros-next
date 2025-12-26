"use client";

import { useQuery } from "@tanstack/react-query";
import { buildInstantQueryResult } from "@/shared/query";
import type { Contact } from "@/contact";
import type { Company } from "@/company";

import { customersKeys } from "../../infra/keys";
import type { CustomersData } from "../../domain/Customer";
import { CustomersHttpRepository } from "../../infra/http/CustomersHttpRepository";

const DEFAULT_STALE_TIME = 5 * 60 * 1000;


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


import type { CustomersPageData } from "@/customers/presentation/data/loadCustomersData";

export function useInstantCustomers(initialData?: CustomersPageData): UseInstantCustomersResult {
  const repository = new CustomersHttpRepository();

  const query = useQuery<CustomersData, Error>({
    queryKey: customersKeys.all,
    queryFn: () => repository.getCustomers(),
    initialData: initialData ? { contacts: initialData.contacts, companies: initialData.companies } : undefined,
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

"use client";

import { useQuery } from "@tanstack/react-query";
import { useContactsApp } from "@/di";
import { contactsKeys, getContactsByCompany } from "@/contact/application";
import type { Contact } from "@/contact/domain";
import { buildInstantQueryResult } from "@/shared/query";

const DEFAULT_STALE_TIME = 5 * 60 * 1000;

export type UseInstantContactsByCompanyResult = {
  contacts: Contact[] | undefined;
  hasData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  showSkeleton: boolean;
  error: Error | null;
  fromCache: boolean;
  refetch: () => Promise<void>;
};

export function useInstantContactsByCompany(
  companyId?: number | null
): UseInstantContactsByCompanyResult {
  const ctx = useContactsApp();

  const query = useQuery<Contact[], Error>({
    queryKey: companyId != null ? contactsKeys.byCompany(companyId) : contactsKeys.byCompany("none"),
    queryFn: async () => {
      if (companyId == null) return [];
      const items = await getContactsByCompany(ctx, companyId);
      return items ?? [];
    },
    enabled: companyId != null,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: 10 * 60 * 1000,
  });

  const instant = buildInstantQueryResult<Contact[]>(
    query,
    [],
    DEFAULT_STALE_TIME,
  );

  return {
    contacts: instant.data,
    hasData: instant.hasData,
    isLoading: instant.isLoading,
    isFetching: instant.isFetching,
    showSkeleton: instant.showSkeleton,
    fromCache: instant.fromCache,
    error: instant.error,
    refetch: instant.refetch,
  };
}



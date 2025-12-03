"use client";

import { useQuery } from "@tanstack/react-query";
import { useContactsApp } from "@/di";
import {
  contactsKeys,
  listContacts,
} from "@/contact";
import type { Contact } from "@/contact";
import { buildInstantQueryResult } from "@/shared";

const DEFAULT_STALE_TIME = 5 * 60 * 1000;

export type UseInstantContactsResult = {
  contacts: Contact[] | undefined;
  hasData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  showSkeleton: boolean;
  error: Error | null;
  fromCache: boolean;
  refetch: () => Promise<void>;
};

/**
 * Hook for instant contact data loading with skeleton support
 * Uses standard instant query pattern from buildInstantQueryResult
 */
export function useInstantContacts(): UseInstantContactsResult {
  const ctx = useContactsApp();

  const query = useQuery<Contact[], Error>({
    queryKey: contactsKeys.lists(),
    queryFn: async () => {
      const items = await listContacts(ctx);
      return items ?? [];
    },
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

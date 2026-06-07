"use client";

import { useContactsApp } from "@/di";
import { contactsKeys, getContactsByCompany } from "@/contact/application";
import type { Contact } from "@/contact/domain";
import { useInstantList } from "@/shared/query";

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
  companyId?: number | null,
): UseInstantContactsByCompanyResult {
  const ctx = useContactsApp();
  const r = useInstantList<Contact>({
    queryKey:
      companyId != null
        ? contactsKeys.byCompany(companyId)
        : contactsKeys.byCompany("none"),
    queryFn: async () => (companyId == null ? [] : getContactsByCompany(ctx, companyId)),
    enabled: companyId != null,
  });
  return { ...r, contacts: r.data };
}

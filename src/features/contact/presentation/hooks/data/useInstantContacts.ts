"use client";

import { useContactsApp } from "@/di";
import { contactsKeys, listContacts } from "@/contact/application";
import type { Contact } from "@/contact/domain";
import { useInstantList } from "@/shared/query";

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

export function useInstantContacts(
  initialData?: Contact[],
  options?: { enabled?: boolean },
): UseInstantContactsResult {
  const ctx = useContactsApp();
  const r = useInstantList<Contact>({
    queryKey: contactsKeys.list,
    queryFn: () => listContacts(ctx),
    initialData,
    enabled: options?.enabled,
  });
  return { ...r, contacts: r.data };
}

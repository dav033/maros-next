"use client";

import { useQueryClient } from "@tanstack/react-query";
import { companyKeys } from "@/company/application/keys/companyKeys";
import type { Company, CompanyDetails } from "@/company/domain/models";
import { CompanyHttpRepository } from "@/company/infra/http/CompanyHttpRepository";
import { contactsKeys } from "@/contact/application";
import type { Contact } from "@/contact/domain";
import { ContactHttpRepository } from "@/contact/infra/http/ContactHttpRepository";
import type { CustomersData } from "@/customers/domain/Customer";
import { customersKeys } from "@/customers/infra/keys";
import { useNavigationDetailQuery } from "@/shared/query/useNavigationDetailQuery";
import { findCachedListItem } from "@/shared/query/findCachedListItem";
import { CompanyDetailsPage } from "./CompanyDetailsPage";
import { CompanyDetailsPageSkeleton } from "../components/CompanyDetailsPageSkeleton";

function linkedContacts(contacts: Contact[], companyId: number) {
  return contacts.flatMap((contact) => contact.id !== undefined && (contact.company?.id === companyId || contact.companyId === companyId)
    ? [{ ...contact, id: contact.id }] : []);
}

export function CompanyDetailsRoute({ companyId }: { companyId: number }) {
  const queryClient = useQueryClient();
  const company = findCachedListItem<Company>(queryClient, companyKeys.lists(), (item) => item.id === companyId)
    ?? (!queryClient.getQueryState(customersKeys.all)?.isInvalidated ? queryClient.getQueryData<CustomersData>(customersKeys.all)?.companies.find((item) => item.id === companyId) : undefined);
  const contactsState = queryClient.getQueryState(contactsKeys.list);
  const contacts = contactsState && !contactsState.isInvalidated && contactsState.dataUpdatedAt > 0 ? queryClient.getQueryData<Contact[]>(contactsKeys.list) : undefined;
  const query = useNavigationDetailQuery<CompanyDetails | null>({
    queryKey: [...companyKeys.detail(companyId), "view"],
    initialData: company && contacts ? { ...company, contacts: linkedContacts(contacts, companyId) } : undefined,
    placeholderData: company,
    queryFn: async () => {
      // A mutation invalidates the detail, so only the initial handoff can reuse its base row.
      const state = queryClient.getQueryState([...companyKeys.detail(companyId), "view"]);
      const invalidated = state?.isInvalidated || Boolean(state?.dataUpdatedAt);
      const base = !invalidated && company ? company : await new CompanyHttpRepository().getById(companyId);
      if (!base) return null;
      const related = contacts && !invalidated
        ? linkedContacts(contacts, companyId)
        : (await new ContactHttpRepository().listByCompany(companyId)).flatMap((contact) => contact.id === undefined ? [] : [{ ...contact, id: contact.id }]);
      return { ...base, contacts: related };
    },
  });
  const data = query.data ?? company;
  if (!data && query.isPending) return <CompanyDetailsPageSkeleton />;
  return <CompanyDetailsPage companyId={companyId} initialData={{
    companyDetails: data ?? null,
    error: data ? undefined : query.error?.message,
  }} relationsPending={query.isPlaceholderData} relationsError={data ? query.error?.message : undefined} onRetry={() => void query.refetch()} />;
}

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AppError } from "@/shared/errors";
import { contactsKeys } from "@/contact/application";
import type { Contact } from "@/contact/domain";
import { ContactHttpRepository } from "@/contact/infra/http/ContactHttpRepository";
import type { CustomersData } from "@/customers/domain/Customer";
import { customersKeys } from "@/customers/infra/keys";
import { useNavigationDetailQuery } from "@/shared/query/useNavigationDetailQuery";
import { useSharedEntitySourceLabel } from "@/shared/presentation/SharedEntitySourceContext";
import { ContactDetailsPage, type ContactDetailsView } from "./ContactDetailsPage";
import { ContactDetailsPageSkeleton } from "../components/ContactDetailsPageSkeleton";

export function ContactDetailsRoute({ contactId }: { contactId: number }) {
  const queryClient = useQueryClient();
  const sourceName = useSharedEntitySourceLabel(`maros-contact-name-${contactId}`);
  const contact = queryClient.getQueryData<Contact[]>(contactsKeys.list)?.find((item) => item.id === contactId)
    ?? queryClient.getQueryData<CustomersData>(customersKeys.all)?.contacts.find((item) => item.id === contactId);
  const preview = contact ? { ...contact, id: contactId } : undefined;
  const query = useNavigationDetailQuery<ContactDetailsView>({
    queryKey: [...contactsKeys.detail(contactId), "view"],
    queryFn: () => new ContactHttpRepository().getDetails(contactId),
    // The list has the contact itself; leads and aggregate counts are detail-only.
    placeholderData: preview,
  });
  const entityUnavailable = query.error instanceof AppError
    && ["not_found", "forbidden", "unauthorized"].includes(query.error.kind);
  const data = entityUnavailable ? undefined : query.data ?? preview;
  if (!data && query.isPending) return <ContactDetailsPageSkeleton contactId={contactId} contactName={sourceName} />;
  return <ContactDetailsPage contactId={contactId} initialData={{
    contactDetails: data ?? null,
    error: data ? undefined : query.error?.message,
  }} relationsError={data ? query.error?.message : undefined} onRetry={() => void query.refetch()} />;
}

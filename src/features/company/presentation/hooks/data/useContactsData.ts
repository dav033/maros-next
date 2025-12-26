"use client";

import type { Contact } from "@/contact/domain";
import { useInstantCompanies } from "./useInstantCompanies";
import { useCompanyServices } from "../services/useCompanyServices";
import { useInstantContacts } from "@/features/contact/presentation/hooks";

export interface UseContactsDataReturn {
  contacts: Contact[];
  companies: NonNullable<ReturnType<typeof useInstantCompanies>["companies"]>;
  services: NonNullable<ReturnType<typeof useCompanyServices>["services"]>;
  showSkeleton: boolean;
}

import type { ContactsPageData } from "@/contact/presentation/data/loadContactsData";

export function useContactsData(initialData?: ContactsPageData): UseContactsDataReturn {
  const { contacts, showSkeleton } = useInstantContacts(initialData?.contacts);
  const { companies } = useInstantCompanies();
  const { services } = useCompanyServices();

  return {
    contacts: contacts ?? [],
    companies: companies ?? [],
    services: services ?? [],
    showSkeleton: !!showSkeleton,
  };
}

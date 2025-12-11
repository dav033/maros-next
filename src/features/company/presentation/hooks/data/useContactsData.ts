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

export function useContactsData(): UseContactsDataReturn {
  const { contacts, showSkeleton } = useInstantContacts();
  const { companies } = useInstantCompanies();
  const { services } = useCompanyServices();

  return {
    contacts: contacts ?? [],
    companies: companies ?? [],
    services: services ?? [],
    showSkeleton: !!showSkeleton,
  };
}

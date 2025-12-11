// useCompaniesData.ts
"use client";

import { useInstantCompanies } from "./useInstantCompanies";
import { useCompanyServices } from "../services/useCompanyServices";
import { useInstantContacts } from "@/features/contact/presentation/hooks";
import type { Company } from "../../../domain/models";
import type { Contact } from "@/contact/domain";

interface CompanyService {
  id: number;
  name: string;
}

export interface UseCompaniesDataReturn {
  companies: Company[];
  contacts: Contact[];
  services: CompanyService[];
  showSkeleton: boolean;
}

export function useCompaniesData(): UseCompaniesDataReturn {
  const { companies, showSkeleton } = useInstantCompanies();
  const { services } = useCompanyServices();
  const { contacts, showSkeleton: contactsSkeleton } = useInstantContacts();

  return {
    companies: companies ?? [],
    contacts: contacts ?? [],
    services: services ?? [],
    showSkeleton: showSkeleton || !!contactsSkeleton,
  };
}

// useCompaniesData.ts
"use client";

import { useInstantCompanies } from "./useInstantCompanies";
import { useCompanyServices } from "../services/useCompanyServices";
import { useInstantContacts } from "@/features/contact/presentation/hooks";
import type { Company } from "../../../domain/models";
import type { Contact } from "@/contact/domain";
import type { CompaniesPageData } from "../../data/loadCompaniesData";

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

export function useCompaniesData(initialData?: CompaniesPageData): UseCompaniesDataReturn {
  const { companies, showSkeleton } = useInstantCompanies(initialData?.companies);
  const { services } = useCompanyServices(initialData?.services);
  const { contacts, showSkeleton: contactsSkeleton } = useInstantContacts(initialData?.contacts);

  return {
    companies: companies ?? [],
    contacts: contacts ?? [],
    services: services ?? [],
    showSkeleton: showSkeleton || !!contactsSkeleton,
  };
}

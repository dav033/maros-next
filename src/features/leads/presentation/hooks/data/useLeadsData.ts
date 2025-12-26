"use client";

import type { Lead, LeadType } from "@/leads/domain";
import { useInstantLeadsByType } from "./useInstantLeadsByType";
import { useInstantContacts } from "@/contact/presentation";
import { useProjectTypes } from "@/projectType/presentation";

export interface UseLeadsDataReturn {
  leads: Lead[];
  contacts: ReturnType<typeof useInstantContacts>["contacts"];
  projectTypes: ReturnType<typeof useProjectTypes>["projectTypes"];
  showSkeleton: boolean;
  refetch: () => Promise<void>;
}

import type { LeadsPageData } from "../../data/loadLeadsData";

export function useLeadsData(leadType: LeadType, initialData?: LeadsPageData): UseLeadsDataReturn {
  const { leads, showSkeleton, refetch } = useInstantLeadsByType(leadType, initialData?.leads);
  const { contacts } = useInstantContacts(initialData?.contacts);
  const { projectTypes } = useProjectTypes(initialData?.projectTypes);

  return {
    leads: leads ?? [],
    contacts,
    projectTypes,
    showSkeleton: !!showSkeleton,
    refetch,
  };
}


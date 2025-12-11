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

export function useLeadsData(leadType: LeadType): UseLeadsDataReturn {
  const { leads, showSkeleton, refetch } = useInstantLeadsByType(leadType);
  const { contacts } = useInstantContacts();
  const { projectTypes } = useProjectTypes();

  return {
    leads: leads ?? [],
    contacts,
    projectTypes,
    showSkeleton: !!showSkeleton,
    refetch,
  };
}


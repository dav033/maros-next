"use client";

import type { Lead } from "@/leads/domain";
import { useInstantLostLeads } from "./useInstantLostLeads";
import { useInstantContacts } from "@/contact/presentation";
import { useProjectTypes } from "@/projectType/presentation";

export interface UseLostLeadsDataReturn {
  leads: Lead[];
  contacts: ReturnType<typeof useInstantContacts>["contacts"];
  projectTypes: ReturnType<typeof useProjectTypes>["projectTypes"];
  showSkeleton: boolean;
  refetch: () => Promise<void>;
}

export function useLostLeadsData(initialData?: Lead[]): UseLostLeadsDataReturn {
  const { leads, showSkeleton, refetch } = useInstantLostLeads(initialData);
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

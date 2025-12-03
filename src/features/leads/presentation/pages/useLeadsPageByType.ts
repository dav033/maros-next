"use client";

import { useMemo } from "react";
import type { Lead } from "@/leads";
import { useInstantLeadsByType, leadsSearchConfig } from "@/leads";
import { useSearchState, filterBySearch } from "@/shared/search";
import { useInstantContacts } from "@/contact";
import { useProjectTypes } from "@/projectType";
import type { LeadType } from "@/leads";

export function useLeadsPageByType(leadType: LeadType) {
  const {
    state: searchState,
    setQuery,
    setField,
  } = useSearchState<Lead>(leadsSearchConfig);

  const { leads, showSkeleton, refetch } = useInstantLeadsByType(leadType);
  const { contacts } = useInstantContacts();
  const { projectTypes } = useProjectTypes();

  const filteredLeads = useMemo(
    () => filterBySearch(leads ?? [], leadsSearchConfig, searchState),
    [leads, searchState]
  );

  return {
    searchState,
    setQuery,
    setField,
    leads,
    showSkeleton,
    refetch,
    contacts,
    projectTypes,
    filteredLeads,
  };
}

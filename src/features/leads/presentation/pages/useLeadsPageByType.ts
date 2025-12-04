"use client";

import type { Lead } from "@/leads/domain";
import { useInstantLeadsByType, leadsSearchConfig } from "@/leads/presentation";
import { useTableWithSearch } from "@/shared/hooks";
import { useInstantContacts } from "@/contact/presentation";
import { useProjectTypes } from "@/projectType/presentation";
import type { LeadType } from "@/leads/domain";

export function useLeadsPageByType(leadType: LeadType) {
  const { leads, showSkeleton, refetch } = useInstantLeadsByType(leadType);
  const { contacts } = useInstantContacts();
  const { projectTypes } = useProjectTypes();

  // Search and filtering with useTableWithSearch
  const {
    filteredData: filteredLeads,
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
    filteredCount,
  } = useTableWithSearch<Lead>({
    data: leads ?? [],
    searchableFields: leadsSearchConfig.fields.map(f => f.key),
    defaultSearchField: leadsSearchConfig.defaultField,
    normalize: leadsSearchConfig.normalize,
  });

  return {
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
    filteredCount,
    leads,
    showSkeleton,
    refetch,
    contacts,
    projectTypes,
    filteredLeads,
  };
}

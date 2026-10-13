"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useLeadsApp } from "@/di";
import { leadsKeys } from "@/leads/application";
import type { Lead, LeadDetails } from "@/leads/domain";
import { findCachedListItem } from "@/shared/query/findCachedListItem";
import { useNavigationDetailQuery } from "@/shared/query/useNavigationDetailQuery";
import { useSharedEntitySourceLabel } from "@/shared/presentation/SharedEntitySourceContext";
import { leadDetailsFromList } from "../data/leadDetailsFromList";
import { LeadDetailsPageSkeleton } from "../components/LeadDetailsPageSkeleton";
import { LeadDetailsPage } from "./LeadDetailsPage";

export function LeadDetailsRoute({ leadId }: { leadId: number }) {
  const queryClient = useQueryClient();
  const sourceName = useSharedEntitySourceLabel(`maros-lead-name-${leadId}`);
  const sourceNumber = useSharedEntitySourceLabel(`maros-lead-number-${leadId}`);
  const ctx = useLeadsApp();
  const lead = findCachedListItem<Lead>(queryClient, leadsKeys.all, (item) => item.id === leadId && Boolean(item.contact && item.projectType));
  const query = useNavigationDetailQuery<LeadDetails | null>({
    queryKey: [...leadsKeys.detail(leadId), "view"],
    initialData: lead ? leadDetailsFromList(lead) : undefined,
    queryFn: async () => {
      const record = await ctx.repos.lead.getById(leadId);
      return record ? leadDetailsFromList(record) : null;
    },
  });
  if (query.isPending) return <LeadDetailsPageSkeleton leadId={leadId} leadName={sourceName} leadNumber={sourceNumber} />;
  return <LeadDetailsPage leadId={leadId} initialData={{ leadDetails: query.data ?? null, error: query.error?.message }} />;
}

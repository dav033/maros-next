"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LeadType } from "@/leads/domain";
import {
  invalidateAnalytics,
  useCostsBreakdown,
  useExpensesSummary,
  useLeadsPerMonth,
  useOverview,
  usePipeline,
  useProjectHealth,
  useProjectsStatus,
  useRevenueTrend,
  useTopClients,
} from "../application";
import { useAnalyticsApp } from "@/di";
import { DashboardFiltersBar, DashboardWidgets, useDashboardDateRange } from "./dashboard";
import type { DashboardLeadScope } from "./dashboard/DashboardFiltersBar";

type TopBy = "revenue" | "volume";

function readTopByFromParams(value: string | null): TopBy {
  return value === "volume" ? "volume" : "revenue";
}

function readLeadScopeFromParams(value: string | null): DashboardLeadScope {
  switch (value?.toLowerCase()) {
    case "construction":
    case LeadType.CONSTRUCTION.toLowerCase():
      return LeadType.CONSTRUCTION;
    case "plumbing":
    case LeadType.PLUMBING.toLowerCase():
      return LeadType.PLUMBING;
    case "roofing":
    case LeadType.ROOFING.toLowerCase():
      return LeadType.ROOFING;
    default:
      return "all";
  }
}

function toLeadTypeParam(scope: DashboardLeadScope): string | null {
  switch (scope) {
    case LeadType.CONSTRUCTION:
      return "construction";
    case LeadType.PLUMBING:
      return "plumbing";
    case LeadType.ROOFING:
      return "roofing";
    default:
      return null;
  }
}

export function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const analyticsApp = useAnalyticsApp();
  const [refreshing, setRefreshing] = useState(false);
  const [topClientsBy, setTopClientsBy] = useState<TopBy>(() =>
    readTopByFromParams(searchParams.get("topBy")),
  );
  const [leadScope, setLeadScope] = useState<DashboardLeadScope>(() =>
    readLeadScopeFromParams(searchParams.get("leadType")),
  );
  const {
    draftRange,
    range,
    hasValidRange,
    hasRangeChanged,
    hasInvertedDates,
    appliedQuickRangeLabel,
    setDraftRange,
    applyRange,
    resetRange,
    applyQuickRange,
  } = useDashboardDateRange();
  const leadType = leadScope === "all" ? undefined : leadScope;

  useEffect(() => {
    setTopClientsBy(readTopByFromParams(searchParams.get("topBy")));
    setLeadScope(readLeadScopeFromParams(searchParams.get("leadType")));
  }, [searchParams]);

  const overview = useOverview({ ...range, leadType });
  const pipeline = usePipeline(leadType);
  const projectsStatus = useProjectsStatus(leadType);
  const leadsPerMonth = useLeadsPerMonth({ months: 12, from: range.from, to: range.to, leadType });
  const revenueTrend = useRevenueTrend({ months: 12, from: range.from, to: range.to, leadType });
  const topClients = useTopClients(5, topClientsBy, leadType);
  const projectHealth = useProjectHealth(leadType);
  const expensesSummary = useExpensesSummary({
    from: range.from,
    to: range.to,
    enabled: leadScope === "all",
  });
  const costsBreakdown = useCostsBreakdown({
    from: range.from,
    to: range.to,
    enabled: leadScope === "all",
  });

  const isUpdating = [
    overview,
    pipeline,
    projectsStatus,
    leadsPerMonth,
    revenueTrend,
    topClients,
    projectHealth,
    expensesSummary,
    costsBreakdown,
  ].some((query) => query.isFetching);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await analyticsApp.repos.analytics.refresh();
    } finally {
      await invalidateAnalytics(queryClient);
      setRefreshing(false);
    }
  };

  const handleTopClientsByChange = (next: TopBy) => {
    if (next === topClientsBy) {
      return;
    }
    setTopClientsBy(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("topBy", next);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleLeadScopeChange = (next: DashboardLeadScope) => {
    if (next === leadScope) {
      return;
    }
    setLeadScope(next);
    const params = new URLSearchParams(searchParams.toString());
    const leadTypeParam = toLeadTypeParam(next);
    if (leadTypeParam) {
      params.set("leadType", leadTypeParam);
    } else {
      params.delete("leadType");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const leadTypeParam = toLeadTypeParam(leadScope);
  const revenueHref = `/reports/quickbooks/revenue?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}${leadTypeParam ? `&leadType=${encodeURIComponent(leadTypeParam)}` : ""}`;

  return (
    <section className="space-y-6 pb-10">
      <DashboardFiltersBar
        draftRange={draftRange}
        appliedRange={range}
        hasValidRange={hasValidRange}
        hasRangeChanged={hasRangeChanged}
        hasInvertedDates={hasInvertedDates}
        appliedQuickRangeLabel={appliedQuickRangeLabel}
        currentLeadScope={leadScope}
        refreshing={refreshing}
        isUpdating={isUpdating}
        onDraftChange={setDraftRange}
        onLeadScopeChange={handleLeadScopeChange}
        onApply={applyRange}
        onReset={resetRange}
        onRefresh={handleRefresh}
        onApplyQuickRange={applyQuickRange}
      />

      <DashboardWidgets
        overview={overview}
        pipeline={pipeline}
        projectsStatus={projectsStatus}
        leadsPerMonth={leadsPerMonth}
        costsBreakdown={costsBreakdown}
        revenueTrend={revenueTrend}
        topClients={topClients}
        topClientsBy={topClientsBy}
        onTopClientsByChange={handleTopClientsByChange}
        currentLeadScope={leadScope}
        projectHealth={projectHealth}
        expensesSummary={expensesSummary}
        revenueRangeLabel={appliedQuickRangeLabel ?? `${range.from} → ${range.to}`}
        revenueHref={revenueHref}
      />
    </section>
  );
}

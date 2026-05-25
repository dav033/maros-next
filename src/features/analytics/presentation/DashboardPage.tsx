"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  invalidateAnalytics,
  useAging,
  useFinancialSnapshot,
  useOverview,
  usePipeline,
  useProjectHealth,
  useProjectsStatus,
  useRevenueTrend,
  useTopClients,
} from "../application";
import { useAnalyticsApp } from "@/di";
import { DashboardFiltersBar, DashboardWidgets, useDashboardDateRange } from "./dashboard";

type TopBy = "revenue" | "volume";

function readTopByFromParams(value: string | null): TopBy {
  return value === "volume" ? "volume" : "revenue";
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

  const overview = useOverview(range);
  const pipeline = usePipeline();
  const projectsStatus = useProjectsStatus();
  const financialSnapshot = useFinancialSnapshot();
  const aging = useAging();
  const revenueTrend = useRevenueTrend({ months: 12, from: range.from, to: range.to });
  const topClients = useTopClients(5, topClientsBy);
  const projectHealth = useProjectHealth();

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

  const revenueHref = `/reports/quickbooks/revenue?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`;
  const outstandingHref = `/reports/quickbooks/outstanding?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`;
  const backlogHref = `/reports/quickbooks/backlog?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`;

  return (
    <section className="space-y-6 pb-10">
      <DashboardFiltersBar
        draftRange={draftRange}
        appliedRange={range}
        hasValidRange={hasValidRange}
        hasRangeChanged={hasRangeChanged}
        hasInvertedDates={hasInvertedDates}
        appliedQuickRangeLabel={appliedQuickRangeLabel}
        refreshing={refreshing}
        onDraftChange={setDraftRange}
        onApply={applyRange}
        onReset={resetRange}
        onRefresh={handleRefresh}
        onApplyQuickRange={applyQuickRange}
      />

      <DashboardWidgets
        overview={overview}
        pipeline={pipeline}
        projectsStatus={projectsStatus}
        financialSnapshot={financialSnapshot}
        aging={aging}
        revenueTrend={revenueTrend}
        topClients={topClients}
        topClientsBy={topClientsBy}
        onTopClientsByChange={handleTopClientsByChange}
        projectHealth={projectHealth}
        revenueRangeLabel={appliedQuickRangeLabel ?? `${range.from} → ${range.to}`}
        revenueHref={revenueHref}
        outstandingHref={outstandingHref}
        backlogHref={backlogHref}
      />
    </section>
  );
}

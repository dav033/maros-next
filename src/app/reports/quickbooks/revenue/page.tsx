import { QueryClient, dehydrate } from "@tanstack/react-query";
import { headers } from "next/headers";
import { QuickbooksReportPrefetchBoundary } from "@/quickbooks";
import {
  createPrefetchAnalyticsRepository,
  prefetchOverview,
  prefetchQuickbooksRevenueReport,
  prefetchRevenueTrend,
} from "@/quickbooks/application/queries/prefetchQuickbooksData";
import { createServerApiClient } from "@/shared/infra/http/serverRepositories";
import { RevenueReportPageClient } from "./RevenueReportContent";

type DateRange = { from: string; to: string };

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultRange(): DateRange {
  const now = new Date();
  return {
    from: toDateString(new Date(now.getFullYear(), now.getMonth() - 11, 1)),
    to: toDateString(now),
  };
}

function isIsoDate(value: string | null | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function readRange(searchParams: { from?: string; to?: string }): DateRange {
  const fallback = getDefaultRange();
  const { from, to } = searchParams;

  if (!isIsoDate(from) || !isIsoDate(to) || from > to) {
    return fallback;
  }

  return { from, to };
}

type PageProps = {
  searchParams?: Promise<{ from?: string; to?: string }>;
};

export default async function QuickbooksRevenueReportPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const range = readRange(params);

  const reqHeaders = await headers();
  const queryClient = new QueryClient();
  const apiClient = createServerApiClient(reqHeaders);
  const repo = createPrefetchAnalyticsRepository(apiClient);

  try {
    await Promise.all([
      prefetchOverview(queryClient, repo, { from: range.from, to: range.to }),
      prefetchRevenueTrend(queryClient, repo, { months: 12, from: range.from, to: range.to }),
      prefetchQuickbooksRevenueReport(queryClient, repo, { from: range.from, to: range.to }),
    ]);
  } catch {
    // Prefetch failures are intentionally non-fatal; the client components will
    // retry the queries when they mount.
  }

  return (
    <QuickbooksReportPrefetchBoundary dehydratedState={dehydrate(queryClient)}>
      <RevenueReportPageClient />
    </QuickbooksReportPrefetchBoundary>
  );
}

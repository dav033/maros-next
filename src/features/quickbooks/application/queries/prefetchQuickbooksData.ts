import { type QueryClient } from "@tanstack/react-query";
import { AnalyticsHttpRepository } from "@/analytics";
import { analyticsKeys } from "@/features/analytics/application/keys/analyticsKeys";
import { STALE_TIMES } from "@/shared/lib/queryClient";
import type { HttpClientLike } from "@/shared/infra/http";
import type { LeadType } from "@/leads/domain";

export type PrefetchAnalyticsRepository = AnalyticsHttpRepository;

export function createPrefetchAnalyticsRepository(
  api: HttpClientLike,
): PrefetchAnalyticsRepository {
  return new AnalyticsHttpRepository(api);
}

export async function prefetchOverview(
  queryClient: QueryClient,
  repo: PrefetchAnalyticsRepository,
  params?: { from?: string; to?: string; leadType?: LeadType },
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: analyticsKeys.overview(params?.from, params?.to, params?.leadType),
    queryFn: () => repo.getOverview(params),
    staleTime: STALE_TIMES.analytics,
  });
}

export async function prefetchRevenueTrend(
  queryClient: QueryClient,
  repo: PrefetchAnalyticsRepository,
  params?: { months?: number; from?: string; to?: string; leadType?: LeadType },
): Promise<void> {
  const months = params?.months ?? 12;
  await queryClient.prefetchQuery({
    queryKey: analyticsKeys.revenueTrend(months, params?.from, params?.to, params?.leadType),
    queryFn: () =>
      repo.getRevenueTrend({
        months,
        from: params?.from,
        to: params?.to,
        leadType: params?.leadType,
      }),
    staleTime: STALE_TIMES.analytics,
  });
}

export async function prefetchQuickbooksRevenueReport(
  queryClient: QueryClient,
  repo: PrefetchAnalyticsRepository,
  params?: { from?: string; to?: string },
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: analyticsKeys.quickbooksRevenueReport(params?.from, params?.to),
    queryFn: () => repo.getQuickbooksRevenueReport(params),
    staleTime: STALE_TIMES.reports,
  });
}

export async function prefetchProjectFinancials(
  queryClient: QueryClient,
  repo: PrefetchAnalyticsRepository,
  limit: number = 200,
  leadType?: LeadType,
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: analyticsKeys.projectFinancials(limit, leadType),
    queryFn: () => repo.getProjectFinancials({ limit, leadType }),
    staleTime: STALE_TIMES.analytics,
  });
}

export async function prefetchOutstandingBalances(
  queryClient: QueryClient,
  repo: PrefetchAnalyticsRepository,
  limit: number = 100,
  leadType?: LeadType,
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: analyticsKeys.outstandingBalances(limit, leadType),
    queryFn: () => repo.getOutstandingBalances({ limit, leadType }),
    staleTime: STALE_TIMES.analytics,
  });
}

export async function prefetchBacklog(
  queryClient: QueryClient,
  repo: PrefetchAnalyticsRepository,
  limit: number = 100,
  leadType?: LeadType,
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: analyticsKeys.backlog(limit, leadType),
    queryFn: () => repo.getBacklog({ limit, leadType }),
    staleTime: STALE_TIMES.analytics,
  });
}

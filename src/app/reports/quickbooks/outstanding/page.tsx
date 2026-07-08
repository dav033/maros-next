import { QueryClient, dehydrate } from "@tanstack/react-query";
import { headers } from "next/headers";
import { QuickbooksReportPrefetchBoundary } from "@/quickbooks";
import {
  createPrefetchAnalyticsRepository,
  prefetchOutstandingBalances,
} from "@/quickbooks/application/queries/prefetchQuickbooksData";
import { createServerApiClient } from "@/shared/infra/http/serverRepositories";
import { OutstandingReportPageClient } from "./OutstandingReportContent";

export default async function QuickbooksOutstandingReportPage() {
  const reqHeaders = await headers();
  const queryClient = new QueryClient();
  const apiClient = createServerApiClient(reqHeaders);
  const repo = createPrefetchAnalyticsRepository(apiClient);

  try {
    await prefetchOutstandingBalances(queryClient, repo, 100);
  } catch {
    // Prefetch failures are intentionally non-fatal; the client components will
    // retry the queries when they mount.
  }

  return (
    <QuickbooksReportPrefetchBoundary dehydratedState={dehydrate(queryClient)}>
      <OutstandingReportPageClient />
    </QuickbooksReportPrefetchBoundary>
  );
}

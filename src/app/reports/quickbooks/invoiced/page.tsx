import { QueryClient, dehydrate } from "@tanstack/react-query";
import { headers } from "next/headers";
import { QuickbooksReportPrefetchBoundary } from "@/quickbooks";
import {
  createPrefetchAnalyticsRepository,
  prefetchProjectFinancials,
} from "@/quickbooks/application/queries/prefetchQuickbooksData";
import { createServerApiClient } from "@/shared/infra/http/serverRepositories";
import { InvoicedReportPageClient } from "./InvoicedReportContent";

export default async function QuickbooksInvoicedReportPage() {
  const reqHeaders = await headers();
  const queryClient = new QueryClient();
  const apiClient = createServerApiClient(reqHeaders);
  const repo = createPrefetchAnalyticsRepository(apiClient);

  try {
    await prefetchProjectFinancials(queryClient, repo, 200);
  } catch {
    // Prefetch failures are intentionally non-fatal; the client components will
    // retry the queries when they mount.
  }

  return (
    <QuickbooksReportPrefetchBoundary dehydratedState={dehydrate(queryClient)}>
      <InvoicedReportPageClient />
    </QuickbooksReportPrefetchBoundary>
  );
}

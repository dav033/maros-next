import { Suspense } from "react";
import { DashboardPage } from "@/analytics";
import { DashboardPageSkeleton } from "@/features/analytics/presentation/dashboard/DashboardPageSkeleton";

export default function DashboardRoute() {
  return (
    // DashboardPage reads the date range and scope from useSearchParams, so it
    // suspends on first render. The fallback used to be a line of grey text.
    <Suspense fallback={<DashboardPageSkeleton />}>
      <DashboardPage />
    </Suspense>
  );
}

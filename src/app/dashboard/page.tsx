import { Suspense } from "react";
import { DashboardPage } from "@/analytics";

export default function DashboardRoute() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading dashboard...</p>}>
      <DashboardPage />
    </Suspense>
  );
}

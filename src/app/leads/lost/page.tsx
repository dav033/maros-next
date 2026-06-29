import { Suspense } from "react";
import { LostLeadsPageClient } from "./LostLeadsPageClient";
import { LeadsTableSkeleton } from "@/features/leads/presentation/organisms/LeadsTableSkeleton";

export default function LostLeadsPage() {
  return (
    <Suspense fallback={<LeadsTableSkeleton />}>
      <LostLeadsPageClient />
    </Suspense>
  );
}

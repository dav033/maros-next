import { Suspense } from "react";
import CompaniesPage from "@/features/company/presentation/pages/CompaniesPage";
import { CompaniesPageSkeleton } from "@/company/presentation/components/CompaniesPageSkeleton";

export default function CompanyPage() {
  return (
    <Suspense fallback={<CompaniesPageSkeleton />}>
      <CompaniesPage />
    </Suspense>
  );
}

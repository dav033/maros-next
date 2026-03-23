import { Suspense } from "react";
import CompaniesPage from "@/features/company/presentation/pages/CompaniesPage";
import { CompaniesPageSkeleton } from "@/company/presentation/components/CompaniesPageSkeleton";
import { loadCompaniesData } from "@/company/presentation/data/loadCompaniesData";

async function CompaniesPageWithData() {
  const initialData = await loadCompaniesData();
  return <CompaniesPage initialData={initialData} />;
}

export default function CompanyPage() {
  return (
    <Suspense fallback={<CompaniesPageSkeleton />}>
      <CompaniesPageWithData />
    </Suspense>
  );
}

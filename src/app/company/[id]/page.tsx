import { Suspense } from "react";
import { CompanyDetailsPage } from "@/features/company/presentation/pages/CompanyDetailsPage";
import { CompanyDetailsPageSkeleton } from "@/features/company/presentation/components/CompanyDetailsPageSkeleton";
import { loadCompanyDetailsData } from "@/features/company/presentation/data/loadCompanyDetailsData";

async function CompanyDetailsPageWithData({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const idString = resolvedParams.id;
  
  if (!idString) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">Invalid Company ID</h2>
          <p className="text-sm text-muted-foreground">
            No company ID provided. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }
  
  const companyId = parseInt(idString, 10);
  
  if (isNaN(companyId) || companyId <= 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">Invalid Company ID</h2>
          <p className="text-sm text-muted-foreground">
            The company ID "{idString}" is not valid. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }
  
  const initialData = await loadCompanyDetailsData(companyId);
  return <CompanyDetailsPage companyId={companyId} initialData={initialData} />;
}

export default async function CompanyDetailsRoutePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  return (
    <Suspense fallback={<CompanyDetailsPageSkeleton />}>
      <CompanyDetailsPageWithData params={params} />
    </Suspense>
  );
}

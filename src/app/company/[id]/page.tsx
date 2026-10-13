import { Suspense } from "react";
import { CompanyDetailsRoute } from "@/features/company/presentation/pages/CompanyDetailsRoute";
import { CompanyDetailsPageSkeleton } from "@/features/company/presentation/components/CompanyDetailsPageSkeleton";
import { parsePositiveSafeInteger } from "@/shared/utils/parsePositiveSafeInteger";

async function CompanyDetailsPageWithData({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const idString = resolvedParams.id;
  
  if (!idString) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="font-display text-lg font-semibold text-destructive mb-2">Invalid Company ID</h2>
          <p className="text-sm text-muted-foreground">
            No company ID provided. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }
  
  const companyId = parsePositiveSafeInteger(idString);
  
  if (companyId === null) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="font-display text-lg font-semibold text-destructive mb-2">Invalid Company ID</h2>
          <p className="text-sm text-muted-foreground">
            The company ID "{idString}" is not valid. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }
  
  return <CompanyDetailsRoute companyId={companyId} />;
}

export default async function CompanyDetailsRoutePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<CompanyDetailsPageSkeleton />}>
      <CompanyDetailsPageWithData params={params} />
    </Suspense>
  );
}

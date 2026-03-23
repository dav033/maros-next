import { Suspense } from "react";
import { LeadDetailsPage } from "@/leads/presentation/pages/LeadDetailsPage";
import { LeadDetailsPageSkeleton } from "@/features/leads/presentation/components/LeadDetailsPageSkeleton";
import { loadLeadDetailsData } from "@/features/leads/presentation/data/loadLeadDetailsData";

async function LeadDetailsPageWithData({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const idString = resolvedParams.id;
  
  if (!idString) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">Invalid Lead ID</h2>
          <p className="text-sm text-muted-foreground">
            No lead ID provided. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }
  
  const leadId = parseInt(idString, 10);
  
  if (isNaN(leadId) || leadId <= 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">Invalid Lead ID</h2>
          <p className="text-sm text-muted-foreground">
            The lead ID "{idString}" is not valid. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }
  
  const initialData = await loadLeadDetailsData(leadId);
  return <LeadDetailsPage leadId={leadId} initialData={initialData} />;
}

export default async function LeadDetailsRoutePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  return (
    <Suspense fallback={<LeadDetailsPageSkeleton />}>
      <LeadDetailsPageWithData params={params} />
    </Suspense>
  );
}

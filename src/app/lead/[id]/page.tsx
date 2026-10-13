import { Suspense } from "react";
import { LeadDetailsRoute } from "@/leads/presentation/pages/LeadDetailsRoute";
import { LeadDetailsPageSkeleton } from "@/features/leads/presentation/components/LeadDetailsPageSkeleton";
import { parsePositiveSafeInteger } from "@/shared/utils/parsePositiveSafeInteger";

async function LeadDetailsPageWithData({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const idString = resolvedParams.id;
  
  if (!idString) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="font-display text-lg font-semibold text-destructive mb-2">Invalid Lead ID</h2>
          <p className="text-sm text-muted-foreground">
            No lead ID provided. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }
  
  const leadId = parsePositiveSafeInteger(idString);
  
  if (leadId === null) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="font-display text-lg font-semibold text-destructive mb-2">Invalid Lead ID</h2>
          <p className="text-sm text-muted-foreground">
            The lead ID "{idString}" is not valid. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }
  
  return <LeadDetailsRoute leadId={leadId} />;
}

export default async function LeadDetailsRoutePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<LeadDetailsPageSkeleton />}>
      <LeadDetailsPageWithData params={params} />
    </Suspense>
  );
}

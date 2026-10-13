import { EntityDetailHeader, SkeletonCard, SkeletonDetailHeader } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Stand-in for LeadDetailsPage: `container mx-auto p-6 space-y-6`,
 * EntityDetailHeader, then a two-column grid that splits at `lg` — the page's
 * breakpoint, not the `md` this used to guess, which reflowed the layout on any
 * viewport between 768px and 1024px.
 */
export function LeadDetailsPageSkeleton({ leadId, leadName, leadNumber }: { leadId?: number; leadName?: string; leadNumber?: string } = {}) {
  return (
    <div className="container mx-auto space-y-6 p-6">
      {leadId && (leadName || leadNumber) ? (
        <EntityDetailHeader
          title={leadName ?? <Skeleton className="h-9 w-64 max-w-full" />}
          sharedNameLayoutId={leadName ? `maros-lead-name-${leadId}` : undefined}
          identifier={leadNumber}
          sharedIdentifierLayoutId={`maros-lead-number-${leadId}`}
          subtitle={<Skeleton className="h-5 w-48 max-w-full" />}
        />
      ) : <SkeletonDetailHeader />}
      <div className="skeleton-deferred grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <SkeletonCard bodyHeight="h-48" />
          <SkeletonCard bodyHeight="h-32" />
        </div>
        <div className="space-y-6">
          <SkeletonCard bodyHeight="h-32" />
          <SkeletonCard bodyHeight="h-48" />
        </div>
      </div>
    </div>
  );
}

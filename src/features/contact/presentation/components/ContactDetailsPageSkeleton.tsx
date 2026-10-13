import { Skeleton } from "@/components/ui/skeleton";
import { EntityDetailHeader, SkeletonCard, SkeletonDetailHeader } from "@/components/shared";

/**
 * Stand-in for ContactDetailsPage. Two shape fixes: the page carries a row of
 * four stat cards (`md:grid-cols-4`) between the header and the columns, which
 * the skeleton omitted entirely — roughly 100px of content appearing out of
 * nowhere — and its columns split at `lg`, not at the `md` used here.
 */
export function ContactDetailsPageSkeleton({ contactId, contactName }: { contactId?: number; contactName?: string } = {}) {
  return (
    <div className="container mx-auto space-y-6 p-6">
      {contactName && contactId ? (
        <EntityDetailHeader title={contactName} sharedNameLayoutId={`maros-contact-name-${contactId}`} />
      ) : <SkeletonDetailHeader withSubtitle={false} />}

      <div className="skeleton-deferred grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-line bg-card p-4 shadow sm:p-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-8 w-16" />
          </div>
        ))}
      </div>

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

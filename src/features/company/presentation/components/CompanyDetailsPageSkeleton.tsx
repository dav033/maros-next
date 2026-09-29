import { SkeletonCard, SkeletonDetailHeader } from "@/components/shared";

/**
 * Stand-in for CompanyDetailsPage: `container mx-auto p-6 space-y-6`,
 * EntityDetailHeader, then a two-column grid that splits at `lg`. It used to
 * split at `md`, so between 768px and 1024px the skeleton showed two columns
 * and the loaded page one — the content reflowed the moment it arrived.
 */
export function CompanyDetailsPageSkeleton() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <SkeletonDetailHeader withSubtitle={false} />
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

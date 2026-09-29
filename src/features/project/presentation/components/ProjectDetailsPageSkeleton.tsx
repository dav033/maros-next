import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/shared";

/**
 * Stand-in for ProjectDetailsPage. The real page is `container mx-auto p-6
 * space-y-6` with a back-button header and then a 2/3 + 1/3 grid
 * (`lg:grid-cols-3`, main column `lg:col-span-2`); this used to draw a symmetric
 * `md:grid-cols-2`, so the columns visibly resized when the data landed. It also
 * painted raw `bg-muted` blocks, which is the menu surface, not a placeholder
 * colour — everything goes through <Skeleton> now, on the shared shimmer.
 */
export function ProjectDetailsPageSkeleton() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header: back button + title + subtitle, actions on the right. */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="size-9 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>

      <div className="skeleton-deferred grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SkeletonCard bodyHeight="h-64" />
          <SkeletonCard bodyHeight="h-48" />
        </div>
        <div className="space-y-6 lg:col-span-1">
          <SkeletonCard bodyHeight="h-40" />
          <SkeletonCard bodyHeight="h-56" />
        </div>
      </div>
    </div>
  );
}

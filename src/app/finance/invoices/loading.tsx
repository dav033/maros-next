import { SkeletonCardList } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * /finance/invoices is `force-dynamic` and awaits the session before it renders
 * anything, so the route had a blank gap with no loading state of its own. The
 * page's own in-page skeleton only starts once its bundle is running.
 */
export default function Loading() {
  return (
    <div className="flex w-full flex-1 flex-col gap-3 sm:gap-4">
      <header className="rounded-2xl border border-line bg-elev-1 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
      </header>
      <SkeletonCardList count={6} lines={2} />
    </div>
  );
}

"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { BOARD_STATUSES } from "@/tasks/domain";

/**
 * The board's loading state. It used to draw three loose bars per lane and
 * nothing else: no lane container, no filter toolbar, and 80px cards where
 * TaskCard is `min-h-[132px]`. The board therefore appeared to grow a toolbar
 * and half again as much height the moment the tasks arrived. Each lane here is
 * the real StatusLane box — `w-72 rounded-xl border border-line bg-elev-1`, a
 * bordered header strip, then `p-2` of cards.
 */
export function TaskBoardSkeleton() {
  return (
    <div className="skeleton-deferred flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-elev-2 p-3">
        <Skeleton className="h-9 min-w-[200px] flex-1" />
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {BOARD_STATUSES.map((status) => (
          <div
            key={status}
            className="flex w-72 shrink-0 flex-col rounded-xl border border-line bg-elev-1"
          >
            <div className="flex items-center justify-between border-b border-line px-3 py-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-6 rounded-full" />
            </div>
            <div className="flex flex-col gap-2 p-2">
              <Skeleton className="h-[132px] w-full rounded-lg" />
              <Skeleton className="h-[132px] w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

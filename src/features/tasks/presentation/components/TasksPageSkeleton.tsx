"use client";

import { KanbanSquare } from "lucide-react";
import { PageHeaderCard } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskBoardSkeleton } from "../organisms/TaskBoardSkeleton";

/**
 * /tasks had no loading state at all: the route is `force-dynamic` and awaits
 * the session on the server, and its Suspense fallback was `null`, so the page
 * stayed blank until the board mounted.
 *
 * The header is the real PageHeaderCard with the real copy — it is known before
 * any data is — so only the parts that depend on the query are placeholders, and
 * the chrome does not move when the board arrives. The body is the board, which
 * is the default view.
 */
export function TasksPageSkeleton() {
  return (
    <div className="flex w-full flex-1 flex-col gap-3 sm:gap-4">
      <PageHeaderCard
        icon={KanbanSquare}
        title="Tasks"
        description="What needs doing, who's doing it, and what it's waiting on."
        rightSlot={<Skeleton className="h-9 w-28 rounded-md" />}
        belowSlot={
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-8 w-52 rounded-lg" />
            <Skeleton className="h-8 w-40 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        }
      />

      <section className="mt-2 flex-1 overflow-hidden">
        <TaskBoardSkeleton />
      </section>
    </div>
  );
}

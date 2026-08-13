"use client";

import { Suspense } from "react";
import { useTaskEventsStream } from "@/features/tasks/presentation/hooks/data/useTaskEventsStream";
import { TaskKeyboardShortcuts } from "@/features/tasks/presentation/organisms/TaskKeyboardShortcuts";
import { TaskSearchPalette } from "@/features/tasks/presentation/organisms/TaskSearchPalette";

/**
 * No visual chrome — each tasks page already builds its own header. This layout
 * exists purely to mount things once for every route under /tasks (board, list,
 * mine) instead of duplicating them per page view: the live-updates subscription,
 * and the `c`/`/`/`⌘K` keyboard shortcuts. The shortcuts/palette read the `?task=`
 * param (useTaskDetailRoute → useSearchParams), so — same as every /tasks page.tsx —
 * they need their own Suspense boundary here rather than borrowing the page's.
 */
export default function TasksLayout({ children }: { children: React.ReactNode }) {
  useTaskEventsStream();
  return (
    <>
      <Suspense fallback={null}>
        <TaskKeyboardShortcuts />
        <TaskSearchPalette />
      </Suspense>
      {children}
    </>
  );
}

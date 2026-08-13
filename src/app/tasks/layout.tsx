"use client";

import { useTaskEventsStream } from "@/features/tasks/presentation/hooks/data/useTaskEventsStream";

/**
 * No visual chrome — each tasks page already builds its own header. This layout
 * exists purely to mount the live-updates subscription once for every route under
 * /tasks (board, list, mine), instead of duplicating it per page view.
 */
export default function TasksLayout({ children }: { children: React.ReactNode }) {
  useTaskEventsStream();
  return <>{children}</>;
}

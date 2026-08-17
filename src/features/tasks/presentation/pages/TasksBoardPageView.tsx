"use client";

import { KanbanSquare } from "lucide-react";
import Link from "next/link";
import { PageHeaderCard } from "@/components/shared";
import { TaskBoard } from "../organisms/TaskBoard";
import { CreateTaskDialog } from "../organisms/CreateTaskDialog";
import { TaskDetailSheet } from "../organisms/TaskDetailSheet";
import { TaskViewSwitcher } from "../molecules/TaskViewSwitcher";
import { TaskScopeBar } from "../molecules/TaskScopeBar";
import { TaskSavedViews } from "../molecules/TaskSavedViews";
import { useTaskDetailRoute } from "../hooks/useTaskDetailRoute";

export function TasksBoardPageView() {
  const { taskId, openTask, closeTask } = useTaskDetailRoute();

  return (
    <div className="flex w-full flex-1 flex-col gap-3 sm:gap-4">
      <PageHeaderCard
        icon={KanbanSquare}
        title="Tasks"
        description="What needs doing, who's doing it, and what it's waiting on."
        rightSlot={<CreateTaskDialog onCreated={openTask} />}
        belowSlot={<div className="flex flex-wrap items-center gap-3"><TaskViewSwitcher current="board" /><TaskScopeBar /><TaskSavedViews /><Link href="/tasks/archive" className="text-xs text-muted-foreground underline decoration-dotted hover:text-foreground">Archived</Link></div>}
      />

      <section className="mt-2 flex-1 overflow-hidden">
        <TaskBoard onOpenTask={openTask} />
      </section>

      <TaskDetailSheet taskId={taskId} onClose={closeTask} onOpenTask={openTask} />
    </div>
  );
}

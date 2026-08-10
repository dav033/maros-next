"use client";

import { KanbanSquare } from "lucide-react";
import { PageHeaderCard } from "@/components/shared";
import { TaskBoard } from "../organisms/TaskBoard";
import { CreateTaskDialog } from "../organisms/CreateTaskDialog";
import { TaskDetailSheet } from "../organisms/TaskDetailSheet";
import { TaskViewSwitcher } from "../molecules/TaskViewSwitcher";
import { useTaskDetailRoute } from "../hooks/useTaskDetailRoute";

export function TasksBoardPageView() {
  const { taskId, openTask, closeTask } = useTaskDetailRoute();

  return (
    <main className="flex min-h-[calc(100vh-80px)] w-full flex-col gap-3 bg-background px-3 py-3 pt-16 sm:gap-4 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:pt-6">
      <PageHeaderCard
        icon={KanbanSquare}
        title="Tasks"
        description="What needs doing, who's doing it, and what it's waiting on."
        rightSlot={<CreateTaskDialog onCreated={openTask} />}
        belowSlot={<TaskViewSwitcher current="board" />}
      />

      <section className="dashboard-section-enter mt-2 flex-1 overflow-hidden">
        <TaskBoard onOpenTask={openTask} />
      </section>

      <TaskDetailSheet taskId={taskId} onClose={closeTask} />
    </main>
  );
}

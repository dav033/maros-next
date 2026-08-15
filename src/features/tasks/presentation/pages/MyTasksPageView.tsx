"use client";

import { useMemo } from "react";
import { CheckCheck, UserCheck } from "lucide-react";
import { PageHeaderCard } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/shared/auth/CurrentUserProvider";
import { useInstantMyTasks, type MyTasksBucketKey } from "../hooks/data/useInstantMyTasks";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { useTaskDetailRoute } from "../hooks/useTaskDetailRoute";
import { TaskEmptyState } from "../atoms/TaskEmptyState";
import { CreateTaskDialog } from "../organisms/CreateTaskDialog";
import { MyTaskRow } from "../organisms/MyTaskRow";
import { TaskDetailSheet } from "../organisms/TaskDetailSheet";
import { TaskViewSwitcher } from "../molecules/TaskViewSwitcher";

const SECTIONS: Array<{ key: MyTasksBucketKey; label: string }> = [
  { key: "overdue", label: "Overdue" },
  { key: "today", label: "Today" },
  { key: "thisWeek", label: "This week" },
  { key: "later", label: "Later" },
  { key: "noDueDate", label: "No due date" },
];

/**
 * Mobile-first by design (PLAN-TAREAS.md §0.8, §6.3) — this is the view someone opens
 * standing on a job site: large tap targets, a one-tap status button per row, and no
 * drag & drop.
 */
export function MyTasksPageView() {
  const { user } = useCurrentUser();
  const { taskId, openTask, closeTask } = useTaskDetailRoute();
  const { buckets, showSkeleton } = useInstantMyTasks();
  const { moveMutation } = useTaskMutations();

  const allTasks = useMemo(() => Object.values(buckets).flat(), [buckets]);
  const totalCount = allTasks.length;

  return (
    <div className="flex w-full flex-1 flex-col gap-3 sm:gap-4">
      <PageHeaderCard
        icon={UserCheck}
        title="My tasks"
        description="What's yours, grouped by when it's due."
        rightSlot={
          <CreateTaskDialog
            onCreated={openTask}
            defaultAssigneeId={user?.id}
            defaultAssigneeLabel={user?.name ?? user?.email}
          />
        }
        belowSlot={<TaskViewSwitcher current="mine" />}
      />

      {showSkeleton ? (
        <div className="flex w-full max-w-xl flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : totalCount === 0 ? (
        <TaskEmptyState
          icon={CheckCheck}
          title="Nothing due"
          description="You're all caught up."
          className="dashboard-section-enter flex-1 py-16"
        />
      ) : (
        // Capped width: rows carry a full-bleed h-12 CTA button by design (mobile-first,
        // one-tap — see PLAN-TAREAS.md §6.3), which reads fine on a phone but stretches
        // into an absurdly wide, mostly-empty bar on a desktop-width column.
        <div className="dashboard-section-enter flex w-full max-w-xl flex-1 flex-col gap-5">
          {SECTIONS.map(({ key, label }) => {
            const tasks = buckets[key];
            if (tasks.length === 0) return null;

            return (
              <section key={key} className="flex flex-col gap-2.5">
                <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {label}
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {tasks.length}
                  </span>
                </h2>
                <div className="flex flex-col gap-2.5">
                  {tasks.map((task) => (
                    <MyTaskRow
                      key={task.id}
                      task={task}
                      onOpen={() => openTask(task.id)}
                      onAdvance={(status) =>
                        moveMutation.mutate({ id: task.id, input: { status } })
                      }
                      isAdvancing={
                        moveMutation.isPending && moveMutation.variables?.id === task.id
                      }
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <TaskDetailSheet taskId={taskId} onClose={closeTask} onOpenTask={openTask} />
    </div>
  );
}

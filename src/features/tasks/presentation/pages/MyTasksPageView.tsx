"use client";

import { useMemo } from "react";
import { CheckCheck, UserCheck } from "lucide-react";
import { PageHeaderCard } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/shared/auth/CurrentUserProvider";
import { useInstantLeads } from "@/leads/presentation/hooks/data/useInstantLeads";
import { useInstantProjects } from "@/project/presentation/hooks/data/useInstantProjects";
import { useInstantMyTasks, type MyTasksBucketKey } from "../hooks/data/useInstantMyTasks";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { useTaskDetailRoute } from "../hooks/useTaskDetailRoute";
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
  const hasLinkedTask = allTasks.some(
    (task) => task.entityKind === "lead" || task.entityKind === "project"
  );

  // Address lookups are a progressive enhancement, not the page's reason to exist — only
  // paid for when a task actually links to a lead/project, and never allowed to block or
  // error out the rows themselves (see JobAddressLink: no match just renders nothing).
  const { leads } = useInstantLeads(undefined, { enabled: hasLinkedTask });
  const { projects } = useInstantProjects(undefined, { enabled: hasLinkedTask });

  const totalCount = allTasks.length;

  return (
    <main className="flex min-h-[calc(100vh-80px)] w-full flex-col gap-3 bg-background px-3 py-3 pt-16 sm:gap-4 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:pt-6">
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
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : totalCount === 0 ? (
        <div className="dashboard-section-enter flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-16 text-center">
          <CheckCheck className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Nothing due</p>
          <p className="text-xs text-muted-foreground">You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className="dashboard-section-enter flex flex-1 flex-col gap-5">
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
                      leads={leads}
                      projects={projects}
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
    </main>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { CheckCheck, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasksApp } from "@/di";
import { tasksKeys } from "@/tasks/application";
import { PageHeaderCard } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/shared/auth/CurrentUserProvider";
import { todayInBusinessTimezone } from "@/shared/lib/businessDate";
import { useInstantMyTasks, type MyTasksBucketKey } from "../hooks/data/useInstantMyTasks";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { useTaskDetailRoute } from "../hooks/useTaskDetailRoute";
import { TaskEmptyState } from "../atoms/TaskEmptyState";
import { CreateTaskDialog } from "../organisms/CreateTaskDialog";
import { MyTaskRow } from "../organisms/MyTaskRow";
import { TaskDetailSheet } from "../organisms/TaskDetailSheet";
import { TaskViewSwitcher } from "../molecules/TaskViewSwitcher";
import { TaskScopeBar } from "../molecules/TaskScopeBar";
import { TaskSavedViews } from "../molecules/TaskSavedViews";
import { JobAddressLink } from "../molecules/JobAddressLink";
import {
  countOfflineTaskChanges,
  enqueueOfflineTaskChange,
  listOfflineTaskChanges,
  removeOfflineTaskChange,
  type OfflineTaskChangeInput,
} from "../offline/taskOfflineQueue";
import { getEntityPresignedUploadUrl } from "@/features/attachments/actions/s3Actions";
import { isOfflineQueueSupported, isRetryableOfflineFailure, isRetryableUploadStatus, RetryableUploadError, runWithOfflineFallback } from "../offline/offlineRetryPolicy";

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
  const ctx = useTasksApp();
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const { taskId, openTask, closeTask } = useTaskDetailRoute();
  const { buckets, showSkeleton, refetch } = useInstantMyTasks();
  const { moveMutation, updateMutation, addAttachmentsMutation } = useTaskMutations();
  const timerMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "start" | "stop" }) =>
      action === "start" ? ctx.repos.task.startTimer(id) : ctx.repos.task.stopTimer(id),
    onSuccess: (_task, variables) => {
      void queryClient.invalidateQueries({ queryKey: tasksKeys.mine() });
      void queryClient.invalidateQueries({ queryKey: tasksKeys.detail(variables.id) });
    },
  });
  const [isOnline, setIsOnline] = useState(true);
  const [pendingOffline, setPendingOffline] = useState(0);
  const [offlineRetry, setOfflineRetry] = useState(0);
  const [offlineWarning, setOfflineWarning] = useState<string | null>(null);
  const pullStartY = useRef<number | null>(null);
  const pullContainer = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);
    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);
  useEffect(() => {
    const onTouchStart = (event: TouchEvent) => {
      const container = document.querySelector<HTMLElement>("main");
      if ((container?.scrollTop ?? window.scrollY) === 0) {
        pullContainer.current = container;
        pullStartY.current = event.touches[0]?.clientY ?? null;
      }
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (pullStartY.current == null || (pullContainer.current?.scrollTop ?? window.scrollY) !== 0) return;
      const delta = (event.changedTouches[0]?.clientY ?? pullStartY.current) - pullStartY.current;
      pullStartY.current = null;
      pullContainer.current = null;
      if (delta > 72) void refetch();
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [refetch]);

  const refreshPending = async () => {
    if (!isOfflineQueueSupported()) {
      setPendingOffline(0);
      setOfflineWarning("Offline changes cannot be saved because this browser does not support offline storage.");
      return;
    }
    try {
      setPendingOffline(await countOfflineTaskChanges());
    } catch {
      setOfflineWarning("Could not read pending offline changes. Retrying shortly.");
    }
  };
  const queueOffline = async (change: OfflineTaskChangeInput): Promise<boolean> => {
    try {
      const queued = await enqueueOfflineTaskChange(change);
      if (!queued) {
        setOfflineWarning("Offline changes cannot be saved because this browser does not support offline storage.");
        return false;
      }
      setOfflineWarning(null);
      await refreshPending();
      return true;
    } catch {
      setOfflineWarning("Could not save this offline change. Keep the app open and try again.");
      return false;
    }
  };
  useEffect(() => { void refreshPending(); }, []);
  useEffect(() => {
    if (!isOnline) return;
    if (!isOfflineQueueSupported()) {
      setOfflineWarning("Offline changes cannot be saved because this browser does not support offline storage.");
      return;
    }
    let retryTimer: number | undefined;
    void (async () => {
      let changes;
      try {
        changes = await listOfflineTaskChanges();
      } catch {
        setOfflineWarning("Could not read pending offline changes. Retrying shortly.");
        retryTimer = window.setTimeout(() => setOfflineRetry((value) => value + 1), 15000);
        return;
      }
      let failed = false;
      for (const change of changes) {
        try {
          if (change.operation === "move") {
            await moveMutation.mutateAsync({ id: change.taskId, input: { status: change.status } });
          } else if (change.operation === "postpone") {
            await updateMutation.mutateAsync({ id: change.taskId, patch: { dueDate: change.dueDate } });
          } else {
            if (change.uploadedKey) {
              await addAttachmentsMutation.mutateAsync({ id: change.taskId, keys: [change.uploadedKey] });
            } else {
              const { url, key } = await getEntityPresignedUploadUrl("task", change.taskId, change.fileName, change.contentType);
              const response = await fetch(url, { method: "PUT", headers: { "Content-Type": change.contentType }, body: change.blob });
              if (!response.ok) {
                if (isRetryableUploadStatus(response.status)) throw new RetryableUploadError("Photo upload temporarily failed");
                throw new Error("Photo upload was rejected");
              }
              await addAttachmentsMutation.mutateAsync({ id: change.taskId, keys: [key] });
            }
          }
          await removeOfflineTaskChange(change.id);
        } catch (error) {
          // Keep draining independent changes and retry transient network/API
          // failures instead of starving the rest of the field worker's queue.
          if (isRetryableOfflineFailure(error, navigator.onLine)) failed = true;
          else setOfflineWarning("A pending change needs attention before it can be sent.");
          continue;
        }
      }
      await refreshPending();
      if (failed && navigator.onLine) {
        retryTimer = window.setTimeout(() => setOfflineRetry((value) => value + 1), 15000);
      }
    })();
    return () => { if (retryTimer !== undefined) window.clearTimeout(retryTimer); };
  }, [isOnline, offlineRetry]);

  const moveOrQueue = async (taskId: number, status: "in_progress" | "done") => {
    await runWithOfflineFallback(
      navigator.onLine,
      () => moveMutation.mutateAsync({ id: taskId, input: { status } }),
      async () => { await queueOffline({ operation: "move", taskId, status }); },
    );
  };

  const postponeOrQueue = async (taskId: number, dueDate: string) => {
    await runWithOfflineFallback(
      navigator.onLine,
      () => updateMutation.mutateAsync({ id: taskId, patch: { dueDate } }),
      async () => { await queueOffline({ operation: "postpone", taskId, dueDate }); },
    );
  };

  const uploadOrQueuePhoto = async (taskId: number, file: File) => {
    const contentType = file.type || "image/jpeg";
    if (!navigator.onLine) {
      await queueOffline({ operation: "photo", taskId, fileName: file.name, contentType, blob: file });
      return;
    }
    let uploadedKey: string | undefined;
    try {
      const { url, key } = await getEntityPresignedUploadUrl("task", taskId, file.name, contentType);
      const response = await fetch(url, { method: "PUT", headers: { "Content-Type": contentType }, body: file });
      if (!response.ok) {
        if (isRetryableUploadStatus(response.status)) throw new RetryableUploadError("Photo upload temporarily failed");
        throw new Error("Photo upload was rejected");
      }
      uploadedKey = key;
      await addAttachmentsMutation.mutateAsync({ id: taskId, keys: [key] });
    } catch (error) {
      // A connection can disappear between navigator.onLine and the upload. Keep
      // the original Blob so the field worker can retry it after reconnecting.
      if (isRetryableOfflineFailure(error, navigator.onLine)) {
        await queueOffline({ operation: "photo", taskId, fileName: file.name, contentType, blob: file, uploadedKey });
      } else {
        throw error;
      }
    }
  };

  const allTasks = useMemo(() => Object.values(buckets).flat(), [buckets]);
  const totalCount = allTasks.length;
  const [groupBy, setGroupBy] = useState<"job" | "date">("job");
  const jobGroups = useMemo(() => {
    const groups = new Map<string, { key: string; label: string; address: string | null; addressLink: string | null; tasks: typeof allTasks }>();
    for (const task of allTasks) {
      const key = task.entity ? `${task.entity.kind}:${task.entity.id}` : "unlinked";
      const current = groups.get(key) ?? {
        key,
        label: task.entity?.label ?? "Unlinked job",
        address: task.entity?.address ?? null,
        addressLink: task.entity?.addressLink ?? null,
        tasks: [],
      };
      current.tasks.push(task);
      groups.set(key, current);
    }
    return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [allTasks]);
  const groups = useMemo(() => {
    if (groupBy === "job") return jobGroups;
    return SECTIONS.map(({ key, label }) => ({
      key: `date:${key}`,
      label,
      address: null,
      addressLink: null,
      tasks: allTasks.filter((task) => buckets[key].some((candidate) => candidate.id === task.id)),
    })).filter((group) => group.tasks.length > 0);
  }, [allTasks, buckets, groupBy, jobGroups]);

  return (
    <div className="flex w-full flex-1 flex-col gap-3 sm:gap-4">
      <PageHeaderCard
        icon={UserCheck}
        title="My tasks"
        description="What's yours, grouped by job or due date."
        rightSlot={
          <CreateTaskDialog
            onCreated={openTask}
            defaultAssigneeId={user?.id}
            defaultAssigneeLabel={user?.name ?? user?.email}
          />
        }
        belowSlot={<div className="flex flex-wrap items-center gap-3"><TaskViewSwitcher current="mine" /><TaskScopeBar /><TaskSavedViews /><div className="flex items-center gap-1" role="group" aria-label="Group tasks"><Button type="button" size="sm" variant={groupBy === "job" ? "secondary" : "ghost"} aria-pressed={groupBy === "job"} onClick={() => setGroupBy("job")}>By job</Button><Button type="button" size="sm" variant={groupBy === "date" ? "secondary" : "ghost"} aria-pressed={groupBy === "date"} onClick={() => setGroupBy("date")}>By date</Button></div></div>}
      />
      {!isOnline || pendingOffline > 0 ? <p className="rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700">{!isOnline ? "Offline" : "Queued changes"}: {pendingOffline} pending change{pendingOffline === 1 ? "" : "s"}.</p> : null}
      {offlineWarning ? <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{offlineWarning}</p> : null}

      {showSkeleton ? (
        <div className="flex w-full flex-col gap-3">
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
        <div className="dashboard-section-enter flex w-full flex-1 flex-col gap-5">
          {groups.map((job) => (
            <section key={job.key} className="flex flex-col gap-3">
              <header className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-foreground">{job.label}</h2>
                  {job.address ? <JobAddressLink address={{ label: job.address, href: job.addressLink }} /> : null}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{job.tasks.length}</span>
              </header>
              {SECTIONS.map(({ key, label }) => {
                const tasks = job.tasks.filter((task) => buckets[key].some((candidate) => candidate.id === task.id));
                if (tasks.length === 0) return null;
                return (
                  <div key={key} className="space-y-2">
                    <h3 className="text-xs font-medium text-muted-foreground">{label} · {tasks.length}</h3>
                    <div className="grid gap-2.5 lg:grid-cols-2 xl:grid-cols-3">
                      {tasks.map((task) => (
                        <MyTaskRow
                          key={task.id}
                          task={task}
                          onOpen={() => openTask(task.id)}
                          onAdvance={(status) => { void moveOrQueue(task.id, status); }}
                          onPhotoSelected={(file) => uploadOrQueuePhoto(task.id, file)}
                          onTimer={(action) => timerMutation.mutate({ id: task.id, action })}
                          isTiming={timerMutation.isPending && timerMutation.variables?.id === task.id}
                          onPostpone={() => {
                            const base = task.dueDate ?? todayInBusinessTimezone();
                            void postponeOrQueue(task.id, format(addDays(new Date(`${base}T00:00:00`), 1), "yyyy-MM-dd"));
                          }}
                          isAdvancing={moveMutation.isPending && moveMutation.variables?.id === task.id}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      )}

      <TaskDetailSheet taskId={taskId} onClose={closeTask} onOpenTask={openTask} />
    </div>
  );
}

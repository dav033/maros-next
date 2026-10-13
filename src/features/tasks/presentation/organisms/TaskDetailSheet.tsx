"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { SharedEntityName } from "@/components/shared/SharedEntityName";
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Archive, AlertTriangle, CalendarPlus, Link2, MapPin, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EntityAttachmentsSection } from "@/features/attachments/presentation/EntityAttachmentsSection";
import { NoteMentionsSection } from "@/features/notes/presentation/organisms/NoteMentionsSection";
import { useCurrentUser } from "@/shared/auth/CurrentUserProvider";
import { useTasksApp } from "@/di";
import { useDraftField } from "@/shared/presentation/hooks/useDraftField";
import { sharedEntityNameTransition, TASK_CARD_SURFACE_DURATION_MS } from "@/shared/presentation/motionTransitions";
import { tasksKeys } from "@/tasks/application";
import { TASK_KINDS, TASK_PRIORITIES, TASK_STATUSES } from "@/tasks/domain";
import type { Task, TaskListResult, TaskPatch } from "@/tasks/domain";
import { useInstantTask } from "../hooks/data/useInstantTask";
import { findActiveTaskElement, useTaskSharedSource } from "../hooks/useTaskSharedSource";
import { useInstantTaskLabels } from "../hooks/data/useInstantTaskLabels";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";
import { TaskKindIcon } from "../atoms/TaskKindIcon";
import { AssigneePicker } from "../molecules/AssigneePicker";
import { LabelPicker } from "../molecules/LabelPicker";
import { TaskLabelChips } from "../molecules/TaskLabelChips";
import { TaskEntityPicker } from "../molecules/TaskEntityPicker";
import { BlockedReasonDialog } from "../molecules/BlockedReasonDialog";
import { TaskRichTextEditor } from "../molecules/TaskRichTextEditor";
import { TaskDatePicker } from "../molecules/TaskDatePicker";
import { SubtaskList } from "./SubtaskList";
import { TaskDetailDialogSurface } from "./TaskDetailDialogSurface";
import { TaskTimeline } from "./TaskTimeline";
import { TaskWorkSection } from "./TaskWorkSection";
import { findTaskSummaryFromCache } from "../data/taskSummaryFromCache";
import {
  TASK_KIND_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  humanizeEntityStatus,
} from "../atoms/taskVisualTokens";
import { classifyAttachmentsChange } from "./taskAttachmentsDiff";
import { isTaskConflictError } from "./taskConflict";
import { TASK_ENTITY_KIND_LABELS, taskEntityFallbackLabel } from "../atoms/taskEntityTokens";
import { ScheduleMeetingDialog } from "@/features/google-calendar/presentation/ScheduleMeetingDialog";
import { useHasPermission } from "@/shared/auth/useHasPermission";

function descriptionPreview(value: Record<string, unknown> | undefined): string {
  const parts: string[] = [];
  const walk = (entry: unknown) => {
    if (typeof entry === "string") parts.push(entry);
    else if (Array.isArray(entry)) entry.forEach(walk);
    else if (entry && typeof entry === "object") Object.values(entry).forEach(walk);
  };
  walk(value);
  return parts.join(" ").replace(/\s+/g, " ").trim() || "Empty";
}

const taskDetailSectionVariants: Variants = {
  hidden: { opacity: 0, y: 5 },
  shared: { opacity: 1, y: 0 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      opacity: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
      y: { type: "spring", stiffness: 220, damping: 25, mass: 0.7 },
    },
  },
  reduced: { opacity: 1, y: 0 },
};

export function TaskDetailDialog({
  taskId,
  onClose,
  onOpenTask,
  pageMode = false,
}: {
  taskId: number | null;
  onClose: () => void;
  /** Lets the Subtasks tab open a child task in this same dialog. */
  onOpenTask: (id: number) => void;
  pageMode?: boolean;
}) {
  const {
    data: task,
    showSkeleton,
    isFetching: isTaskFetching,
    error: taskLoadError,
    refetch: refetchTask,
  } = useInstantTask(taskId);
  const shouldReduceMotion = usePrefersReducedMotion();
  const sharedSource = useTaskSharedSource(taskId);
  const [readyTaskId, setReadyTaskId] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const openingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOpening = !pageMode && !shouldReduceMotion && taskId !== readyTaskId;

  useEffect(() => {
    if (isClosing) return;
    if (taskId === null) {
      setReadyTaskId(null);
      return;
    }
    if (pageMode || shouldReduceMotion) {
      setReadyTaskId(taskId);
      return;
    }
    // Paint the known summary first; mount editors and pickers after the surface settles.
    openingTimer.current = setTimeout(() => {
      openingTimer.current = null;
      setReadyTaskId(taskId);
    }, TASK_CARD_SURFACE_DURATION_MS);
    return () => {
      if (openingTimer.current) clearTimeout(openingTimer.current);
      openingTimer.current = null;
    };
  }, [taskId, pageMode, shouldReduceMotion, isClosing]);
  const [forceNormalExit, setForceNormalExit] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusReturnTaskId = useRef<number | null>(taskId);
  const focusReturnLayoutId = useRef<string | undefined>(undefined);
  const previousTaskId = useRef(taskId);
  const { labels: allLabels } = useInstantTaskLabels();
  const queryClient = useQueryClient();
  const summaryPreview = useMemo(
    () => findTaskSummaryFromCache(queryClient, taskId),
    [queryClient, taskId],
  );
  const tasksApp = useTasksApp();
  const {
    updateMutation,
    moveMutation,
    setAssigneeMutation,
    setLabelsMutation,
    setEntityMutation,
    addAttachmentsMutation,
    removeAttachmentMutation,
    reorderAttachmentsMutation,
    archiveMutation,
    addWatcherMutation,
    removeWatcherMutation,
  } = useTaskMutations();
  const { user } = useCurrentUser();
  const canScheduleMeetings = useHasPermission("tasks:write");

  const [pendingBlock, setPendingBlock] = useState(false);
  const [cancelReasonOpen, setCancelReasonOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const focusStatusAfterCancel = useRef(false);
  const cancelTaskTriggerRef = useRef<HTMLButtonElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [conflictPatch, setConflictPatch] = useState<TaskPatch | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [scheduleMeetingOpen, setScheduleMeetingOpen] = useState(false);

  useEffect(() => {
    if (!task) return;
    const handler = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        document.querySelector<HTMLButtonElement>("[data-task-comment-submit]")?.click();
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable) return;
      if (target?.closest('[role="alertdialog"], [role="menu"], [role="listbox"], [role="combobox"]')) return;
      const activeDialog = target?.closest<HTMLElement>('[role="dialog"]');
      if (activeDialog && activeDialog.dataset.taskDetailDialog !== "true") return;
      if (event.key === "?") { event.preventDefault(); setShortcutsOpen(true); }
      if (event.key === "e") { event.preventDefault(); document.querySelector<HTMLTextAreaElement>("[data-task-title]")?.focus(); }
      if (event.key === "a") { event.preventDefault(); document.querySelector<HTMLButtonElement>("[data-task-assignee]")?.click(); }
      if (event.key === "d") { event.preventDefault(); document.querySelector<HTMLButtonElement>("[data-task=due]")?.click(); }
      // Radix Dialog owns Escape so nested pickers/menus close before the task.
      if (event.key === "j" || event.key === "k") {
        event.preventDefault();
        const moveToSibling = async () => {
          const ids = new Set<number>();
          for (const [, value] of queryClient.getQueriesData({ queryKey: tasksKeys.lists() })) {
            const data = value as { items?: Task[]; pages?: TaskListResult[] } | undefined;
            const pages = data?.pages ?? (data?.items ? [data as TaskListResult] : []);
            for (const page of pages) for (const item of page.items ?? []) ids.add(item.id);
          }
          let ordered = [...ids];
          if (ordered.length < 2) {
            try {
              const result = await tasksApp.repos.task.list({ limit: 100, sort: "updatedAt", direction: "desc" });
              ordered = result.items.map((item) => item.id);
            } catch {
              return;
            }
          }
          const index = task ? ordered.indexOf(task.id) : -1;
          const next = index + (event.key === "j" ? 1 : -1);
          if (ordered[next] != null) onOpenTask(ordered[next]);
        };
        void moveToSibling();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, onOpenTask, queryClient, task, tasksApp]);

  // The title field tracks its own dirty state, keyed off the task's id — so a
  // mutation that invalidates the whole detail query (any field, on any tab) never
  // stomps text still being typed. See useDraftField. The description editor
  // (TaskRichTextEditor) doesn't need this: it's uncontrolled and mounted once per
  // task id (key={task.id} below), so there's no re-sync path for a refetch to
  // clobber in the first place — same reasoning notes' own NoteEditor documents.
  const recordId = task?.id ?? -1;
  const titleField = useDraftField(recordId, task?.title ?? "");
  const title = titleField.value;

  const open = taskId !== null;
  useLayoutEffect(() => {
    if (taskId !== null) focusReturnLayoutId.current = sharedSource?.layoutId;
  }, [taskId, sharedSource?.layoutId]);
  const sharedTitleLayoutId =
    (pageMode || sharedSource?.kind === "title") &&
    !shouldReduceMotion &&
    !taskLoadError &&
    (task !== undefined || summaryPreview !== null)
      ? sharedSource?.layoutId ?? `maros-task-title-${taskId}`
      : undefined;
  const hasSharedExitTarget = Boolean(
    !pageMode &&
      !shouldReduceMotion &&
      (sharedSource?.kind === "card" || sharedTitleLayoutId),
  );

  useLayoutEffect(() => {
    if (previousTaskId.current === null && taskId !== null) {
      focusReturnTaskId.current = taskId;
    }
    previousTaskId.current = taskId;
  }, [taskId]);

  useEffect(() => {
    setCancelReasonOpen(false);
    if (taskId !== null) {
      setForceNormalExit(false);
      setIsClosing(false);
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    } else {
      setIsClosing(false);
    }
  }, [taskId]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const handleClose = () => {
    if (openingTimer.current) clearTimeout(openingTimer.current);
    openingTimer.current = null;
    const currentSharedExitTarget = taskId === null
      ? null
      : sharedSource?.kind === "card"
        ? findActiveTaskElement<HTMLElement>(`[data-task-card-id="${taskId}"]`)
        : sharedTitleLayoutId
          ? findActiveTaskElement<HTMLElement>(sharedSource?.layoutId
            ? `[data-task-title-layout-id="${CSS.escape(sharedSource.layoutId)}"]`
            : `[data-task-title-id="${taskId}"]`)
          : null;
    if (pageMode || shouldReduceMotion || currentSharedExitTarget) {
      onClose();
      return;
    }
    if (closeTimer.current) return;
    setForceNormalExit(true);
    setIsClosing(true);
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      onClose();
    }, 180);
  };

  /**
   * Every field edit made from this dialog (a human deliberately changing one thing)
   * carries `expectedUpdatedAt`, so a save that lands after someone else's concurrent
   * edit fails loud instead of silently overwriting it — see TaskPatch. The board
   * drag and "Mine"'s one-tap status button deliberately skip this (moveTaskAction):
   * there, the last move legitimately wins.
   *
   * Returns whether the save actually landed, so callers with a local draft (title,
   * description) know whether to keep the user's typed text or let it be replaced —
   * on a conflict, the just-invalidated query brings back the true current value,
   * which is what should win over a save that's now known to be based on stale data.
   */
  const saveTaskPatch = async (patch: TaskPatch): Promise<boolean> => {
    if (!task) return false;
    setSaveStatus("saving");
    try {
      await updateMutation.mutateAsync({
        id: task.id,
        patch: { ...patch, expectedUpdatedAt: task.updatedAt },
      });
      setSaveStatus("saved");
      window.setTimeout(() => setSaveStatus("idle"), 1600);
      return true;
    } catch (error) {
      if (isTaskConflictError(error)) {
        setSaveStatus("idle");
        setConflictPatch(patch);
        void queryClient.invalidateQueries({ queryKey: tasksKeys.detail(task.id) });
        return false;
      }
      setSaveStatus("idle");
      return false;
    }
  };

  const saveTitle = async () => {
    if (!task || title.trim() === task.title) {
      titleField.commit();
      return;
    }
    const landed = await saveTaskPatch({ title: title.trim() || "Untitled task" });
    if (landed) titleField.commit();
  };

  const changeStatus = (status: string) => {
    if (!task) return;
    if (status === "blocked") {
      setPendingBlock(true);
      return;
    }
    if (status === "cancelled") {
      setCancelReason(task.cancelledReason ?? "");
      setCancelReasonOpen(true);
      return;
    }
    moveMutation.mutate({ id: task.id, input: { status: status as (typeof TASK_STATUSES)[number] } });
  };

  const toggleLabel = (labelId: number) => {
    if (!task) return;
    const current = new Set(task.labels.map((l) => l.id));
    if (current.has(labelId)) current.delete(labelId);
    else current.add(labelId);
    setLabelsMutation.mutate({ id: task.id, labelIds: Array.from(current) });
  };

  return (
    <>
      <Dialog open={open && !isClosing} onOpenChange={(next) => !next && handleClose()}>
        <TaskDetailDialogSurface
          pageMode={pageMode}
          shouldReduceMotion={shouldReduceMotion ?? false}
          sharedLayoutId={
            sharedSource?.kind === "card" && !pageMode && !shouldReduceMotion && !forceNormalExit
              ? `maros-task-card-${taskId}`
              : undefined
          }
          hasSharedExitTarget={hasSharedExitTarget && !forceNormalExit}
          onCloseAutoFocus={(event) => {
            const returnTaskId = focusReturnTaskId.current;
            if (returnTaskId === null) return;

            const card = findActiveTaskElement<HTMLElement>(`[data-task-card-id="${returnTaskId}"]`);
            const cardTrigger = card?.querySelector<HTMLElement>("button[data-task-open]");
            const titleTrigger = findActiveTaskElement<HTMLElement>(
              focusReturnLayoutId.current
                ? `[data-task-title-layout-id="${CSS.escape(focusReturnLayoutId.current)}"]`
                : `[data-task-title-id="${returnTaskId}"]`,
            )
              ?.closest<HTMLElement>("button");
            const trigger = cardTrigger ?? titleTrigger;
            const appMain = document.querySelector<HTMLElement>("[data-app-route-scroll]");
            const focusTarget = trigger ?? appMain;
            if (!focusTarget || focusTarget.closest("[inert]")) return;

            event.preventDefault();
            focusTarget.focus({ preventScroll: true });
          }}
        >
          {taskLoadError && !task ? (
            <motion.div variants={taskDetailSectionVariants} role="alert" className="space-y-4 pt-8">
              <DialogHeader className="text-left">
                <DialogDescription className="font-mono text-xs">T-{taskId}</DialogDescription>
                <DialogTitle>Could not load task details</DialogTitle>
                {summaryPreview ? (
                  <DialogDescription>{summaryPreview.title}</DialogDescription>
                ) : null}
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Check your connection and try loading this task again.
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={isTaskFetching}
                onClick={() => void refetchTask()}
              >
                {isTaskFetching ? "Retrying…" : "Retry"}
              </Button>
            </motion.div>
          ) : showSkeleton || !task || isOpening ? (
            <>
              <DialogHeader className={cn("text-left", !summaryPreview && "sr-only")}>
                <DialogDescription className="font-mono text-xs">
                  T-{summaryPreview?.id ?? taskId}
                </DialogDescription>
                <DialogTitle>
                  {summaryPreview && sharedTitleLayoutId ? (
                    <SharedEntityName layoutId={sharedTitleLayoutId} transitionRole="detail" clipOverlay={pageMode}>
                      {summaryPreview.title}
                    </SharedEntityName>
                  ) : summaryPreview?.title ?? "Loading task details"}
                </DialogTitle>
                <DialogDescription>
                  {task ? "Opening task…" : summaryPreview ? "Loading the rest of this task…" : "Task details are loading."}
                </DialogDescription>
              </DialogHeader>
              <motion.div variants={taskDetailSectionVariants} className="space-y-4 pt-8">
                {summaryPreview ? (
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground" aria-label="Task summary">
                    <span className="rounded-full border border-line bg-elev-2 px-2.5 py-1">
                      {TASK_STATUS_LABELS[summaryPreview.status]}
                    </span>
                    <span className="rounded-full border border-line bg-elev-2 px-2.5 py-1">
                      {TASK_PRIORITY_LABELS[summaryPreview.priority]}
                    </span>
                    <span className="rounded-full border border-line bg-elev-2 px-2.5 py-1">
                      {summaryPreview.dueDate ?? "No due date"}
                    </span>
                  </div>
                ) : null}
                <Skeleton className="h-8 w-3/4" aria-hidden="true" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
              </motion.div>
            </>
          ) : (
            <>
              <motion.div variants={taskDetailSectionVariants}>
              <DialogHeader className="gap-1 text-left">
                <DialogDescription className="font-mono text-xs">
                  T-{task.id}
                  {task.parentId ? (
                    <button
                      type="button"
                      onClick={() => onOpenTask(task.parentId as number)}
                      className="ml-2 underline decoration-dotted hover:text-foreground"
                    >
                      subtask of T-{task.parentId}
                    </button>
                  ) : null}
                </DialogDescription>
                <DialogTitle className="sr-only">{title || "Task details"}</DialogTitle>
                <div className="flex min-w-0 items-start gap-3">
                  <SharedEntityName
                    as="div"
                    transitionRole="detail"
                    clipOverlay={pageMode}
                    layoutId={sharedTitleLayoutId}
                    transition={sharedEntityNameTransition}
                    className="min-w-0 flex-1"
                  >
                    <Textarea
                      data-task-title
                      aria-label="Task title"
                      rows={1}
                      value={title}
                      onChange={(e) => titleField.setValue(e.target.value.replace(/[\r\n]+/g, " "))}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.metaKey && !event.ctrlKey && !event.nativeEvent.isComposing) {
                          event.preventDefault();
                          event.currentTarget.blur();
                        }
                      }}
                      onBlur={saveTitle}
                      className="min-h-9 w-full min-w-0 resize-none border-none bg-transparent px-0 py-1 font-display text-xl font-semibold leading-snug shadow-none [field-sizing:content] focus-visible:ring-1 md:text-xl"
                    />
                  </SharedEntityName>
                  {canScheduleMeetings ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      aria-label="Schedule Google Meet"
                      title="Schedule Google Meet"
                      onClick={() => setScheduleMeetingOpen(true)}
                    >
                      <CalendarPlus className="size-4" />
                    </Button>
                  ) : null}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="More task actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setConfirmDelete(true)}>
                        <Archive className="mr-2 h-3.5 w-3.5" /> Archive task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </DialogHeader>
              </motion.div>

              {task.entity ? (
                <motion.div variants={taskDetailSectionVariants} className="mt-4 rounded-lg border border-line bg-elev-1 px-3 py-2">
                  <p className="font-display text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Job context</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <Link href={task.entity.href} className="min-w-0 break-words font-medium hover:underline">{task.entity.label}</Link>
                    {task.entity.leadNumber ? <span className="font-mono text-xs text-muted-foreground">{task.entity.leadNumber}</span> : null}
                    {task.entity.status ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{humanizeEntityStatus(task.entity.status)}</span> : null}
                    {task.entity.address ? <span className="text-xs text-muted-foreground">{task.entity.address}</span> : null}
                    {task.entity.addressLink ? <a href={task.entity.addressLink} target="_blank" rel="noopener noreferrer" className="text-xs underline decoration-dotted">Map</a> : null}
                  </div>
                </motion.div>
              ) : null}

              <motion.div variants={taskDetailSectionVariants} className={cn("mt-5 min-w-0", pageMode && "@min-[56rem]/task-detail:grid @min-[56rem]/task-detail:grid-cols-[minmax(0,1fr)_18rem] @min-[56rem]/task-detail:items-start @min-[56rem]/task-detail:gap-6")}>
              <Tabs defaultValue="details" className="@container/task-form min-w-0">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="subtasks">
                    Subtasks{task.subtasks.length > 0 ? ` (${task.subtasks.length})` : ""}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="min-w-0 space-y-5">
                  <div className="grid grid-cols-1 gap-4 @min-[28rem]/task-form:grid-cols-2 [&>div]:min-w-0">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <Select value={task.status} onValueChange={changeStatus}>
                        <SelectTrigger data-task-status-trigger="true" className="h-8 rounded-full border-0 bg-elev-4 px-3" style={{ color: TASK_STATUS_COLORS[task.status] }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_STATUSES.filter((status) => status !== "cancelled").map((status) => (
                            <SelectItem key={status} value={status}>
                              {TASK_STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {task.status !== "cancelled" ? <Button ref={cancelTaskTriggerRef} type="button" variant="ghost" size="sm" className="mt-1 h-7 px-2 text-xs text-destructive hover:text-destructive" onClick={() => changeStatus("cancelled")}>Cancel task…</Button> : null}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Priority</Label>
                      <Select
                        value={task.priority}
                        onValueChange={(priority) =>
                          void saveTaskPatch({ priority: priority as (typeof TASK_PRIORITIES)[number] })
                        }
                      >
                        <SelectTrigger className="h-8 rounded-full border-0 bg-elev-4 px-3" style={{ color: TASK_PRIORITY_COLORS[task.priority] }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_PRIORITIES.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {TASK_PRIORITY_LABELS[priority]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Kind</Label>
                      <Select
                        value={task.kind}
                        onValueChange={(kind) =>
                          void saveTaskPatch({ kind: kind as (typeof TASK_KINDS)[number] })
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_KINDS.map((kind) => (
                            <SelectItem key={kind} value={kind}>
                              <span className="inline-flex items-center gap-1.5">
                                <TaskKindIcon kind={kind} />
                                {TASK_KIND_LABELS[kind]}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Assignee</Label>
                      <AssigneePicker
                        onSelect={(user) =>
                          setAssigneeMutation.mutate({ id: task.id, userId: user?.id ?? null })
                        }
                        trigger={
                          <button
                            type="button"
                            data-task-assignee
                            className="flex h-9 w-full items-center gap-2 rounded-md border border-line-strong bg-transparent px-3 text-sm hover:bg-elev-3"
                          >
                            <AssigneeAvatar person={task.assignee} />
                            <span className="truncate">
                              {task.assignee?.name ?? task.assignee?.email ?? "Unassigned"}
                            </span>
                          </button>
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Start date</Label>
                      <TaskDatePicker
                        value={task.startDate}
                        onChange={(startDate) => void saveTaskPatch({ startDate })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Due date</Label>
                      <TaskDatePicker dataTask="due" value={task.dueDate} onChange={(dueDate) => void saveTaskPatch({ dueDate })} />
                    </div>
                  </div>

                  {task.status === "blocked" ? (
                    <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">Blocked</p>
                        <p className="text-xs">{task.blockedReason}</p>
                      </div>
                    </div>
                  ) : null}

                  {task.status === "cancelled" && task.cancelledReason ? (
                    <div className="rounded-md bg-muted px-3 py-2 text-sm">
                      <p className="font-medium">Cancelled</p>
                      <p className="text-xs text-muted-foreground">{task.cancelledReason}</p>
                    </div>
                  ) : null}

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Labels</Label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <TaskLabelChips labels={task.labels} onRemove={toggleLabel} />
                      <LabelPicker
                        labels={allLabels}
                        selectedIds={new Set(task.labels.map((l) => l.id))}
                        onToggle={toggleLabel}
                        trigger={
                          <Button type="button" variant="outline" size="sm" className="h-6 text-xs">
                            + Label
                          </Button>
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Linked record</Label>
                    {task.entityKind && task.entityId ? (
                      <div className="flex items-start gap-2 rounded-md border border-line px-3 py-2 text-sm">
                        <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          {task.entity ? (
                            <Link
                              href={task.entity.href}
                              className="block truncate font-medium text-foreground hover:underline"
                            >
                              {task.entity.label}
                            </Link>
                          ) : (
                            // entityKind/entityId still point at it, but nothing
                            // resolved server-side — the record was deleted.
                            <span className="block truncate text-muted-foreground">
                              {taskEntityFallbackLabel(task.entityKind, task.entityId)} (not found)
                            </span>
                          )}
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                            <span>{TASK_ENTITY_KIND_LABELS[task.entityKind]}</span>
                            {task.entity?.leadNumber ? <span>{task.entity.leadNumber}</span> : null}
                            {task.entity?.status ? (
                              <span>{humanizeEntityStatus(task.entity.status)}</span>
                            ) : null}
                          </div>
                          {task.entity?.address ? (
                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 shrink-0" />
                              {task.entity.addressLink ? (
                                <a
                                  href={task.entity.addressLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="truncate underline decoration-dotted hover:text-foreground"
                                >
                                  {task.entity.address}
                                </a>
                              ) : (
                                <span className="truncate">{task.entity.address}</span>
                              )}
                            </div>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => setEntityMutation.mutate({ id: task.id, link: null })}
                        >
                          Unlink
                        </button>
                      </div>
                    ) : (
                      <TaskEntityPicker
                        onSelect={(link) => setEntityMutation.mutate({ id: task.id, link })}
                        trigger={
                          <Button type="button" variant="outline" size="sm" className="gap-1.5">
                            <Link2 className="h-3.5 w-3.5" />
                            Link to a record
                          </Button>
                        }
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <TaskRichTextEditor
                      key={`${task.id}-${task.updatedAt}`}
                      content={task.description}
                      onSave={(doc) => void saveTaskPatch({ description: doc })}
                    />
                  </div>

                  <EntityAttachmentsSection
                    entityKind="task"
                    entityId={task.id}
                    attachments={task.attachments}
                    onAttachmentsChange={async (attachments) => {
                      // EntityAttachmentsSection always hands back its idea of the
                      // complete list — routed here to the additive endpoint that
                      // matches what actually changed, so a concurrent upload from
                      // someone else on the same task never gets overwritten. See
                      // taskAttachmentsDiff and TaskPatch.
                      const change = classifyAttachmentsChange(task.attachments, attachments);
                      if (change.op === "add") {
                        await addAttachmentsMutation.mutateAsync({ id: task.id, keys: change.keys });
                      } else if (change.op === "remove") {
                        await removeAttachmentMutation.mutateAsync({ id: task.id, key: change.key });
                      } else if (change.op === "reorder") {
                        await reorderAttachmentsMutation.mutateAsync({ id: task.id, keys: change.keys });
                      }
                    }}
                  />
                  {task.subtasks.length > 0 && task.status !== "done" && task.status !== "cancelled" && task.subtasks.every((subtask) => subtask.status === "done") ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary bg-primary/5 px-3 py-2">
                      <p className="text-xs text-foreground">All subtasks are complete. Close the parent task?</p>
                      <Button type="button" size="sm" className="h-8" onClick={() => moveMutation.mutate({ id: task.id, input: { status: "done" } })}>Mark parent done</Button>
                    </div>
                  ) : null}
                  <TaskWorkSection task={task} onSavePatch={saveTaskPatch} />
                  {/* Read-only on purpose: notes are written in the notes workspace, and a
                      task is referenced from there with @. This is the other end of that
                      link, so the meeting note that produced the task is one click away. */}
                  <NoteMentionsSection entityKind="task" entityId={task.id} />
                  <TaskTimeline taskId={task.id} activity={task.activity} comments={task.comments} />
                </TabsContent>

                <TabsContent value="subtasks">
                  <SubtaskList
                    parentId={task.id}
                    subtasks={task.subtasks}
                    onOpenSubtask={onOpenTask}
                  />
                </TabsContent>

              </Tabs>
              {pageMode ? (
                <aside aria-label="Task facts" className="mt-6 min-w-0 space-y-3 rounded-xl border border-line bg-elev-1 p-4 text-xs @min-[56rem]/task-detail:mt-0">
                  <p className="font-display font-semibold text-foreground">Task facts</p>
                  <dl className="space-y-2 text-muted-foreground">
                    <div className="flex justify-between gap-3"><dt>Status</dt><dd className="font-medium text-foreground">{TASK_STATUS_LABELS[task.status]}</dd></div>
                    <div className="flex justify-between gap-3"><dt>Priority</dt><dd className="font-medium text-foreground">{TASK_PRIORITY_LABELS[task.priority]}</dd></div>
                    <div className="flex justify-between gap-3"><dt>Comments</dt><dd className="font-mono font-medium tabular-nums text-foreground">{task.comments.length}</dd></div>
                    <div className="flex justify-between gap-3"><dt>Watchers</dt><dd className="font-mono font-medium tabular-nums text-foreground">{task.watcherIds?.length ?? 0}</dd></div>
                  </dl>
                </aside>
              ) : null}
              </motion.div>

              <motion.div variants={taskDetailSectionVariants} className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Reporter</span>
                  <AssigneePicker
                    onSelect={(user) => void saveTaskPatch({ reporterId: user?.id ?? null })}
                    trigger={<button type="button" className="inline-flex items-center gap-1 rounded-md border border-line-strong px-2 py-1 text-xs hover:bg-elev-3"><AssigneeAvatar person={task.reporter} /><span>{task.reporter?.name ?? task.reporter?.email ?? "Unassigned"}</span></button>}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground">
                  <span role="status" aria-live="polite" className="mr-2 font-medium text-fg-dim">
                    {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : ""}
                  </span>
                  Created {new Date(task.createdAt).toLocaleDateString()} · Updated {new Date(task.updatedAt).toLocaleString()}
                </div>
                {user ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      const watching = task.watcherIds?.includes(user.id) ?? false;
                      if (watching) removeWatcherMutation.mutate({ id: task.id, userId: user.id });
                      else addWatcherMutation.mutate({ id: task.id, userId: user.id });
                    }}
                  >
                    {task.watcherIds?.includes(user.id) ? "Watching" : "Watch task"}
                    {task.watcherIds && task.watcherIds.length > 0 ? ` · ${task.watcherIds.length}` : ""}
                  </Button>
                ) : null}
              </motion.div>
            </>
          )}
        </TaskDetailDialogSurface>
      </Dialog>

      <Dialog open={cancelReasonOpen} onOpenChange={setCancelReasonOpen}>
        <DialogContent
          className="sm:max-w-md"
          onCloseAutoFocus={(event) => {
            if (focusStatusAfterCancel.current) {
              focusStatusAfterCancel.current = false;
              const statusTrigger = document.querySelector<HTMLButtonElement>("[data-task-status-trigger]");
              if (!statusTrigger || statusTrigger.closest("[inert]")) return;
              event.preventDefault();
              statusTrigger.focus({ preventScroll: true });
              return;
            }

            const cancelTaskTrigger = cancelTaskTriggerRef.current;
            if (!cancelTaskTrigger?.isConnected || cancelTaskTrigger.closest("[inert]")) return;
            event.preventDefault();
            cancelTaskTrigger.focus({ preventScroll: true });
          }}
        >
          <DialogHeader>
            <DialogTitle>Cancel task</DialogTitle>
            <DialogDescription>
              Add a reason so the team can understand why this task was cancelled.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="task-cancellation-reason">Cancellation reason</Label>
            <Textarea
              id="task-cancellation-reason"
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              aria-describedby="task-cancellation-reason-help"
              maxLength={500}
              rows={3}
              autoFocus
            />
            <p id="task-cancellation-reason-help" className="text-xs text-muted-foreground">
              Required · {cancelReason.length}/500 characters
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={moveMutation.isPending}
              onClick={() => setCancelReasonOpen(false)}
            >
              Keep task
            </Button>
            <Button
              type="button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!cancelReason.trim() || moveMutation.isPending}
              onClick={() => {
                if (!task || !cancelReason.trim()) return;
                moveMutation.mutate(
                  {
                    id: task.id,
                    input: { status: "cancelled", cancelledReason: cancelReason.trim() },
                  },
                  {
                    onSuccess: () => {
                      focusStatusAfterCancel.current = true;
                      setCancelReasonOpen(false);
                    },
                  },
                );
              }}
            >
              {moveMutation.isPending ? "Cancelling…" : "Cancel task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {task ? (
        <ScheduleMeetingDialog
          open={scheduleMeetingOpen}
          onOpenChange={setScheduleMeetingOpen}
          entityKind="task"
          entityId={task.id}
          entityLabel={task.title}
        />
      ) : null}

      <BlockedReasonDialog
        open={pendingBlock}
        initialReason={task?.blockedReason}
        onCancel={() => setPendingBlock(false)}
        onConfirm={(reason) => {
          if (!task) return;
          moveMutation.mutate({ id: task.id, input: { status: "blocked", blockedReason: reason } });
          setPendingBlock(false);
        }}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this task?</AlertDialogTitle>
            <AlertDialogDescription>
              {task?.title ? `"${task.title}" and any of its subtasks will be hidden from active views. ` : ""}
              You can restore it later from the archive endpoint.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!task) return;
                archiveMutation.mutate(task.id, { onSuccess: onClose });
                setConfirmDelete(false);
              }}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={conflictPatch !== null} onOpenChange={(open) => !open && setConflictPatch(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>This task changed elsewhere</AlertDialogTitle>
            <AlertDialogDescription>
              Someone saved a newer version while you were editing. Choose which version to keep.
              {task ? (
                <span className="mt-2 block text-xs">
                  <span className="block">Server: “{task.title}” · {task.priority} · due {task.dueDate ?? "none"} · updated {new Date(task.updatedAt).toLocaleString()}.</span>
                  {task.activity[0]?.actor ? ` Last actor: ${task.activity[0].actor.name ?? task.activity[0].actor.email}.` : ""}
                  <span className="mt-1 block">Your version: {conflictPatch?.title !== undefined ? `“${conflictPatch.title}”` : "same title"} · {conflictPatch?.priority ?? task.priority} · due {conflictPatch?.dueDate ?? task.dueDate ?? "none"}.</span>
                  <span className="mt-1 block">Server description: “{descriptionPreview(task.description)}”</span>
                  <span className="block">Your description: “{conflictPatch?.description ? descriptionPreview(conflictPatch.description) : descriptionPreview(task.description)}”</span>
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                titleField.setValue(task?.title ?? "");
                setConflictPatch(null);
              }}
            >
              Use newer version
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!task || !conflictPatch) return;
                await updateMutation.mutateAsync({ id: task.id, patch: { ...conflictPatch, expectedUpdatedAt: task.updatedAt } });
                if (conflictPatch.title !== undefined) titleField.commit();
                setConflictPatch(null);
              }}
            >
              Keep my changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Task shortcuts</AlertDialogTitle><AlertDialogDescription>j/k next or previous task · e edit title · a assign · d due date · ⌘/Ctrl+Enter comment · Esc close · ? show shortcuts</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogAction>Done</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** Backward-compatible export for consumers outside the tasks feature. */
export const TaskDetailSheet = TaskDetailDialog;

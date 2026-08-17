"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Archive, AlertTriangle, Link2, MapPin, MoreHorizontal, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
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
import { useCurrentUser } from "@/shared/auth/CurrentUserProvider";
import { useTasksApp } from "@/di";
import { useDraftField } from "@/shared/presentation/hooks/useDraftField";
import { tasksKeys } from "@/tasks/application";
import { TASK_KINDS, TASK_PRIORITIES, TASK_STATUSES } from "@/tasks/domain";
import type { Task, TaskListResult, TaskPatch } from "@/tasks/domain";
import { useInstantTask } from "../hooks/data/useInstantTask";
import { useInstantTaskLabels } from "../hooks/data/useInstantTaskLabels";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";
import { TaskKindIcon } from "../atoms/TaskKindIcon";
import { AssigneePicker } from "../molecules/AssigneePicker";
import { LabelPicker } from "../molecules/LabelPicker";
import { TaskEntityPicker } from "../molecules/TaskEntityPicker";
import { BlockedReasonDialog } from "../molecules/BlockedReasonDialog";
import { TaskRichTextEditor } from "../molecules/TaskRichTextEditor";
import { TaskDatePicker } from "../molecules/TaskDatePicker";
import { SubtaskList } from "./SubtaskList";
import { TaskTimeline } from "./TaskTimeline";
import { TaskWorkSection } from "./TaskWorkSection";
import {
  TASK_KIND_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  humanizeEntityStatus,
  taskLabelColor,
} from "../atoms/taskVisualTokens";
import { classifyAttachmentsChange } from "./taskAttachmentsDiff";
import { isTaskConflictError } from "./taskConflict";
import { TASK_ENTITY_KIND_LABELS, taskEntityFallbackLabel } from "../atoms/taskEntityTokens";

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

export function TaskDetailSheet({
  taskId,
  onClose,
  onOpenTask,
  pageMode = false,
}: {
  taskId: number | null;
  onClose: () => void;
  /** Lets the Subtasks tab open a child task in this same sheet. */
  onOpenTask: (id: number) => void;
  pageMode?: boolean;
}) {
  const { data: task, showSkeleton } = useInstantTask(taskId);
  const { labels: allLabels } = useInstantTaskLabels();
  const queryClient = useQueryClient();
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

  const [pendingBlock, setPendingBlock] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [conflictPatch, setConflictPatch] = useState<TaskPatch | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    if (!task) return;
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        document.querySelector<HTMLButtonElement>("[data-task-comment-submit]")?.click();
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable) return;
      if (event.key === "?") { event.preventDefault(); setShortcutsOpen(true); }
      if (event.key === "e") { event.preventDefault(); document.querySelector<HTMLInputElement>("[data-task-title]")?.focus(); }
      if (event.key === "a") { event.preventDefault(); document.querySelector<HTMLButtonElement>("[data-task-assignee]")?.click(); }
      if (event.key === "d") { event.preventDefault(); document.querySelector<HTMLButtonElement>("[data-task=due]")?.click(); }
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
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

  /**
   * Every field edit made from this sheet (a human deliberately changing one thing)
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
      const reason = window.prompt("Why is this task being cancelled?", task.cancelledReason ?? "")?.trim();
      if (!reason) return;
      moveMutation.mutate({ id: task.id, input: { status: "cancelled", cancelledReason: reason } });
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
      <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
        <SheetContent pageMode={pageMode} side="right" className={cn("w-full overflow-y-auto p-6", pageMode ? "max-w-none" : "sm:max-w-3xl")}>
          {showSkeleton || !task ? (
            <div className="space-y-4 pt-8">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <>
              <SheetHeader className="gap-1">
                <SheetDescription className="font-mono text-xs">
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
                </SheetDescription>
                <SheetTitle asChild>
                  <Input
                    data-task-title
                    value={title}
                    onChange={(e) => titleField.setValue(e.target.value)}
                    onBlur={saveTitle}
                    className="border-none px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
                  />
                </SheetTitle>
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="-mt-8 h-8 w-8" aria-label="More task actions">
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
              </SheetHeader>

              {task.entity ? (
                <div className="mt-4 rounded-lg border border-border/60 bg-card/60 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Job context</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <Link href={task.entity.href} className="font-medium hover:underline">{task.entity.label}</Link>
                    {task.entity.leadNumber ? <span className="font-mono text-xs text-muted-foreground">{task.entity.leadNumber}</span> : null}
                    {task.entity.status ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{humanizeEntityStatus(task.entity.status)}</span> : null}
                    {task.entity.address ? <span className="text-xs text-muted-foreground">{task.entity.address}</span> : null}
                    {task.entity.addressLink ? <a href={task.entity.addressLink} target="_blank" rel="noopener noreferrer" className="text-xs underline decoration-dotted">Map</a> : null}
                  </div>
                </div>
              ) : null}

              <div className={cn("mt-4", pageMode && "lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-6")}>
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="subtasks">
                    Subtasks{task.subtasks.length > 0 ? ` (${task.subtasks.length})` : ""}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <Select value={task.status} onValueChange={changeStatus}>
                        <SelectTrigger className="h-8 rounded-full border-0 bg-muted/40 px-3" style={{ color: TASK_STATUS_COLORS[task.status] }}>
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
                      {task.status !== "cancelled" ? <Button type="button" variant="ghost" size="sm" className="mt-1 h-7 px-2 text-xs text-destructive hover:text-destructive" onClick={() => changeStatus("cancelled")}>Cancel task…</Button> : null}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Priority</Label>
                      <Select
                        value={task.priority}
                        onValueChange={(priority) =>
                          void saveTaskPatch({ priority: priority as (typeof TASK_PRIORITIES)[number] })
                        }
                      >
                        <SelectTrigger className="h-8 rounded-full border-0 bg-muted/40 px-3" style={{ color: TASK_PRIORITY_COLORS[task.priority] }}>
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
                            className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm hover:bg-accent/40"
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
                      {task.labels.map((label) => (
                        <span
                          key={label.id}
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: `${taskLabelColor(label.color)}22`,
                            color: taskLabelColor(label.color),
                          }}
                        >
                          {label.name}
                          <button
                            type="button"
                            onClick={() => toggleLabel(label.id)}
                            aria-label={`Remove ${label.name}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
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
                      <div className="flex items-start gap-2 rounded-md border border-border/60 px-3 py-2 text-sm">
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
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
                      <p className="text-xs text-foreground">All subtasks are complete. Close the parent task?</p>
                      <Button type="button" size="sm" className="h-8" onClick={() => moveMutation.mutate({ id: task.id, input: { status: "done" } })}>Mark parent done</Button>
                    </div>
                  ) : null}
                  <TaskWorkSection task={task} onSavePatch={saveTaskPatch} />
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
                <aside className="mt-6 space-y-3 rounded-xl border border-border/60 bg-card/50 p-4 text-xs lg:mt-0">
                  <p className="font-semibold text-foreground">Task facts</p>
                  <dl className="space-y-2 text-muted-foreground">
                    <div className="flex justify-between gap-3"><dt>Status</dt><dd className="font-medium text-foreground">{TASK_STATUS_LABELS[task.status]}</dd></div>
                    <div className="flex justify-between gap-3"><dt>Priority</dt><dd className="font-medium text-foreground">{TASK_PRIORITY_LABELS[task.priority]}</dd></div>
                    <div className="flex justify-between gap-3"><dt>Comments</dt><dd className="font-medium text-foreground">{task.comments.length}</dd></div>
                    <div className="flex justify-between gap-3"><dt>Watchers</dt><dd className="font-medium text-foreground">{task.watcherIds?.length ?? 0}</dd></div>
                  </dl>
                </aside>
              ) : null}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Reporter</span>
                  <AssigneePicker
                    onSelect={(user) => void saveTaskPatch({ reporterId: user?.id ?? null })}
                    trigger={<button type="button" className="inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-1 text-xs hover:bg-accent/40"><AssigneeAvatar person={task.reporter} /><span>{task.reporter?.name ?? task.reporter?.email ?? "Unassigned"}</span></button>}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground">
                  <span role="status" aria-live="polite" className="mr-2 font-medium text-foreground/70">
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
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

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

"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Link2, MapPin, Trash2, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useDraftField } from "@/shared/presentation/hooks/useDraftField";
import { textToTipTapDoc, tiptapDocToText } from "@/shared/domain";
import { tasksKeys } from "@/tasks/application";
import { TASK_KINDS, TASK_PRIORITIES, TASK_STATUSES } from "@/tasks/domain";
import type { TaskPatch } from "@/tasks/domain";
import { useInstantTask } from "../hooks/data/useInstantTask";
import { useInstantTaskLabels } from "../hooks/data/useInstantTaskLabels";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";
import { TaskKindIcon } from "../atoms/TaskKindIcon";
import { AssigneePicker } from "../molecules/AssigneePicker";
import { LabelPicker } from "../molecules/LabelPicker";
import { TaskEntityPicker } from "../molecules/TaskEntityPicker";
import { BlockedReasonDialog } from "../molecules/BlockedReasonDialog";
import { SubtaskList } from "./SubtaskList";
import { TaskCommentList } from "./TaskCommentList";
import { TaskActivityFeed } from "./TaskActivityFeed";
import {
  TASK_KIND_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  humanizeEntityStatus,
  taskLabelColor,
} from "../atoms/taskVisualTokens";
import { classifyAttachmentsChange } from "./taskAttachmentsDiff";
import { isTaskConflictError } from "./taskConflict";

const ENTITY_KIND_LABEL: Record<string, string> = {
  lead: "Lead",
  project: "Project",
  contact: "Contact",
  company: "Company",
};

export function TaskDetailSheet({
  taskId,
  onClose,
  onOpenTask,
}: {
  taskId: number | null;
  onClose: () => void;
  /** Lets the Subtasks tab open a child task in this same sheet. */
  onOpenTask: (id: number) => void;
}) {
  const { data: task, showSkeleton } = useInstantTask(taskId);
  const { labels: allLabels } = useInstantTaskLabels();
  const queryClient = useQueryClient();
  const {
    updateMutation,
    moveMutation,
    setAssigneeMutation,
    setLabelsMutation,
    setEntityMutation,
    addAttachmentsMutation,
    removeAttachmentMutation,
    reorderAttachmentsMutation,
    deleteMutation,
  } = useTaskMutations();

  const [pendingBlock, setPendingBlock] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Each field tracks its own dirty state, keyed off the task's id — so a mutation
  // that invalidates the whole detail query (any field, on any tab) never stomps text
  // still being typed into a *different* field. See useDraftField.
  const recordId = task?.id ?? -1;
  const titleField = useDraftField(recordId, task?.title ?? "");
  const descriptionField = useDraftField(recordId, task ? tiptapDocToText(task.description) : "");
  const title = titleField.value;
  const description = descriptionField.value;

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
    try {
      await updateMutation.mutateAsync({
        id: task.id,
        patch: { ...patch, expectedUpdatedAt: task.updatedAt },
      });
      return true;
    } catch (error) {
      if (isTaskConflictError(error)) {
        void queryClient.invalidateQueries({ queryKey: tasksKeys.detail(task.id) });
        return true;
      }
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

  const saveDescription = async () => {
    if (!task) return;
    const landed = await saveTaskPatch({ description: textToTipTapDoc(description) });
    if (landed) descriptionField.commit();
  };

  const changeStatus = (status: string) => {
    if (!task) return;
    if (status === "blocked") {
      setPendingBlock(true);
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
        <SheetContent side="right" className="w-full overflow-y-auto p-6 sm:max-w-xl">
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
                    value={title}
                    onChange={(e) => titleField.setValue(e.target.value)}
                    onBlur={saveTitle}
                    className="border-none px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
                  />
                </SheetTitle>
              </SheetHeader>

              <Tabs defaultValue="details" className="mt-4">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="subtasks">
                    Subtasks{task.subtasks.length > 0 ? ` (${task.subtasks.length})` : ""}
                  </TabsTrigger>
                  <TabsTrigger value="comments">
                    Comments{task.comments.length > 0 ? ` (${task.comments.length})` : ""}
                  </TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <Select value={task.status} onValueChange={changeStatus}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {TASK_STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Priority</Label>
                      <Select
                        value={task.priority}
                        onValueChange={(priority) =>
                          void saveTaskPatch({ priority: priority as (typeof TASK_PRIORITIES)[number] })
                        }
                      >
                        <SelectTrigger className="h-9">
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
                      <Input
                        type="date"
                        value={task.startDate ?? ""}
                        onChange={(e) => void saveTaskPatch({ startDate: e.target.value || null })}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Due date</Label>
                      <Input
                        type="date"
                        value={task.dueDate ?? ""}
                        onChange={(e) => void saveTaskPatch({ dueDate: e.target.value || null })}
                        className="h-9"
                      />
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
                              {ENTITY_KIND_LABEL[task.entityKind]} #{task.entityId} (not found)
                            </span>
                          )}
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                            <span>{ENTITY_KIND_LABEL[task.entityKind]}</span>
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
                    <Textarea
                      value={description}
                      onChange={(e) => descriptionField.setValue(e.target.value)}
                      onBlur={saveDescription}
                      rows={5}
                      placeholder="Add details…"
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
                </TabsContent>

                <TabsContent value="subtasks">
                  <SubtaskList
                    parentId={task.id}
                    subtasks={task.subtasks}
                    onOpenSubtask={onOpenTask}
                  />
                </TabsContent>

                <TabsContent value="comments">
                  <TaskCommentList taskId={task.id} comments={task.comments} />
                </TabsContent>

                <TabsContent value="activity">
                  <TaskActivityFeed activity={task.activity} />
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
                <span>Reported by {task.reporter?.name ?? task.reporter?.email ?? "—"}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
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
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              {task?.title ? `"${task.title}" and any of its subtasks will be removed. ` : ""}
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!task) return;
                deleteMutation.mutate(task.id, { onSuccess: onClose });
                setConfirmDelete(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Link2, Trash2, X } from "lucide-react";
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
import { TASK_KINDS, TASK_PRIORITIES, TASK_STATUSES } from "@/tasks/domain";
import { useInstantTask } from "../hooks/data/useInstantTask";
import { useInstantTaskLabels } from "../hooks/data/useInstantTaskLabels";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";
import { TaskKindIcon } from "../atoms/TaskKindIcon";
import { AssigneePicker } from "../molecules/AssigneePicker";
import { LabelPicker } from "../molecules/LabelPicker";
import { TaskEntityPicker } from "../molecules/TaskEntityPicker";
import { BlockedReasonDialog } from "../molecules/BlockedReasonDialog";
import { TASK_KIND_LABELS, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, taskLabelColor } from "../atoms/taskVisualTokens";

/**
 * A task description is one paragraph of plain text for now — no slash commands, no
 * tables, none of NoteEditor's richness. Round-tripped through the same minimal TipTap
 * shape the backend already stores, so a richer editor can replace this later without
 * a data migration.
 */
function plainTextToDoc(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  return {
    type: "doc",
    content: [
      trimmed
        ? { type: "paragraph", content: [{ type: "text", text: trimmed }] }
        : { type: "paragraph" },
    ],
  };
}

function docToPlainText(doc: Record<string, unknown>): string {
  const lines: string[] = [];
  const walk = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    const n = node as { text?: string; content?: unknown[] };
    if (typeof n.text === "string") lines.push(n.text);
    if (Array.isArray(n.content)) n.content.forEach(walk);
  };
  walk(doc);
  return lines.join("");
}

const ENTITY_KIND_LABEL: Record<string, string> = {
  lead: "Lead",
  project: "Project",
  contact: "Contact",
  company: "Company",
};

export function TaskDetailSheet({
  taskId,
  onClose,
}: {
  taskId: number | null;
  onClose: () => void;
}) {
  const { data: task, showSkeleton } = useInstantTask(taskId);
  const { labels: allLabels } = useInstantTaskLabels();
  const {
    updateMutation,
    moveMutation,
    setAssigneeMutation,
    setLabelsMutation,
    setEntityMutation,
    deleteMutation,
  } = useTaskMutations();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pendingBlock, setPendingBlock] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(docToPlainText(task.description));
  }, [task]);

  const open = taskId !== null;

  const saveTitle = () => {
    if (!task || title.trim() === task.title) return;
    updateMutation.mutate({ id: task.id, patch: { title: title.trim() || "Untitled task" } });
  };

  const saveDescription = () => {
    if (!task) return;
    updateMutation.mutate({ id: task.id, patch: { description: plainTextToDoc(description) } });
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
                <SheetDescription className="font-mono text-xs">T-{task.id}</SheetDescription>
                <SheetTitle asChild>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={saveTitle}
                    className="border-none px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
                  />
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 grid grid-cols-2 gap-4">
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
                      updateMutation.mutate({
                        id: task.id,
                        patch: { priority: priority as (typeof TASK_PRIORITIES)[number] },
                      })
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
                      updateMutation.mutate({
                        id: task.id,
                        patch: { kind: kind as (typeof TASK_KINDS)[number] },
                      })
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
                    onChange={(e) =>
                      updateMutation.mutate({
                        id: task.id,
                        patch: { startDate: e.target.value || null },
                      })
                    }
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Due date</Label>
                  <Input
                    type="date"
                    value={task.dueDate ?? ""}
                    onChange={(e) =>
                      updateMutation.mutate({
                        id: task.id,
                        patch: { dueDate: e.target.value || null },
                      })
                    }
                    className="h-9"
                  />
                </div>
              </div>

              {task.status === "blocked" ? (
                <div className="mt-4 flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">Blocked</p>
                    <p className="text-xs">{task.blockedReason}</p>
                  </div>
                </div>
              ) : null}

              <div className="mt-5 space-y-1.5">
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

              <div className="mt-5 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Linked record</Label>
                {task.entityKind && task.entityId ? (
                  <div className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm">
                    <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="flex-1 truncate">
                      {ENTITY_KIND_LABEL[task.entityKind]} #{task.entityId}
                    </span>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground"
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

              <div className="mt-5 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={saveDescription}
                  rows={5}
                  placeholder="Add details…"
                />
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
                <span>
                  Reported by {task.reporter?.name ?? task.reporter?.email ?? "—"}
                </span>
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

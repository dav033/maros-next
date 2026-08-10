"use client";

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_KINDS, TASK_PRIORITIES } from "@/tasks/domain";
import type { TaskEntityKind, TaskKind, TaskPriority } from "@/tasks/domain";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";
import { TaskKindIcon } from "../atoms/TaskKindIcon";
import { AssigneePicker } from "../molecules/AssigneePicker";
import { TASK_KIND_LABELS, TASK_PRIORITY_LABELS } from "../atoms/taskVisualTokens";

export function CreateTaskDialog({
  onCreated,
  defaultEntityKind,
  defaultEntityId,
  defaultAssigneeId,
  defaultAssigneeLabel,
  trigger,
}: {
  onCreated?: (id: number) => void;
  /** Preselects the linked record — e.g. EntityTasksSection on a lead/project page. */
  defaultEntityKind?: TaskEntityKind;
  defaultEntityId?: number;
  /** Preselects the assignee — e.g. MyTasksPageView defaults to yourself, since an
   *  unassigned task created there would immediately disappear from that same view. */
  defaultAssigneeId?: number;
  defaultAssigneeLabel?: string;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<TaskKind>("general");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [assigneeUserId, setAssigneeUserId] = useState<number | null>(defaultAssigneeId ?? null);
  const [assigneeLabel, setAssigneeLabel] = useState(defaultAssigneeLabel ?? "Unassigned");
  const [dueDate, setDueDate] = useState("");

  const { createMutation } = useTaskMutations();

  const reset = () => {
    setTitle("");
    setKind("general");
    setPriority("normal");
    setAssigneeUserId(defaultAssigneeId ?? null);
    setAssigneeLabel(defaultAssigneeLabel ?? "Unassigned");
    setDueDate("");
  };

  const submit = async () => {
    if (!title.trim()) return;
    const result = await createMutation.mutateAsync({
      title: title.trim(),
      kind,
      priority,
      assigneeUserId: assigneeUserId ?? undefined,
      dueDate: dueDate || undefined,
      entityKind: defaultEntityKind,
      entityId: defaultEntityId,
    });
    setOpen(false);
    reset();
    onCreated?.(result.id);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            New task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Pour foundation for unit 3"
              onKeyDown={(e) => {
                if (e.key === "Enter") void submit();
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Kind</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as TaskKind)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_KINDS.map((k) => (
                    <SelectItem key={k} value={k}>
                      <span className="inline-flex items-center gap-1.5">
                        <TaskKindIcon kind={k} />
                        {TASK_KIND_LABELS[k]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {TASK_PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Assignee</Label>
              <AssigneePicker
                onSelect={(user) => {
                  setAssigneeUserId(user?.id ?? null);
                  setAssigneeLabel(user?.name ?? user?.email ?? "Unassigned");
                }}
                trigger={
                  <button
                    type="button"
                    className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm hover:bg-accent/40"
                  >
                    <AssigneeAvatar person={assigneeUserId ? { id: assigneeUserId, name: assigneeLabel, email: "", picture: null } : null} />
                    <span className="truncate">{assigneeLabel}</span>
                  </button>
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Due date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!title.trim() || createMutation.isPending}
            onClick={() => void submit()}
          >
            Create task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

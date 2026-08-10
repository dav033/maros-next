"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task } from "@/tasks/domain";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";

/**
 * Subtasks are one level only (see PLAN-TAREAS.md section 0.5), so there is no nested
 * SubtaskList inside a subtask's own detail — this component only ever renders the
 * direct children already bundled into TaskDetail.
 */
export function SubtaskList({
  parentId,
  subtasks,
  onOpenSubtask,
}: {
  parentId: number;
  subtasks: Task[];
  onOpenSubtask: (id: number) => void;
}) {
  const [title, setTitle] = useState("");
  const { createMutation, moveMutation } = useTaskMutations();

  const addSubtask = async () => {
    if (!title.trim()) return;
    await createMutation.mutateAsync({ title: title.trim(), parentId });
    setTitle("");
  };

  const toggleDone = (subtask: Task) => {
    moveMutation.mutate({
      id: subtask.id,
      input: { status: subtask.status === "done" ? "todo" : "done" },
    });
  };

  const doneCount = subtasks.filter((s) => s.status === "done").length;

  return (
    <div className="space-y-3">
      {subtasks.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {doneCount} of {subtasks.length} done
        </p>
      )}

      <ul className="space-y-1.5">
        {subtasks.map((subtask) => (
          <li
            key={subtask.id}
            className="flex items-center gap-2 rounded-md border border-border/50 px-2.5 py-2 text-sm"
          >
            <button
              type="button"
              onClick={() => toggleDone(subtask)}
              aria-label={subtask.status === "done" ? "Mark as not done" : "Mark as done"}
              className={cn(
                "grid h-4 w-4 shrink-0 place-items-center rounded-sm border",
                subtask.status === "done"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/40"
              )}
            >
              {subtask.status === "done" && <Check className="h-3 w-3" />}
            </button>
            <button
              type="button"
              onClick={() => onOpenSubtask(subtask.id)}
              className={cn(
                "flex-1 truncate text-left hover:underline",
                subtask.status === "done" && "text-muted-foreground line-through"
              )}
            >
              {subtask.title}
            </button>
            <AssigneeAvatar person={subtask.assignee} />
          </li>
        ))}
        {subtasks.length === 0 && (
          <p className="text-sm text-muted-foreground">No subtasks yet.</p>
        )}
      </ul>

      <div className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a subtask…"
          className="h-8 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") void addSubtask();
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 shrink-0 gap-1"
          disabled={!title.trim() || createMutation.isPending}
          onClick={() => void addSubtask()}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
    </div>
  );
}

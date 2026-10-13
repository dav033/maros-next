"use client";

import { useId, useMemo, useState } from "react";
import { Check, GripVertical, Plus } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";
import type { Task } from "@/tasks/domain";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";
import { reorderSubtasks, resolveSubtaskDrop } from "./subtaskReorder";

// Adapted from Bencho Checklist's spring-filled checkbox and drawn checkmark.
// Licensed MIT: https://bencho.dev/licence (source: https://bencho.dev/, src/lab/Checklist.tsx).

/**
 * The drag handle is its own control rather than the whole row, unlike the board's
 * cards: a row here is mostly buttons (toggle done, open the subtask), and making the
 * row itself draggable would swallow those clicks.
 */
function SortableSubtask({
  subtask,
  onToggleDone,
  onOpen,
}: {
  subtask: Task;
  onToggleDone: () => void;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: subtask.id,
  });
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDone = subtask.status === "done";

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: prefersReducedMotion ? undefined : transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex items-center gap-2 rounded-md border border-line bg-elev-3 px-3 py-2 text-sm"
    >
      <button
        type="button"
        aria-label={`Reorder ${subtask.title}`}
        className="cursor-grab touch-none text-fg-faint hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <motion.button
        type="button"
        onClick={onToggleDone}
        aria-label={isDone ? "Mark as not done" : "Mark as done"}
        aria-pressed={isDone}
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isDone ? "text-primary-foreground" : "text-muted-foreground"
        )}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 420, damping: 26 }
        }
      >
        <span
          className={cn(
            "relative grid h-[18px] w-[18px] place-items-center overflow-hidden rounded-[5px] border",
            isDone ? "border-primary bg-primary" : "border-line-strong bg-background"
          )}
        >
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-[4px] bg-primary"
            initial={false}
            animate={{ scale: isDone ? 1 : 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 420, damping: 26 }
            }
          />
          <motion.span
            aria-hidden="true"
            className="relative z-10"
            initial={false}
            animate={{ opacity: isDone ? 1 : 0, scale: isDone ? 1 : 0.7 }}
            transition={
              prefersReducedMotion ? { duration: 0 } : { duration: 0.16 }
            }
          >
            <Check className="h-3 w-3" />
          </motion.span>
        </span>
      </motion.button>
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "flex-1 truncate text-left hover:underline",
          subtask.status === "done" && "text-muted-foreground line-through"
        )}
      >
        {subtask.title}
      </button>
      <AssigneeAvatar person={subtask.assignee} />
    </li>
  );
}

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
  const dndContextId = useId();
  const [title, setTitle] = useState("");
  // Holds the post-drop order until the refetched parent comes back with it, so the
  // row doesn't snap back to its old slot for the length of the round trip.
  const [pendingOrder, setPendingOrder] = useState<number[] | null>(null);
  const { createMutation, moveMutation, reorderSubtaskMutation } = useTaskMutations();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Server order wins as soon as it contains exactly the ids we reordered — anything
  // else (a subtask added or removed meanwhile, someone else's change over SSE) means
  // the optimistic order is stale and gets dropped.
  const ordered = useMemo(() => {
    if (!pendingOrder || pendingOrder.length !== subtasks.length) return subtasks;
    const byId = new Map(subtasks.map((s) => [s.id, s]));
    const rebuilt = pendingOrder.map((id) => byId.get(id));
    return rebuilt.every((s): s is Task => s != null) ? rebuilt : subtasks;
  }, [subtasks, pendingOrder]);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);
    const input = resolveSubtaskDrop(ordered, activeId, overId);
    if (!input) return;

    setPendingOrder(reorderSubtasks(ordered, activeId, overId).map((s) => s.id));
    reorderSubtaskMutation.mutate(
      { id: activeId, parentId, input },
      { onSettled: () => setPendingOrder(null) }
    );
  };

  const doneCount = ordered.filter((s) => s.status === "done").length;

  return (
    <div className="space-y-3">
      {ordered.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {doneCount} of {ordered.length} done
        </p>
      )}

      <DndContext id={`task-subtasks-${parentId}-${dndContextId}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <ul className="space-y-1.5">
          <SortableContext
            items={ordered.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {ordered.map((subtask) => (
              <SortableSubtask
                key={subtask.id}
                subtask={subtask}
                onToggleDone={() => toggleDone(subtask)}
                onOpen={() => onOpenSubtask(subtask.id)}
              />
            ))}
          </SortableContext>
          {ordered.length === 0 && (
            <p className="text-sm text-muted-foreground">No subtasks yet.</p>
          )}
        </ul>
      </DndContext>

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

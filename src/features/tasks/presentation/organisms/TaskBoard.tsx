"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { BOARD_STATUSES } from "@/tasks/domain";
import type { Task, TaskStatus } from "@/tasks/domain";
import { useInstantTasksBoard } from "../hooks/data/useInstantTasksBoard";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { TaskCard } from "../molecules/TaskCard";
import { BlockedReasonDialog } from "../molecules/BlockedReasonDialog";
import { TASK_STATUS_LABELS } from "../atoms/taskVisualTokens";

const COLUMN_PREFIX = "column:";

function SortableTaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}

function BoardColumn({
  status,
  tasks,
  onCardClick,
}: {
  status: TaskStatus;
  tasks: Task[];
  onCardClick: (id: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${COLUMN_PREFIX}${status}` });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border border-border/50 bg-muted/20 transition-colors",
        isOver && "border-primary/50 bg-primary/5"
      )}
    >
      <div className="flex items-center justify-between border-b border-border/40 px-3 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {TASK_STATUS_LABELS[status]}
        </span>
        <span className="rounded-full bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {tasks.length}
        </span>
      </div>
      <div className="flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto p-2">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onClick={() => onCardClick(task.id)} />
          ))}
        </SortableContext>
        {tasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/40 px-2 py-6 text-center text-xs text-muted-foreground">
            No tasks
          </div>
        ) : null}
      </div>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {BOARD_STATUSES.map((status) => (
        <div key={status} className="w-72 shrink-0 space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  );
}

export function TaskBoard({ onOpenTask }: { onOpenTask: (id: number) => void }) {
  const { board, showSkeleton } = useInstantTasksBoard();
  const { moveMutation } = useTaskMutations();

  const [pendingBlock, setPendingBlock] = useState<{
    taskId: number;
    beforeId?: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Flat id -> status lookup, so onDragEnd can tell which column a dropped-on card
  // belongs to (over.id is the card's id, not the column's, whenever there's a card
  // under the pointer).
  const taskStatusById = useMemo(() => {
    const map = new Map<number, TaskStatus>();
    for (const status of BOARD_STATUSES) {
      for (const task of board[status] ?? []) map.set(task.id, status);
    }
    return map;
  }, [board]);

  const resolveTargetStatus = (overId: string | number): TaskStatus | null => {
    if (typeof overId === "string" && overId.startsWith(COLUMN_PREFIX)) {
      return overId.slice(COLUMN_PREFIX.length) as TaskStatus;
    }
    return taskStatusById.get(Number(overId)) ?? null;
  };

  const commitMove = (
    taskId: number,
    status: TaskStatus,
    beforeId?: number,
    blockedReason?: string
  ) => {
    moveMutation.mutate({ id: taskId, input: { status, beforeId, blockedReason } });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = Number(active.id);
    const fromStatus = taskStatusById.get(taskId);
    const targetStatus = resolveTargetStatus(over.id);
    if (!fromStatus || !targetStatus) return;

    // Dropped on another card: the dragged task takes that card's spot. Dropped on
    // the empty column area itself: append to the end.
    const overIsCard = typeof over.id !== "string" || !over.id.startsWith(COLUMN_PREFIX);
    const beforeId = overIsCard ? Number(over.id) : undefined;

    if (fromStatus === targetStatus && beforeId === taskId) return;

    if (targetStatus === "blocked") {
      setPendingBlock({ taskId, beforeId });
      return;
    }

    commitMove(taskId, targetStatus, beforeId);
  };

  if (showSkeleton) {
    return <BoardSkeleton />;
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {BOARD_STATUSES.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={board[status] ?? []}
              onCardClick={onOpenTask}
            />
          ))}
        </div>
      </DndContext>

      <BlockedReasonDialog
        open={pendingBlock !== null}
        onCancel={() => setPendingBlock(null)}
        onConfirm={(reason) => {
          if (!pendingBlock) return;
          commitMove(pendingBlock.taskId, "blocked", pendingBlock.beforeId, reason);
          setPendingBlock(null);
        }}
      />
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BOARD_STATUSES } from "@/tasks/domain";
import type { Task, TaskStatus } from "@/tasks/domain";
import { cn } from "@/lib/utils";
import { useTaskMutations } from "../hooks/mutations/useTaskMutations";
import { TaskCard } from "../molecules/TaskCard";
import { TASK_STATUS_LABELS } from "../atoms/taskVisualTokens";
import { TaskEmptyState } from "../atoms/TaskEmptyState";
import { BlockedReasonDialog } from "../molecules/BlockedReasonDialog";
import { QuickAddTask } from "../molecules/QuickAddTask";
import { parseTaskQuickAdd } from "../molecules/taskQuickAdd";

const COLUMN_PREFIX = "entity-column:";

function SortableEntityTaskCard({ task, onOpenTask, onComplete }: {
  task: Task;
  onOpenTask: (id: number) => void;
  onComplete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} onClick={() => onOpenTask(task.id)} onComplete={onComplete} />
    </div>
  );
}

function EntityColumn({ status, tasks, onOpenTask, onComplete, onQuickAdd }: {
  status: TaskStatus;
  tasks: Task[];
  onOpenTask: (id: number) => void;
  onComplete: (task: Task) => void;
  onQuickAdd: (value: string) => Promise<void>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${COLUMN_PREFIX}${status}` });
  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex min-h-40 w-60 shrink-0 flex-col rounded-lg border border-border bg-card",
        isOver && "border-primary/50 bg-primary/5",
      )}
    >
      <header className="flex items-center justify-between border-b border-border/40 px-3 py-2">
        <h3 className="text-xs font-semibold text-muted-foreground">{TASK_STATUS_LABELS[status]}</h3>
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{tasks.length}</span>
      </header>
      <div className={cn("flex flex-1 flex-col gap-2 p-2", tasks.length === 0 && "justify-center")}>
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableEntityTaskCard
              key={task.id}
              task={task}
              onOpenTask={onOpenTask}
              onComplete={() => onComplete(task)}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 ? <span className="py-6 text-center text-xs text-muted-foreground">—</span> : null}
      </div>
      <QuickAddTask onAdd={onQuickAdd} />
    </section>
  );
}

export function EntityTaskBoard({ tasks, onOpenTask, entityKind, entityId, partyKind, partyId }: { tasks: Task[]; onOpenTask: (id: number) => void; entityKind?: Task["entityKind"]; entityId?: number; partyKind?: "company" | "contact"; partyId?: number }) {
  const { moveMutation, createMutation, setPartiesMutation } = useTaskMutations();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [activeId, setActiveId] = useState<number | null>(null);
  const [pendingBlocked, setPendingBlocked] = useState<{ taskId: number } | null>(null);
  const columns = new Map<TaskStatus, Task[]>();
  for (const status of BOARD_STATUSES) columns.set(status, []);
  for (const task of tasks) columns.get(task.status)?.push(task);
  const taskById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);

  const addToColumn = async (status: TaskStatus, value: string) => {
    const parsed = parseTaskQuickAdd(value);
    const linkedToJob = entityKind === "lead" || entityKind === "project";
    const created = await createMutation.mutateAsync({ title: parsed.title, priority: parsed.priority, dueDate: parsed.dueDate, entityKind: linkedToJob ? entityKind : undefined, entityId: linkedToJob ? entityId : undefined });
    if (partyKind && partyId != null) await setPartiesMutation.mutateAsync({ id: created.id, parties: [{ partyKind, partyId }] });
    if (status !== "todo") await moveMutation.mutateAsync({ id: created.id, input: { status, blockedReason: status === "blocked" ? "Added to blocked column" : undefined } });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;
    const task = taskById.get(Number(active.id));
    if (!task) return;
    const targetStatus = typeof over.id === "string" && over.id.startsWith(COLUMN_PREFIX)
      ? over.id.slice(COLUMN_PREFIX.length) as TaskStatus
      : taskById.get(Number(over.id))?.status;
    if (!targetStatus || targetStatus === task.status) return;
    if (targetStatus === "blocked") {
      setPendingBlocked({ taskId: task.id });
      return;
    }
    moveMutation.mutate({ id: task.id, input: { status: targetStatus } });
  };

  if (tasks.length === 0) return <TaskEmptyState compact title="No tasks linked yet." />;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) => setActiveId(Number(active.id))}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-2">
          {BOARD_STATUSES.map((status) => (
            <EntityColumn
              key={status}
              status={status}
              tasks={columns.get(status) ?? []}
              onOpenTask={onOpenTask}
              onComplete={(task) => {
                if (task.status !== "done") moveMutation.mutate({ id: task.id, input: { status: "done" } });
              }}
              onQuickAdd={(value) => addToColumn(status, value)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeId != null && taskById.get(activeId) ? <TaskCard task={taskById.get(activeId)!} /> : null}
        </DragOverlay>
      </DndContext>
      <BlockedReasonDialog
        open={pendingBlocked !== null}
        onCancel={() => setPendingBlocked(null)}
        onConfirm={(reason) => {
          if (!pendingBlocked) return;
          moveMutation.mutate({ id: pendingBlocked.taskId, input: { status: "blocked", blockedReason: reason } });
          setPendingBlocked(null);
        }}
      />
    </>
  );
}

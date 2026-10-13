import { AlertTriangle, CheckCircle2, Link2 } from "lucide-react";
import { motion } from "motion/react";
import { taskCardSurfaceTransition } from "@/shared/presentation/motionTransitions";
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";
import { memo, type PointerEvent as ReactPointerEvent } from "react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { type Task, type TaskPriority } from "@/tasks/domain";
import type { DirectoryUser } from "@/features/users/domain";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";
import { DueDatePill } from "../atoms/DueDatePill";
import { TaskPriorityBadge } from "../atoms/TaskPriorityBadge";
import { taskLabelColor } from "../atoms/taskVisualTokens";
import { TaskActionsMenu } from "./TaskActionsMenu";
import { TaskContextMenu } from "./TaskContextMenu";
import { TaskDragHandle } from "./TaskDragHandle";
import { AssigneePicker } from "./AssigneePicker";
import { TaskDatePicker } from "./TaskDatePicker";

export const TaskCard = memo(function TaskCard({
  task,
  onClick,
  className,
  onComplete,
  onAssigneeClick,
  onAssigneeChange,
  onDueDateClick,
  onDueDateChange,
  onDuplicate,
  onDelete,
  onPriorityChange,
  onLabelsClick,
  onArchive,
  onSelect,
  selected,
  dragHandle,
}: {
  task: Task;
  onClick?: () => void;
  className?: string;
  onComplete?: () => void;
  onAssigneeClick?: () => void;
  onAssigneeChange?: (user: DirectoryUser | null) => void;
  onDueDateClick?: () => void;
  onDueDateChange?: (date: string | null) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onPriorityChange?: (priority: TaskPriority) => void;
  onLabelsClick?: () => void;
  onArchive?: () => void;
  onSelect?: (shiftKey: boolean) => void;
  selected?: boolean;
  dragHandle?: { attributes: DraggableAttributes; listeners: DraggableSyntheticListeners };
}) {
  const shouldReduceMotion = usePrefersReducedMotion();
  const metaParts: string[] = [];
  if (task.subtasksTotal > 0) metaParts.push(`${task.subtasksDone}/${task.subtasksTotal} subtasks`);
  if (task.commentsCount > 0) metaParts.push(`${task.commentsCount} ${task.commentsCount === 1 ? "comment" : "comments"}`);
  const footerMetaText = metaParts.join(" · ");
  const actionHandlers = { onOpen: onClick, onComplete, onDuplicate, onDelete, onPriorityChange, onLabelsClick, onArchive };
  const handleCardPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("[data-no-drag],button,a,input,textarea,select,[contenteditable='true']")) return;
    const onPointerDown = dragHandle?.listeners?.onPointerDown;
    if (onPointerDown) onPointerDown(event);
  };

  return (
    <TaskContextMenu task={task} handlers={actionHandlers}>
      <motion.article
        layoutId={onClick && !shouldReduceMotion ? `maros-task-card-${task.id}` : undefined}
        data-task-card-id={onClick ? task.id : undefined}
        whileHover={onClick && !shouldReduceMotion ? { y: -2 } : undefined}
        whileTap={onClick && !dragHandle && !shouldReduceMotion ? { y: 0 } : undefined}
        transition={{
          ...taskCardSurfaceTransition,
          y: { duration: 0.16, ease: [0.22, 1, 0.36, 1] },
        }}
        onClick={(event) => {
          const target = event.target instanceof Element ? event.target : null;
          const interactiveTarget = target?.closest("button,a,input,textarea,select,[contenteditable='true']");
          if (
            interactiveTarget &&
            interactiveTarget !== event.currentTarget &&
            !interactiveTarget.hasAttribute("data-task-open")
          ) return;
          if (event.shiftKey && onSelect) {
            event.preventDefault();
            event.stopPropagation();
            onSelect(true);
            return;
          }
          onClick?.();
        }}
        className={cn(
          "group flex min-h-[132px] flex-col gap-2 rounded-lg border border-border bg-card p-3 text-left shadow-sm transition-[background-color,border-color,box-shadow] duration-150 motion-reduce:transition-none hover:border-primary hover:bg-card hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          onClick && "cursor-pointer",
          selected && "ring-2 ring-primary ring-offset-1",
          className,
        )}
        onPointerDown={dragHandle ? handleCardPointerDown : undefined}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            {dragHandle ? <TaskDragHandle {...dragHandle} /> : null}
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor:
                  task.priority === "urgent"
                    ? "hsl(var(--destructive))"
                    : task.priority === "high"
                      ? "hsl(var(--badge-orange))"
                      : "hsl(var(--muted-foreground))",
              }}
              aria-label={`${task.priority} priority`}
            />
            {onAssigneeChange ? (
              <AssigneePicker
                onSelect={onAssigneeChange}
                trigger={
                  <button type="button" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-no-drag="true" onClick={(event) => event.stopPropagation()} aria-label="Change assignee">
                    <AssigneeAvatar person={task.assignee} />
                  </button>
                }
              />
            ) : onAssigneeClick ? (
              <button
                type="button"
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-no-drag="true"
                onClick={(event) => {
                  event.stopPropagation();
                  onAssigneeClick();
                }}
                aria-label="Change assignee"
              >
                <AssigneeAvatar person={task.assignee} />
              </button>
            ) : <AssigneeAvatar person={task.assignee} />}
            {onComplete ? (
              <button
                type="button"
                aria-label="Mark task done"
                data-no-drag="true"
                className="rounded-full p-1 text-muted-foreground opacity-100 transition-opacity motion-reduce:transition-none hover:text-emerald-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
                onClick={(event) => {
                  event.stopPropagation();
                  onComplete();
                }}
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
            ) : null}
            <TaskActionsMenu task={task} handlers={actionHandlers} />
          </div>
        </div>

        {onClick ? (
          <button
            type="button"
            data-no-drag="true"
            data-task-open="true"
            onClick={(event) => {
              if (event.detail > 0 && event.shiftKey && onSelect) {
                event.preventDefault();
                event.stopPropagation();
                onSelect(true);
                return;
              }
              event.stopPropagation();
              onClick();
            }}
            className="w-full rounded-sm text-left text-sm font-medium leading-snug text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="line-clamp-2">{task.title}</span>
          </button>
        ) : (
          <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">{task.title}</p>
        )}

        {task.entity ? (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Link2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{task.entity.label}</span>
          </span>
        ) : null}

        <TaskPriorityBadge priority={task.priority} pill />

        {task.status === "blocked" && task.blockedReason ? (
          <div className="flex items-start gap-1.5 rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="line-clamp-2">{task.blockedReason}</span>
          </div>
        ) : null}

        {task.labels.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {task.labels.map((label) => (
              <span key={label.id} className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: `${taskLabelColor(label.color)}22`, color: taskLabelColor(label.color) }}>
                {label.name}
              </span>
            ))}
          </div>
        ) : null}

        {task.dueDate || footerMetaText || onDueDateChange ? (
          <div className="flex items-center justify-between gap-2">
            {task.dueDate ? (
              onDueDateChange ? (
                <div onClick={(event) => event.stopPropagation()}>
                  <TaskDatePicker value={task.dueDate} onChange={onDueDateChange} className="h-7 w-auto border-0 bg-transparent px-0 text-[11px] shadow-none hover:bg-transparent" />
                </div>
              ) :
              onDueDateClick ? (
                <button type="button" data-no-drag="true" onClick={(event) => { event.stopPropagation(); onDueDateClick(); }}>
                  <DueDatePill dueDate={task.dueDate} />
                </button>
              ) : <DueDatePill dueDate={task.dueDate} />
            ) : onDueDateChange ? (
              <div onClick={(event) => event.stopPropagation()}>
                <TaskDatePicker value={null} onChange={onDueDateChange} className="h-7 w-auto border-0 bg-transparent px-0 text-[11px] shadow-none hover:bg-transparent" placeholder="Set due date" />
              </div>
            ) : <span />}
            {footerMetaText ? <span className="shrink-0 text-[11px] text-muted-foreground">{footerMetaText}</span> : null}
          </div>
        ) : null}
      </motion.article>
    </TaskContextMenu>
  );
});

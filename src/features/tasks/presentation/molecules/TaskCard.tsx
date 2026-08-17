import { AlertTriangle, CheckCircle2, Link2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { TASK_PRIORITIES, type Task, type TaskPriority } from "@/tasks/domain";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";
import { DueDatePill } from "../atoms/DueDatePill";
import { TaskPriorityBadge } from "../atoms/TaskPriorityBadge";
import { taskLabelColor } from "../atoms/taskVisualTokens";

/**
 * Pure presentation — no dnd-kit here. The board wraps this in its own sortable
 * handle (see TaskBoard), same split NoteTreePanel uses between a row's content and
 * its drag hookup.
 */
export function TaskCard({
  task,
  onClick,
  className,
  onComplete,
  onAssigneeClick,
  onDueDateClick,
  onDuplicate,
  onDelete,
  onPriorityChange,
  onLabelsClick,
  onSelect,
  selected,
}: {
  task: Task;
  onClick?: () => void;
  className?: string;
  onComplete?: () => void;
  onAssigneeClick?: () => void;
  onDueDateClick?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onPriorityChange?: (priority: TaskPriority) => void;
  onLabelsClick?: () => void;
  onSelect?: (shiftKey: boolean) => void;
  selected?: boolean;
}) {
  const metaParts: string[] = [];
  if (task.subtasksTotal > 0) metaParts.push(`${task.subtasksDone}/${task.subtasksTotal} subtasks`);
  if (task.commentsCount > 0) {
    metaParts.push(`${task.commentsCount} ${task.commentsCount === 1 ? "comment" : "comments"}`);
  }
  const footerMetaText = metaParts.join(" · ");

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={(event) => {
        if (event.shiftKey && onSelect) {
          event.preventDefault();
          event.stopPropagation();
          onSelect(true);
          return;
        }
        onClick?.();
      }}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
        className={cn(
        "group flex min-h-[132px] flex-col gap-2 rounded-lg border border-border bg-card p-3 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        onClick && "cursor-pointer",
        selected && "ring-2 ring-primary ring-offset-1",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0" aria-hidden="true" />
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
          {onAssigneeClick ? <button type="button" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={(event) => { event.stopPropagation(); onAssigneeClick(); }} aria-label="Change assignee"><AssigneeAvatar person={task.assignee} /></button> : <AssigneeAvatar person={task.assignee} />}
          {onComplete ? (
            <button
              type="button"
              aria-label="Mark task done"
              className="rounded-full p-1 text-muted-foreground opacity-0 transition-opacity hover:text-emerald-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
              onClick={(event) => { event.stopPropagation(); onComplete(); }}
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          ) : null}
          {onDuplicate || onDelete || onPriorityChange || onLabelsClick ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild><button type="button" className="rounded-md p-1 text-muted-foreground opacity-0 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100" onClick={(event) => event.stopPropagation()} aria-label="Task actions"><MoreHorizontal className="h-4 w-4" /></button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onDuplicate ? <DropdownMenuItem onSelect={onDuplicate}>Duplicate</DropdownMenuItem> : null}
                {onPriorityChange ? (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Priority</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {TASK_PRIORITIES.map((priority) => <DropdownMenuItem key={priority} onSelect={() => onPriorityChange(priority)}>{priority === task.priority ? "✓ " : ""}{priority}</DropdownMenuItem>)}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ) : null}
                {onLabelsClick ? <DropdownMenuItem onSelect={onLabelsClick}>Edit labels</DropdownMenuItem> : null}
                {onDelete ? <DropdownMenuItem className="text-destructive" onSelect={onDelete}>Delete</DropdownMenuItem> : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
        {task.title}
      </p>

      {task.entity ? (
        // Plain text, not a link: the card sits inside a dnd-kit sortable handle
        // (see TaskBoard), where a nested interactive element competes with drag —
        // opening the detail sheet (the card's own onClick) is where the real link is.
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
            <span
              key={label.id}
              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: `${taskLabelColor(label.color)}22`,
                color: taskLabelColor(label.color),
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      ) : null}

      {task.dueDate || footerMetaText ? (
        <div className="flex items-center justify-between gap-2">
          {task.dueDate ? (onDueDateClick ? <button type="button" onClick={(event) => { event.stopPropagation(); onDueDateClick(); }}><DueDatePill dueDate={task.dueDate} /></button> : <DueDatePill dueDate={task.dueDate} />) : <span />}
          {footerMetaText ? (
            <span className="shrink-0 text-[11px] text-muted-foreground">{footerMetaText}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

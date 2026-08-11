import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/tasks/domain";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";
import { DueDatePill } from "../atoms/DueDatePill";
import { TaskKindIcon } from "../atoms/TaskKindIcon";
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
}: {
  task: Task;
  onClick?: () => void;
  className?: string;
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
      onClick={onClick}
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
        "flex flex-col gap-2 rounded-xl border border-border/60 bg-card/60 p-3 text-left shadow-sm transition-colors hover:border-border hover:bg-card",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <TaskKindIcon kind={task.kind} />
          <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
            T-{task.id}
          </span>
        </div>
        <AssigneeAvatar person={task.assignee} />
      </div>

      <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
        {task.title}
      </p>

      {task.priority === "urgent" || task.priority === "high" ? (
        <TaskPriorityBadge priority={task.priority} pill />
      ) : null}

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
          {task.dueDate ? <DueDatePill dueDate={task.dueDate} /> : <span />}
          {footerMetaText ? (
            <span className="shrink-0 text-[11px] text-muted-foreground">{footerMetaText}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

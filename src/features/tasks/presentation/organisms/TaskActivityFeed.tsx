import {
  Ban,
  CalendarClock,
  CheckCircle2,
  Flag,
  Link2,
  Link2Off,
  ListPlus,
  MessageSquare,
  Paperclip,
  PlusCircle,
  ShieldCheck,
  UserMinus,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { TaskActivityEntry, TaskActivityKind, TaskPriority, TaskStatus } from "@/tasks/domain";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "../atoms/taskVisualTokens";

const ACTIVITY_ICONS: Record<TaskActivityKind, LucideIcon> = {
  created: PlusCircle,
  status_changed: CheckCircle2,
  assigned: UserPlus,
  unassigned: UserMinus,
  due_changed: CalendarClock,
  priority_changed: Flag,
  blocked: Ban,
  unblocked: ShieldCheck,
  commented: MessageSquare,
  entity_linked: Link2,
  entity_unlinked: Link2Off,
  attachment_added: Paperclip,
  subtask_added: ListPlus,
};

function statusLabel(value: string | null): string {
  if (!value) return "—";
  return TASK_STATUS_LABELS[value as TaskStatus] ?? value;
}

function priorityLabel(value: string | null): string {
  if (!value) return "—";
  return TASK_PRIORITY_LABELS[value as TaskPriority] ?? value;
}

function describe(entry: TaskActivityEntry): string {
  const who = entry.actor?.name ?? entry.actor?.email ?? "Someone";
  switch (entry.kind) {
    case "created":
      return `${who} created this task`;
    case "status_changed":
      return `${who} moved this from ${statusLabel(entry.fromValue)} to ${statusLabel(entry.toValue)}`;
    case "assigned":
      return `${who} assigned this task`;
    case "unassigned":
      return `${who} unassigned this task`;
    case "due_changed":
      return entry.toValue
        ? `${who} set the due date to ${entry.toValue}`
        : `${who} cleared the due date`;
    case "priority_changed":
      return `${who} changed priority from ${priorityLabel(entry.fromValue)} to ${priorityLabel(entry.toValue)}`;
    case "blocked":
      return `${who} marked this blocked: ${entry.toValue}`;
    case "unblocked":
      return `${who} cleared the block`;
    case "commented":
      return `${who} commented`;
    case "entity_linked":
      return `${who} linked this to ${entry.toValue}`;
    case "entity_unlinked":
      return `${who} unlinked this task`;
    case "attachment_added":
      return `${who} added ${entry.toValue} attachment${entry.toValue === "1" ? "" : "s"}`;
    case "subtask_added":
      return `${who} added a subtask`;
    default:
      return `${who} updated this task`;
  }
}

export function TaskActivityFeed({ activity }: { activity: TaskActivityEntry[] }) {
  if (activity.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {activity.map((entry) => {
        const Icon = ACTIVITY_ICONS[entry.kind] ?? PlusCircle;
        return (
          <li key={entry.id} className="flex items-start gap-2.5 text-sm">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-foreground/90">{describe(entry)}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

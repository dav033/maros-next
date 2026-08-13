import {
  Calculator,
  CircleDot,
  ClipboardCheck,
  FileEdit,
  HardHat,
  ListChecks,
  MapPin,
  Package,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Stamp,
  type LucideIcon,
} from "lucide-react";
import type { TaskKind, TaskPriority, TaskStatus } from "@/tasks/domain";

// Colors from shared CSS tokens (--badge-*), not raw hex — see globals.css. Same
// palette notes' tags use; named by hue, not meaning, since the same color marks
// different concepts across tables.
export const TASK_LABEL_COLORS: Record<string, string> = {
  neutral: "hsl(var(--badge-neutral))",
  blue: "hsl(var(--badge-blue))",
  sky: "hsl(var(--badge-sky))",
  indigo: "hsl(var(--badge-indigo))",
  amber: "hsl(var(--badge-amber))",
  orange: "hsl(var(--badge-orange))",
  green: "hsl(var(--badge-green))",
  violet: "hsl(var(--badge-violet))",
  red: "hsl(var(--badge-red))",
};

export const TASK_LABEL_COLOR_KEYS = Object.keys(TASK_LABEL_COLORS);

export function taskLabelColor(color: string): string {
  return TASK_LABEL_COLORS[color] ?? TASK_LABEL_COLORS.neutral;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To do",
  in_progress: "In progress",
  blocked: "Blocked",
  done: "Done",
  cancelled: "Cancelled",
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: TASK_LABEL_COLORS.neutral,
  todo: TASK_LABEL_COLORS.blue,
  in_progress: TASK_LABEL_COLORS.amber,
  blocked: TASK_LABEL_COLORS.red,
  done: TASK_LABEL_COLORS.green,
  cancelled: TASK_LABEL_COLORS.neutral,
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: TASK_LABEL_COLORS.neutral,
  normal: TASK_LABEL_COLORS.blue,
  high: TASK_LABEL_COLORS.orange,
  urgent: TASK_LABEL_COLORS.red,
};

export const TASK_KIND_LABELS: Record<TaskKind, string> = {
  site_visit: "Site visit",
  estimate: "Estimate",
  follow_up: "Follow up",
  permit: "Permit",
  inspection: "Inspection",
  material_order: "Material order",
  subcontractor: "Subcontractor",
  punch_list: "Punch list",
  change_order: "Change order",
  warranty: "Warranty",
  safety: "Safety",
  general: "General",
};

/**
 * Linked-entity statuses (LeadStatus, ProjectProgressStatus) come back
 * SCREAMING_SNAKE_CASE from the backend — this feature deliberately doesn't import
 * leads'/projects' own label maps just to show a small badge, so a generic humanize
 * covers it: "ESTIMATING_PREPARING_PROPOSAL" → "Estimating preparing proposal".
 */
export function humanizeEntityStatus(status: string): string {
  const words = status.toLowerCase().split('_');
  return words.map((word, i) => (i === 0 ? capitalize(word) : word)).join(' ');
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export const TASK_KIND_ICONS: Record<TaskKind, LucideIcon> = {
  site_visit: MapPin,
  estimate: Calculator,
  follow_up: PhoneCall,
  permit: Stamp,
  inspection: ClipboardCheck,
  material_order: Package,
  subcontractor: HardHat,
  punch_list: ListChecks,
  change_order: FileEdit,
  warranty: ShieldCheck,
  safety: ShieldAlert,
  general: CircleDot,
};

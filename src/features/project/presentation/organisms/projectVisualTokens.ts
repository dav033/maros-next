import { ProjectProgressStatus } from "@/project/domain";

export const PROGRESS_LABELS: Record<string, string> = {
  NOT_EXECUTED: "Not Executed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  LOST: "Lost",
  POSTPONED: "Postponed",
  PERMITS: "Permits",
};

// Mismo lenguaje visual que leads (LeadStatusBadge): LOST es gris neutro, no rojo de error.
// Colores desde tokens CSS compartidos (--badge-*), no hex crudo: ver globals.css.
export const PROGRESS_COLORS: Record<string, string> = {
  NOT_EXECUTED: "hsl(var(--badge-neutral))",
  IN_PROGRESS: "hsl(var(--badge-blue))",
  COMPLETED: "hsl(var(--badge-green))",
  LOST: "hsl(var(--badge-neutral))",
  POSTPONED: "hsl(var(--badge-amber))",
  PERMITS: "hsl(var(--badge-violet))",
};

export const PROGRESS_ORDER = [
  ProjectProgressStatus.IN_PROGRESS,
  ProjectProgressStatus.NOT_EXECUTED,
  ProjectProgressStatus.PERMITS,
  ProjectProgressStatus.POSTPONED,
  ProjectProgressStatus.COMPLETED,
  ProjectProgressStatus.LOST,
];

export const INVOICE_LABELS: Record<string, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  NOT_EXECUTED: "Not Executed",
  PERMITS: "Permits",
};

export const INVOICE_COLORS: Record<string, string> = {
  PAID: "hsl(var(--badge-green))",
  PENDING: "hsl(var(--badge-amber))",
  NOT_EXECUTED: "hsl(var(--badge-neutral))",
  PERMITS: "hsl(var(--badge-violet))",
};

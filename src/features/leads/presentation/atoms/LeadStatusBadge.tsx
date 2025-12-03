import { Badge } from "@/shared/ui";
import type { BadgeVariant } from "@/shared/ui";

interface LeadStatusBadgeProps {
  status: string;
}

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  NOT_EXECUTED: "gray",
  COMPLETED: "info",
  IN_PROGRESS: "primary",
  LOST: "danger",
  POSTPONED: "warning",
  PERMITS: "purple",
};

const STATUS_LABELS: Record<string, string> = {
  NOT_EXECUTED: "Not Executed",
  COMPLETED: "Completed",
  IN_PROGRESS: "In Progress",
  LOST: "Lost",
  POSTPONED: "Postponed",
  PERMITS: "Permits",
};

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const variant = STATUS_VARIANTS[status] ?? "gray";
  const label = STATUS_LABELS[status] ?? status;

  return (
    <Badge variant={variant} size="sm">
      {label}
    </Badge>
  );
}

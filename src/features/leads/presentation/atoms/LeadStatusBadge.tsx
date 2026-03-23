import { Badge } from "@/components/ui/badge";

interface LeadStatusBadgeProps {
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  NOT_EXECUTED: "#6b7280",
  COMPLETED: "#22c55e", // Verde para completado
  IN_PROGRESS: "#3b82f6",
  LOST: "#6b7280", // Gris en lugar de rojo
  POSTPONED: "#f59e0b",
  PERMITS: "#8b5cf6",
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
  const color = STATUS_COLORS[status] ?? "#6b7280";
  const label = STATUS_LABELS[status] ?? status;

  return (
    <Badge variant="outline" className="text-xs" style={{ borderColor: color, color }}>
      {label}
    </Badge>
  );
}

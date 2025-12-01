interface LeadStatusBadgeProps {
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  NOT_EXECUTED: "bg-gray-500/15 text-gray-400",
  COMPLETED: "bg-emerald-500/15 text-emerald-400",
  IN_PROGRESS: "bg-blue-500/15 text-blue-400",
  LOST: "bg-red-500/15 text-red-400",
  POSTPONED: "bg-yellow-500/15 text-yellow-400",
  PERMITS: "bg-purple-500/15 text-purple-400",
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
  const colorClass =
    STATUS_COLORS[status] ?? "bg-theme-gray-subtle text-gray-300";
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
}

import { Badge } from "@/components/ui/badge";

interface LeadStatusBadgeProps {
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  NEW_LEAD: "#6b7280",
  CONTACTED: "#3b82f6",
  ESTIMATING_PREPARING_PROPOSAL: "#6366f1",
  PROPOSAL_SENT: "#f59e0b",
  FOLLOW_UP: "#f97316",
  WON: "#22c55e",
  LOST: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  NEW_LEAD: "New Lead",
  CONTACTED: "Contacted",
  ESTIMATING_PREPARING_PROPOSAL: "Estimating / Preparing Proposal",
  PROPOSAL_SENT: "Proposal Sent",
  FOLLOW_UP: "Follow Up",
  WON: "Won",
  LOST: "Lost",
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

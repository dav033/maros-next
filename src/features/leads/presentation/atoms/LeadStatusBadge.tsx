import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/leads/domain";
import { LEAD_STATUS_COLORS } from "./leadVisualTokens";

interface LeadStatusBadgeProps {
  status: string;
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const color = LEAD_STATUS_COLORS[status] ?? "hsl(var(--badge-neutral))";
  const label = (STATUS_LABELS as Record<string, string>)[status] ?? status;

  return (
    <Badge variant="outline" className="text-xs" style={{ borderColor: color, color }}>
      {label}
    </Badge>
  );
}

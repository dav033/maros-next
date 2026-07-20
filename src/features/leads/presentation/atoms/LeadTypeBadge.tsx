import { Badge } from "@/components/ui/badge";
import { LeadType } from "@/leads/domain";
import { LEAD_TYPE_COLORS, LEAD_TYPE_LABELS } from "./leadVisualTokens";

interface LeadTypeBadgeProps {
  leadType: LeadType | null;
}

export function LeadTypeBadge({ leadType }: LeadTypeBadgeProps) {
  if (!leadType) {
    return <span className="text-muted-foreground">—</span>;
  }

  const label = LEAD_TYPE_LABELS[leadType] ?? leadType;
  const color = LEAD_TYPE_COLORS[leadType] ?? "hsl(var(--badge-neutral))";

  return (
    <Badge
      variant="outline"
      className="gap-1.5"
      style={{ borderColor: color, color }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </Badge>
  );
}

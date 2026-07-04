import { Badge } from "@/components/ui/badge";
import { LeadType } from "@/leads/domain";

interface LeadTypeBadgeProps {
  leadType: LeadType | null;
}

const TYPE_CONFIG: Record<LeadType, { label: string; color: string }> = {
  [LeadType.CONSTRUCTION]: { label: "Construction", color: "#f59e0b" },
  [LeadType.PLUMBING]: { label: "Plumbing", color: "#3b82f6" },
  [LeadType.ROOFING]: { label: "Roofing", color: "#ef4444" },
};

export function LeadTypeBadge({ leadType }: LeadTypeBadgeProps) {
  if (!leadType) {
    return <span className="text-muted-foreground">—</span>;
  }

  const config = TYPE_CONFIG[leadType] ?? { label: leadType, color: "#9ca3af" };

  return (
    <Badge
      variant="outline"
      className="gap-1.5"
      style={{ borderColor: config.color, color: config.color }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </Badge>
  );
}

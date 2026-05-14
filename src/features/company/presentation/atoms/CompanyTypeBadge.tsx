import { Badge } from "@/components/ui/badge";

interface CompanyTypeBadgeProps {
  type: string | null | undefined;
}

const TYPE_COLORS: Record<string, string> = {
  SUBCONTRACTOR: "#3b82f6",
  GENERAL_CONTRACTOR: "#22c55e",
  SUPPLIER: "#f59e0b",
  HOA: "#8b5cf6",
  DESIGN: "#6b7280",
  OTHER: "#6b7280",
};

const TYPE_LABELS: Record<string, string> = {
  SUBCONTRACTOR: "Subcontractor",
  GENERAL_CONTRACTOR: "Contractor",
  SUPPLIER: "Supplier",
  HOA: "HOA",
  DESIGN: "Design",
  OTHER: "Other",
};

export function CompanyTypeBadge({ type }: CompanyTypeBadgeProps) {
  const color = type ? TYPE_COLORS[type] ?? "#6b7280" : "#6b7280";
  const label = type ? (TYPE_LABELS[type] ?? type) : "No type";

  return (
    <Badge variant="outline" style={{ borderColor: color, color }}>
      {label}
    </Badge>
  );
}

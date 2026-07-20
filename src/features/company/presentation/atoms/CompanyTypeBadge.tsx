import { Badge } from "@/components/ui/badge";

interface CompanyTypeBadgeProps {
  type: string | null | undefined;
}

// Colores desde tokens CSS compartidos (--badge-*), no hex crudo: ver globals.css.
export const TYPE_COLORS: Record<string, string> = {
  SUBCONTRACTOR: "hsl(var(--badge-blue))",
  GENERAL_CONTRACTOR: "hsl(var(--badge-green))",
  SUPPLIER: "hsl(var(--badge-amber))",
  HOA: "hsl(var(--badge-violet))",
  DESIGN: "hsl(var(--badge-neutral))",
  OTHER: "hsl(var(--badge-neutral))",
};

export const TYPE_LABELS: Record<string, string> = {
  SUBCONTRACTOR: "Subcontractor",
  GENERAL_CONTRACTOR: "Contractor",
  SUPPLIER: "Supplier",
  HOA: "HOA",
  DESIGN: "Design",
  OTHER: "Other",
};

export function CompanyTypeBadge({ type }: CompanyTypeBadgeProps) {
  const color = type ? TYPE_COLORS[type] ?? "hsl(var(--badge-neutral))" : "hsl(var(--badge-neutral))";
  const label = type ? (TYPE_LABELS[type] ?? type) : "No type";

  return (
    <Badge variant="outline" style={{ borderColor: color, color }}>
      {label}
    </Badge>
  );
}

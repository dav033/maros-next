import { Badge } from "@/shared/ui";
import type { BadgeVariant } from "@/shared/ui";

interface CompanyTypeBadgeProps {
  type: string | null | undefined;
}

const TYPE_VARIANTS: Record<string, BadgeVariant> = {
  SUBCONTRACTOR: "primary",
  GENERAL_CONTRACTOR: "success",
  SUPPLIER: "warning",
  HOA: "purple",
  OTHER: "secondary",
};

export function CompanyTypeBadge({ type }: CompanyTypeBadgeProps) {
  const variant = type ? TYPE_VARIANTS[type] ?? "gray" : "gray";
  const label = type ?? "No type";

  return (
    <Badge variant={variant} size="sm">
      {label}
    </Badge>
  );
}

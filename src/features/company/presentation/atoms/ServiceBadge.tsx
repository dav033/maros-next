import { Badge } from "@/shared/ui";

export interface ServiceBadgeProps {
  service: {
    id: number;
    name: string;
    color?: string | null;
  };
}

export function ServiceBadge({ service }: ServiceBadgeProps) {
  const color = service.color || "#000000";
  
  return (
    <Badge
      size="sm"
      dot
      dotColor={color}
      customColor={color === "#000000" ? "#9ca3af" : color}
      customBgColor={`${color}20`}
    >
      {service.name}
    </Badge>
  );
}

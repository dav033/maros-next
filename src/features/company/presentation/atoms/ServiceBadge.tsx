import { Badge } from "@/components/ui/badge";

export interface ServiceBadgeProps {
  service: {
    id: number;
    name: string;
    color?: string | null;
  };
}

export function ServiceBadge({ service }: ServiceBadgeProps) {
  const color = service.color || "#9ca3af";
  
  return (
    <Badge
      variant="outline"
      className="gap-1.5 text-xs"
      style={{ borderColor: color, color }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {service.name}
    </Badge>
  );
}
